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
from database import is_supabase_available
import local_fallback
from federated_learning import fl_engine
from seed_data import seed_all_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("INFO: API running in local demo mode (no external database).")
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
    return local_fallback.demo_hospitals()

@app.get("/api/hospitals/{hospital_id}/cases")
async def get_hospital_cases(hospital_id: str, limit: int = 100):
    """Get disease cases for a specific hospital"""
    return local_fallback.demo_hospital_cases(hospital_id, limit)

@app.get("/api/disease-cases")
async def get_all_cases(limit: int = 100, disease: str = None):
    """Get all disease cases, optionally filtered by disease"""
    return local_fallback.demo_all_cases(limit, disease)

@app.get("/api/disease-cases/stats")
async def get_disease_stats():
    """Get aggregated disease statistics"""
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

        # Note: Predictions are not persisted in local demo mode
        return prediction
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/predictions")
async def get_predictions(limit: int = 50):
    """Get recent predictions"""
    return local_fallback.demo_predictions(limit)

@app.get("/api/alerts")
async def get_alerts(status: str = None):
    """Get alerts, optionally filtered by status"""
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
    # In demo mode, just return empty list (no alerts to create)
    return []

@app.post("/api/seed-data")
async def seed_data():
    """Seed the database with initial data"""
    success = seed_all_data()
    if success:
        return {"status": "success", "message": "Demo data is always available"}
    else:
        return {"status": "error", "message": "Seeding failed"}
            raise HTTPException(status_code=500, detail="Failed to seed data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get comprehensive dashboard statistics"""
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
