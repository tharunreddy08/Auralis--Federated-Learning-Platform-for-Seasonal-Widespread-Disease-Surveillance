"""
In-memory demo data when Supabase is not configured or unreachable.
Keeps the API and UI usable offline.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional
import uuid

DEMO_HOSPITAL_IDS = [
    "11111111-1111-1111-1111-111111111111",
    "22222222-2222-2222-2222-222222222222",
    "33333333-3333-3333-3333-333333333333",
]

DEMO_HOSPITALS: List[Dict[str, Any]] = [
    {
        "id": DEMO_HOSPITAL_IDS[0],
        "name": "Central Medical Center",
        "location": "New York",
        "trust_score": 0.92,
        "total_cases": 0,
        "created_at": "2026-01-15T12:00:00+00:00",
    },
    {
        "id": DEMO_HOSPITAL_IDS[1],
        "name": "Regional Health Institute",
        "location": "California",
        "trust_score": 0.88,
        "total_cases": 0,
        "created_at": "2026-01-15T12:00:00+00:00",
    },
    {
        "id": DEMO_HOSPITAL_IDS[2],
        "name": "Metropolitan General Hospital",
        "location": "Texas",
        "trust_score": 0.85,
        "total_cases": 0,
        "created_at": "2026-01-15T12:00:00+00:00",
    },
]

_DISEASES = ["flu", "dengue", "malaria", "covid", "common_cold", "typhoid"]
_SYMPTOMS = {
    "flu": ["fever", "cough", "fatigue", "headache"],
    "dengue": ["fever", "joint_pain", "rash", "headache"],
    "malaria": ["fever", "chills", "sweating", "nausea"],
    "covid": ["fever", "cough", "loss_of_taste", "fatigue"],
    "common_cold": ["runny_nose", "sore_throat", "cough"],
    "typhoid": ["fever", "headache", "nausea", "weakness"],
}


def _build_demo_cases() -> List[Dict[str, Any]]:
    cases: List[Dict[str, Any]] = []
    today = date.today()
    i = 0
    for hid in DEMO_HOSPITAL_IDS:
        for d in range(60):
            disease = _DISEASES[(i + d) % len(_DISEASES)]
            day = today - timedelta(days=d % 45)
            cases.append(
                {
                    "id": str(uuid.uuid4()),
                    "hospital_id": hid,
                    "disease": disease,
                    "symptoms": _SYMPTOMS[disease],
                    "temperature": 36.5 + (i % 5) * 0.4,
                    "humidity": 55 + (d % 20),
                    "date": day.isoformat(),
                    "patient_age": 25 + (i % 50),
                    "patient_gender": "male" if i % 2 else "female",
                    "created_at": datetime.utcnow().isoformat() + "+00:00",
                }
            )
            i += 1
            if len(cases) >= 180:
                return cases
    return cases


DEMO_CASES = _build_demo_cases()

for h in DEMO_HOSPITALS:
    h["total_cases"] = sum(1 for c in DEMO_CASES if c["hospital_id"] == h["id"])


def demo_hospitals() -> List[Dict[str, Any]]:
    return [dict(h) for h in DEMO_HOSPITALS]


def demo_hospital_cases(hospital_id: str, limit: int = 100) -> List[Dict[str, Any]]:
    rows = [dict(c) for c in DEMO_CASES if c["hospital_id"] == hospital_id]
    rows.sort(key=lambda x: x["date"], reverse=True)
    return rows[:limit]


def demo_all_cases(limit: int = 100, disease: Optional[str] = None) -> List[Dict[str, Any]]:
    rows = [dict(c) for c in DEMO_CASES]
    if disease:
        rows = [r for r in rows if r["disease"] == disease]
    rows.sort(key=lambda x: x["date"], reverse=True)
    return rows[:limit]


def demo_disease_stats() -> Dict[str, Any]:
    cases = DEMO_CASES
    disease_counts: Dict[str, int] = {}
    hospital_counts: Dict[str, int] = {}
    for case in cases:
        disease_counts[case["disease"]] = disease_counts.get(case["disease"], 0) + 1
        hospital_counts[case["hospital_id"]] = hospital_counts.get(case["hospital_id"], 0) + 1

    date_disease_counts: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for case in cases:
        date_disease_counts[case["date"]][case["disease"]] += 1

    trend_data = []
    for date_str in sorted(date_disease_counts.keys()):
        for dis, count in date_disease_counts[date_str].items():
            trend_data.append({"date": date_str, "disease": dis, "count": count})

    return {
        "total_cases": len(cases),
        "by_disease": disease_counts,
        "by_hospital": hospital_counts,
        "trend_data": trend_data,
    }


def demo_fl_status() -> Dict[str, Any]:
    return {
        "current_round": None,
        "recent_updates": [],
        "total_hospitals": len(DEMO_HOSPITALS),
        "status": "not_trained",
    }


def demo_predictions(limit: int = 50) -> List[Dict[str, Any]]:
    return []


def demo_alerts(status: Optional[str] = None) -> List[Dict[str, Any]]:
    sample = [
        {
            "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            "hospital_id": DEMO_HOSPITAL_IDS[0],
            "location": "New York",
            "disease": "flu",
            "case_count": 28,
            "threshold": 20,
            "severity": "medium",
            "status": "active",
            "alert_date": date.today().isoformat(),
            "created_at": datetime.utcnow().isoformat() + "+00:00",
        }
    ]
    if status:
        return [a for a in sample if a["status"] == status]
    return sample


def demo_dashboard_stats() -> Dict[str, Any]:
    cases = DEMO_CASES
    disease_counts: Dict[str, int] = {}
    for case in cases:
        disease_counts[case["disease"]] = disease_counts.get(case["disease"], 0) + 1

    daily_counts: Dict[str, int] = defaultdict(int)
    for case in cases:
        daily_counts[case["date"]] += 1

    trend_data = [{"date": d, "count": c} for d, c in sorted(daily_counts.items())]
    end_date = date.today()
    start_date = end_date - timedelta(days=30)
    recent_cases = [c for c in cases if c["date"] >= start_date.isoformat()]

    return {
        "total_hospitals": len(DEMO_HOSPITALS),
        "total_cases": len(cases),
        "active_alerts": 1,
        "model_accuracy": 0.85,
        "disease_distribution": disease_counts,
        "recent_cases_count": len(recent_cases),
        "trend_data": trend_data[-30:],
    }
