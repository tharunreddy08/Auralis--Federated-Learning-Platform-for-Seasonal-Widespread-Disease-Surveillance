from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from datetime import datetime, timedelta, date
import json
import random

from models import (
    Hospital, DiseaseCase, PredictionInput, PredictionOutput,
    Alert, FederatedLearningRequest, TrainingStats, RiskMapPoint
)
from database import supabase, is_supabase_available
import local_fallback
from federated_learning import fl_engine
from seed_data import seed_all_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    if supabase is None:
        print("INFO: API running in local demo mode (no Supabase client).")
    elif not is_supabase_available():
        print(
            "WARNING: Supabase is unreachable. "
            "DB-backed routes will fall back to demo data when queries fail."
        )
    yield


app = FastAPI(
    title="Auralis - Federated Learning Disease Surveillance",
    description="Privacy-preserving disease prediction and outbreak monitoring platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Auralis API - Federated Learning Disease Surveillance Platform",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/hospitals", response_model=List[Dict[str, Any]])
async def get_hospitals():
    """Get all hospitals in the network"""
    if supabase is None:
        return local_fallback.demo_hospitals()
    try:
        response = supabase.table('hospitals').select('*').execute()
        return response.data
    except Exception as e:
        print(f"get_hospitals DB error: {e}")
        return local_fallback.demo_hospitals()

@app.get("/api/hospitals/{hospital_id}/cases")
async def get_hospital_cases(hospital_id: str, limit: int = 100):
    """Get disease cases for a specific hospital"""
    if supabase is None:
        return local_fallback.demo_hospital_cases(hospital_id, limit)
    try:
        response = supabase.table('disease_cases')\
            .select('*')\
            .eq('hospital_id', hospital_id)\
            .order('date', desc=True)\
            .limit(limit)\
            .execute()
        return response.data
    except Exception as e:
        print(f"get_hospital_cases DB error: {e}")
        return local_fallback.demo_hospital_cases(hospital_id, limit)

@app.get("/api/disease-cases")
async def get_all_cases(limit: int = 100, disease: str = None):
    """Get all disease cases, optionally filtered by disease"""
    if supabase is None:
        return local_fallback.demo_all_cases(limit, disease)
    try:
        query = supabase.table('disease_cases').select('*')

        if disease:
            query = query.eq('disease', disease)

        response = query.order('date', desc=True).limit(limit).execute()
        return response.data
    except Exception as e:
        print(f"get_all_cases DB error: {e}")
        return local_fallback.demo_all_cases(limit, disease)

@app.get("/api/disease-cases/stats")
async def get_disease_stats():
    """Get aggregated disease statistics"""
    if supabase is None:
        return local_fallback.demo_disease_stats()
    try:
        response = supabase.table('disease_cases').select('disease, hospital_id, date').execute()

        if not response.data:
            return {
                'total_cases': 0,
                'by_disease': {},
                'by_hospital': {},
                'trend_data': []
            }

        cases = response.data

        disease_counts = {}
        hospital_counts = {}

        for case in cases:
            disease = case['disease']
            hospital_id = case['hospital_id']

            disease_counts[disease] = disease_counts.get(disease, 0) + 1
            hospital_counts[hospital_id] = hospital_counts.get(hospital_id, 0) + 1

        from collections import defaultdict
        date_disease_counts = defaultdict(lambda: defaultdict(int))

        for case in cases:
            date_disease_counts[case['date']][case['disease']] += 1

        trend_data = []
        for date_str in sorted(date_disease_counts.keys()):
            for disease, count in date_disease_counts[date_str].items():
                trend_data.append({
                    'date': date_str,
                    'disease': disease,
                    'count': count
                })

        return {
            'total_cases': len(cases),
            'by_disease': disease_counts,
            'by_hospital': hospital_counts,
            'trend_data': trend_data
        }
    except Exception as e:
        print(f"get_disease_stats DB error: {e}")
        return local_fallback.demo_disease_stats()

@app.post("/api/federated-learning/train")
async def run_federated_learning(request: FederatedLearningRequest, background_tasks: BackgroundTasks):
    """
    Run a federated learning round across all hospitals
    """
    try:
        result = await fl_engine.run_federated_round(
            round_number=request.round_number,
            epochs=request.epochs
        )

        background_tasks.add_task(detect_and_create_alerts)

        return {
            "status": "success",
            "message": f"Federated learning round {request.round_number} completed",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@app.get("/api/federated-learning/status")
async def get_fl_status():
    """Get the current status of federated learning"""
    if supabase is None:
        return local_fallback.demo_fl_status()
    try:
        global_response = supabase.table('global_models')\
            .select('*')\
            .order('round_number', desc=True)\
            .limit(1)\
            .execute()

        updates_response = supabase.table('model_updates')\
            .select('*')\
            .order('created_at', desc=True)\
            .limit(10)\
            .execute()

        hospitals_response = supabase.table('hospitals').select('*').execute()

        current_round = global_response.data[0] if global_response.data else None

        return {
            'current_round': current_round,
            'recent_updates': updates_response.data,
            'total_hospitals': len(hospitals_response.data),
            'status': 'trained' if current_round else 'not_trained'
        }
    except Exception as e:
        print(f"get_fl_status DB error: {e}")
        return local_fallback.demo_fl_status()

@app.post("/api/predict", response_model=Dict[str, Any])
async def predict_disease(input_data: PredictionInput):
    """
    Predict disease based on symptoms and environmental factors
    """
    try:
        prediction = fl_engine.predict(
            symptoms=input_data.symptoms,
            temperature=input_data.temperature,
            humidity=input_data.humidity
        )

        prediction_record = {
            'symptoms': input_data.symptoms,
            'temperature': input_data.temperature,
            'humidity': input_data.humidity,
            'location': input_data.location,
            'predicted_disease': prediction['predicted_disease'],
            'risk_score': prediction['risk_score'],
            'confidence': prediction['confidence'],
            'explanation': prediction['explanation']
        }

        if supabase is not None:
            try:
                supabase.table('predictions').insert(prediction_record).execute()
            except Exception as log_err:
                print(f"prediction not persisted (DB): {log_err}")

        return prediction
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/predictions")
async def get_predictions(limit: int = 50):
    """Get recent predictions"""
    if supabase is None:
        return local_fallback.demo_predictions(limit)
    try:
        response = supabase.table('predictions')\
            .select('*')\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        return response.data
    except Exception as e:
        print(f"get_predictions DB error: {e}")
        return local_fallback.demo_predictions(limit)

@app.get("/api/alerts")
async def get_alerts(status: str = None):
    """Get alerts, optionally filtered by status"""
    if supabase is None:
        return local_fallback.demo_alerts(status)
    try:
        query = supabase.table('alerts').select('*')

        if status:
            query = query.eq('status', status)

        response = query.order('alert_date', desc=True).execute()
        return response.data
    except Exception as e:
        print(f"get_alerts DB error: {e}")
        return local_fallback.demo_alerts(status)

@app.post("/api/alerts/detect")
async def detect_alerts():
    """Detect and create new alerts based on case patterns"""
    try:
        alerts = await detect_and_create_alerts()
        return {
            "status": "success",
            "alerts_created": len(alerts),
            "alerts": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def detect_and_create_alerts():
    """Background task to detect outbreaks and create alerts"""
    if supabase is None:
        return []
    try:
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=7)

        response = supabase.table('disease_cases')\
            .select('*')\
            .gte('date', start_date.isoformat())\
            .lte('date', end_date.isoformat())\
            .execute()

        cases = response.data

        if not cases:
            return []

        from collections import defaultdict
        disease_location_counts = defaultdict(lambda: defaultdict(int))

        hospitals_response = supabase.table('hospitals').select('*').execute()
        hospital_locations = {h['id']: h['location'] for h in hospitals_response.data}

        for case in cases:
            location = hospital_locations.get(case['hospital_id'], 'Unknown')
            disease_location_counts[location][case['disease']] += 1

        threshold = 20
        new_alerts = []

        for location, disease_counts in disease_location_counts.items():
            for disease, count in disease_counts.items():
                if count > threshold:
                    severity = 'low'
                    if count > 40:
                        severity = 'critical'
                    elif count > 30:
                        severity = 'high'
                    elif count > 25:
                        severity = 'medium'

                    existing_alert = supabase.table('alerts')\
                        .select('*')\
                        .eq('location', location)\
                        .eq('disease', disease)\
                        .eq('status', 'active')\
                        .gte('alert_date', start_date.isoformat())\
                        .execute()

                    if not existing_alert.data:
                        alert_data = {
                            'location': location,
                            'disease': disease,
                            'case_count': count,
                            'threshold': threshold,
                            'severity': severity,
                            'status': 'active',
                            'alert_date': end_date.isoformat()
                        }

                        result = supabase.table('alerts').insert(alert_data).execute()
                        new_alerts.append(result.data[0])

        return new_alerts

    except Exception as e:
        print(f"Error detecting alerts: {str(e)}")
        return []

@app.post("/api/seed-data")
async def seed_data():
    """Seed the database with initial data"""
    if supabase is None:
        return {
            "status": "skipped",
            "message": "Supabase is not configured. Seeding is only available when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.",
        }
    try:
        success = seed_all_data()
        if success:
            return {"status": "success", "message": "Database seeded successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to seed data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get comprehensive dashboard statistics"""
    if supabase is None:
        return local_fallback.demo_dashboard_stats()
    try:
        hospitals = supabase.table('hospitals').select('*').execute()
        cases = supabase.table('disease_cases').select('*').execute()
        alerts = supabase.table('alerts').select('*').eq('status', 'active').execute()
        global_model = supabase.table('global_models')\
            .select('*')\
            .order('round_number', desc=True)\
            .limit(1)\
            .execute()

        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=30)

        recent_cases = [c for c in cases.data if c['date'] >= start_date.isoformat()]

        disease_counts = {}
        for case in cases.data:
            disease = case['disease']
            disease_counts[disease] = disease_counts.get(disease, 0) + 1

        from collections import defaultdict
        daily_counts = defaultdict(int)
        for case in cases.data:
            daily_counts[case['date']] += 1

        trend_data = [{'date': date, 'count': count} for date, count in sorted(daily_counts.items())]

        return {
            'total_hospitals': len(hospitals.data),
            'total_cases': len(cases.data),
            'active_alerts': len(alerts.data),
            'model_accuracy': global_model.data[0]['accuracy'] if global_model.data else 0,
            'disease_distribution': disease_counts,
            'recent_cases_count': len(recent_cases),
            'trend_data': trend_data[-30:]
        }
    except Exception as e:
        print(f"get_dashboard_stats DB error: {e}")
        return local_fallback.demo_dashboard_stats()


def _risk_level_from_cases(cases: int) -> str:
    # Spec:
    # - Low: cases < 20
    # - Medium: 20–49
    # - High: 50–100
    # - Critical: >100
    if cases < 20:
        return "Low"
    if cases < 50:
        return "Medium"
    if cases <= 100:
        return "High"
    return "Critical"


ZONE_COORDINATES = [
    {"zone": "Chennai North", "lat": 13.0827, "lng": 80.2707},
    {"zone": "Chennai South", "lat": 12.9952, "lng": 80.1940},
    {"zone": "Pune Central", "lat": 18.5204, "lng": 73.8567},
    {"zone": "Pune East", "lat": 18.5590, "lng": 73.8064},
    {"zone": "Bengaluru West", "lat": 12.9762, "lng": 77.6033},
    {"zone": "Bengaluru East", "lat": 12.9716, "lng": 77.5946},
    {"zone": "Hyderabad North", "lat": 17.4065, "lng": 78.4772},
    {"zone": "Hyderabad South", "lat": 17.3850, "lng": 78.4867},
]


def _generate_risk_points(days: int) -> List[RiskMapPoint]:
    # Use a time-bucketed RNG so values change every few seconds,
    # matching the frontend auto-refresh behavior.
    seed_bucket = int(datetime.now().timestamp() // 7)
    rng = random.Random(seed_bucket)

    # Larger time window => higher expected cases.
    multiplier = 1.0 if days <= 7 else 1.4

    points: List[RiskMapPoint] = []
    for z in ZONE_COORDINATES:
        base_cases = rng.randint(5, 140)
        cases = int(min(250, base_cases * multiplier))
        risk_level = _risk_level_from_cases(cases)
        points.append(
            RiskMapPoint(
                zone=z["zone"],
                lat=z["lat"],
                lng=z["lng"],
                risk_level=risk_level,
                cases=cases,
            )
        )
    return points


@app.get("/api/risk-map", response_model=List[RiskMapPoint])
async def get_risk_map(days: int = 7):
    """Return zone-wise risk points for the heatmap."""
    if days <= 0:
        raise HTTPException(status_code=400, detail="days must be a positive integer")
    return _generate_risk_points(days)


@app.get("/risk-map", response_model=List[RiskMapPoint])
async def get_risk_map_public(days: int = 7):
    """Alias for /api/risk-map (kept for spec compatibility)."""
    if days <= 0:
        raise HTTPException(status_code=400, detail="days must be a positive integer")
    return _generate_risk_points(days)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
