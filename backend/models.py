from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime

class Hospital(BaseModel):
    id: Optional[str] = None
    name: str
    location: str
    trust_score: float = Field(default=0.85, ge=0, le=1)
    total_cases: int = 0
    created_at: Optional[datetime] = None

class DiseaseCase(BaseModel):
    id: Optional[str] = None
    hospital_id: str
    disease: str
    symptoms: List[str]
    temperature: float
    humidity: float
    date: date
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    created_at: Optional[datetime] = None

class PredictionInput(BaseModel):
    symptoms: List[str]
    temperature: float
    humidity: float
    location: str

class PredictionOutput(BaseModel):
    predicted_disease: str
    risk_score: float
    confidence: float
    explanation: Dict[str, Any]
    created_at: Optional[datetime] = None

class Alert(BaseModel):
    id: Optional[str] = None
    hospital_id: Optional[str] = None
    location: str
    disease: str
    case_count: int
    threshold: int
    severity: str
    status: str = "active"
    alert_date: date
    created_at: Optional[datetime] = None


class RiskMapPoint(BaseModel):
    zone: str
    lat: float
    lng: float
    risk_level: str  # "Low" | "Medium" | "High" | "Critical"
    cases: int

class ModelUpdate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    id: Optional[str] = None
    hospital_id: str
    round_number: int
    model_weights: Dict[str, Any]
    accuracy: Optional[float] = None
    loss: Optional[float] = None
    samples_trained: Optional[int] = None
    created_at: Optional[datetime] = None

class GlobalModel(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    id: Optional[str] = None
    round_number: int
    model_weights: Dict[str, Any]
    accuracy: Optional[float] = None
    participating_hospitals: int
    created_at: Optional[datetime] = None

class FederatedLearningRequest(BaseModel):
    round_number: int = 1
    epochs: int = 10

class TrainingStats(BaseModel):
    hospital_id: str
    hospital_name: str
    samples_trained: int
    accuracy: float
    loss: float
