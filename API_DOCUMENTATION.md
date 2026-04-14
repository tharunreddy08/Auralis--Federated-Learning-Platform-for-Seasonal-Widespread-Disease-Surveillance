# Auralis API Documentation

Base URL: `http://localhost:8000`

Interactive API docs: `http://localhost:8000/docs`

## Overview

The Auralis API provides endpoints for federated learning, disease prediction, outbreak monitoring, and hospital data management. All endpoints return JSON responses.

## Authentication

Currently, the API is open for demo purposes. In production, you would implement proper authentication.

## Endpoints

### Health Check

#### GET `/`
Check if the API is running.

**Response:**
```json
{
  "message": "Auralis API - Federated Learning Disease Surveillance Platform",
  "version": "1.0.0",
  "status": "running"
}
```

---

## Hospitals

### GET `/api/hospitals`
Get all hospitals in the federated network.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Central Medical Center",
    "location": "New York",
    "trust_score": 0.92,
    "total_cases": 150,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### GET `/api/hospitals/{hospital_id}/cases`
Get disease cases for a specific hospital.

**Parameters:**
- `hospital_id` (path): Hospital UUID
- `limit` (query, optional): Max number of cases (default: 100)

**Response:**
```json
[
  {
    "id": "uuid",
    "hospital_id": "uuid",
    "disease": "flu",
    "symptoms": ["fever", "cough", "fatigue"],
    "temperature": 38.5,
    "humidity": 65.0,
    "date": "2024-01-15",
    "patient_age": 35,
    "patient_gender": "male",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## Disease Cases

### GET `/api/disease-cases`
Get all disease cases across all hospitals.

**Parameters:**
- `limit` (query, optional): Max number of cases (default: 100)
- `disease` (query, optional): Filter by disease name

**Response:**
```json
[
  {
    "id": "uuid",
    "hospital_id": "uuid",
    "disease": "dengue",
    "symptoms": ["fever", "joint_pain", "rash"],
    "temperature": 39.2,
    "humidity": 80.0,
    "date": "2024-01-20",
    "patient_age": 28,
    "patient_gender": "female",
    "created_at": "2024-01-20T14:22:00Z"
  }
]
```

### GET `/api/disease-cases/stats`
Get aggregated statistics for all disease cases.

**Response:**
```json
{
  "total_cases": 450,
  "by_disease": {
    "flu": 120,
    "dengue": 85,
    "malaria": 70,
    "covid": 95,
    "common_cold": 50,
    "typhoid": 30
  },
  "by_hospital": {
    "uuid1": 150,
    "uuid2": 150,
    "uuid3": 150
  },
  "trend_data": [
    {
      "date": "2024-01-15",
      "disease": "flu",
      "count": 12
    }
  ]
}
```

---

## Federated Learning

### POST `/api/federated-learning/train`
Run a federated learning training round across all hospitals.

**Request Body:**
```json
{
  "round_number": 1,
  "epochs": 10
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Federated learning round 1 completed",
  "result": {
    "round_number": 1,
    "global_accuracy": 0.87,
    "participating_hospitals": 3,
    "training_stats": [
      {
        "hospital_id": "uuid",
        "hospital_name": "Central Medical Center",
        "samples_trained": 120,
        "accuracy": 0.89,
        "loss": 0.11
      }
    ],
    "global_weights": {
      "n_estimators": 100,
      "feature_importances": [0.05, 0.12, ...],
      "classes": ["flu", "dengue", "malaria", "covid", "common_cold", "typhoid"],
      "n_features": 22
    }
  }
}
```

### GET `/api/federated-learning/status`
Get the current status of federated learning.

**Response:**
```json
{
  "current_round": {
    "id": "uuid",
    "round_number": 1,
    "accuracy": 0.87,
    "participating_hospitals": 3,
    "created_at": "2024-01-20T15:00:00Z"
  },
  "recent_updates": [...],
  "total_hospitals": 3,
  "status": "trained"
}
```

---

## Predictions

### POST `/api/predict`
Predict disease based on symptoms and environmental factors.

**Request Body:**
```json
{
  "symptoms": ["fever", "cough", "fatigue"],
  "temperature": 38.5,
  "humidity": 70,
  "location": "New York"
}
```

**Response:**
```json
{
  "predicted_disease": "flu",
  "risk_score": 0.82,
  "confidence": 0.82,
  "all_probabilities": {
    "flu": 0.82,
    "covid": 0.12,
    "common_cold": 0.04,
    "dengue": 0.01,
    "malaria": 0.005,
    "typhoid": 0.005
  },
  "explanation": {
    "fever": 0.15,
    "cough": 0.12,
    "fatigue": 0.08,
    "temperature": 0.10,
    "humidity": 0.05
  }
}
```

### GET `/api/predictions`
Get recent prediction history.

**Parameters:**
- `limit` (query, optional): Max number of predictions (default: 50)

**Response:**
```json
[
  {
    "id": "uuid",
    "symptoms": ["fever", "cough"],
    "temperature": 38.5,
    "humidity": 70,
    "location": "New York",
    "predicted_disease": "flu",
    "risk_score": 0.82,
    "confidence": 0.82,
    "explanation": {...},
    "created_at": "2024-01-20T16:30:00Z"
  }
]
```

---

## Alerts

### GET `/api/alerts`
Get outbreak alerts.

**Parameters:**
- `status` (query, optional): Filter by status ("active" or "resolved")

**Response:**
```json
[
  {
    "id": "uuid",
    "hospital_id": "uuid",
    "location": "New York",
    "disease": "flu",
    "case_count": 35,
    "threshold": 20,
    "severity": "high",
    "status": "active",
    "alert_date": "2024-01-20",
    "created_at": "2024-01-20T08:00:00Z"
  }
]
```

### POST `/api/alerts/detect`
Manually trigger alert detection.

**Response:**
```json
{
  "status": "success",
  "alerts_created": 2,
  "alerts": [...]
}
```

---

## Dashboard

### GET `/api/dashboard/stats`
Get comprehensive dashboard statistics.

**Response:**
```json
{
  "total_hospitals": 3,
  "total_cases": 450,
  "active_alerts": 5,
  "model_accuracy": 0.87,
  "disease_distribution": {
    "flu": 120,
    "dengue": 85,
    "malaria": 70,
    "covid": 95,
    "common_cold": 50,
    "typhoid": 30
  },
  "recent_cases_count": 95,
  "trend_data": [
    {
      "date": "2024-01-10",
      "count": 15
    }
  ]
}
```

---

## Utilities

### POST `/api/seed-data`
Seed the database with dummy data (for development/testing).

**Response:**
```json
{
  "status": "success",
  "message": "Database seeded successfully"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. In production, implement rate limiting for security.

## CORS

CORS is enabled for all origins in development. In production, restrict to specific domains.

---

## Workflow Example

1. **Seed the database:**
   ```bash
   POST /api/seed-data
   ```

2. **Train the federated model:**
   ```bash
   POST /api/federated-learning/train
   {
     "round_number": 1,
     "epochs": 10
   }
   ```

3. **Make a prediction:**
   ```bash
   POST /api/predict
   {
     "symptoms": ["fever", "cough"],
     "temperature": 38.5,
     "humidity": 70,
     "location": "New York"
   }
   ```

4. **Check for alerts:**
   ```bash
   GET /api/alerts?status=active
   ```

5. **View dashboard stats:**
   ```bash
   GET /api/dashboard/stats
   ```

---

## Support

For interactive API exploration, visit: `http://localhost:8000/docs`

For issues, refer to the main README.md or open an issue.
