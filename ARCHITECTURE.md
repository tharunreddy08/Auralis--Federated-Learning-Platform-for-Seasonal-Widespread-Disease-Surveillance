# Auralis - System Architecture

## Overview

Auralis is a federated learning platform that enables multiple hospitals to collaboratively train AI models for disease prediction while maintaining complete data privacy. This document explains the system architecture and key components.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Dashboard │  │Hospitals │  │Prediction│  │  Alerts  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST API
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Federated Learning Engine                    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐      │   │
│  │  │  Hospital  │  │  Hospital  │  │  Hospital  │      │   │
│  │  │     1      │  │     2      │  │     3      │      │   │
│  │  │   Model    │  │   Model    │  │   Model    │      │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘      │   │
│  │        │                │                │           │   │
│  │        └────────────────┼────────────────┘           │   │
│  │                         ▼                            │   │
│  │                  ┌─────────────┐                     │   │
│  │                  │   Global    │                     │   │
│  │                  │   Model     │                     │   │
│  │                  └─────────────┘                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Disease Prediction Engine                     │  │
│  │  - Random Forest Classifier                           │  │
│  │  - Feature Engineering                                │  │
│  │  - Explainable AI (Feature Importance)               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Alert Detection System                        │  │
│  │  - Temporal Analysis                                  │  │
│  │  - Threshold-based Detection                          │  │
│  │  - Severity Classification                            │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Database (PostgreSQL/Supabase)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Hospitals │  │  Cases   │  │Predictions│ │  Alerts  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐                                │
│  │  Model   │  │  Global  │                                │
│  │ Updates  │  │  Models  │                                │
│  └──────────┘  └──────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

## Federated Learning Workflow

### Step 1: Local Training
```
Hospital 1              Hospital 2              Hospital 3
    │                       │                       │
    ▼                       ▼                       ▼
┌─────────┐           ┌─────────┐           ┌─────────┐
│ Local   │           │ Local   │           │ Local   │
│ Data    │           │ Data    │           │ Data    │
│ (150    │           │ (150    │           │ (150    │
│ cases)  │           │ cases)  │           │ cases)  │
└────┬────┘           └────┬────┘           └────┬────┘
     │                     │                     │
     ▼                     ▼                     ▼
┌─────────┐           ┌─────────┐           ┌─────────┐
│  Train  │           │  Train  │           │  Train  │
│  Local  │           │  Local  │           │  Local  │
│  Model  │           │  Model  │           │  Model  │
└────┬────┘           └────┬────┘           └────┬────┘
     │                     │                     │
     ▼                     ▼                     ▼
┌─────────┐           ┌─────────┐           ┌─────────┐
│ Model   │           │ Model   │           │ Model   │
│ Weights │           │ Weights │           │ Weights │
└─────────┘           └─────────┘           └─────────┘
```

### Step 2: Weight Aggregation
```
     Model W1            Model W2            Model W3
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
                    ┌────────────────┐
                    │   Federated    │
                    │   Averaging    │
                    │                │
                    │ Global_W =     │
                    │ (W1+W2+W3)/3   │
                    └────────┬───────┘
                             ▼
                    ┌────────────────┐
                    │  Global Model  │
                    │   Weights      │
                    └────────────────┘
```

### Step 3: Global Model Distribution
```
                    ┌────────────────┐
                    │  Global Model  │
                    └────────┬───────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
    Hospital 1          Hospital 2          Hospital 3
    (can use           (can use           (can use
     global             global             global
     model)             model)             model)
```

## Key Privacy Features

### 1. Data Isolation
- Patient data **NEVER** leaves the hospital
- Each hospital maintains its own local database
- Only aggregated model parameters are shared

### 2. Differential Privacy (Conceptual)
- Individual patient data cannot be reverse-engineered from model weights
- Aggregation provides inherent privacy protection
- No raw data exchange between hospitals

### 3. Secure Aggregation
- Only model weights (numerical arrays) are transmitted
- No patient identifiers, symptoms, or case details shared
- Central server only sees aggregated results

## Data Flow

### Training Flow
```
1. User clicks "Run Federated Learning"
         ↓
2. Backend receives training request
         ↓
3. For each hospital:
   a. Fetch local cases from database
   b. Prepare features (symptoms, temp, humidity)
   c. Train Random Forest model
   d. Extract model weights
   e. Store weights in model_updates table
         ↓
4. Aggregate all hospital weights
         ↓
5. Create global model
         ↓
6. Store global model in global_models table
         ↓
7. Return training statistics to frontend
```

### Prediction Flow
```
1. User inputs symptoms + environmental data
         ↓
2. Frontend sends prediction request
         ↓
3. Backend loads global model weights
         ↓
4. Prepare feature vector from input
         ↓
5. Apply model weights to features
         ↓
6. Calculate disease probabilities
         ↓
7. Compute feature importance
         ↓
8. Store prediction in predictions table
         ↓
9. Return prediction + explanation to frontend
```

### Alert Detection Flow
```
1. Scheduled job or manual trigger
         ↓
2. Query cases from last 7 days
         ↓
3. Group by location and disease
         ↓
4. Compare counts to threshold (20 cases)
         ↓
5. For cases exceeding threshold:
   a. Calculate severity (low/medium/high/critical)
   b. Create alert record
   c. Set status to "active"
         ↓
6. Store alerts in alerts table
         ↓
7. Return created alerts
```

## Database Schema

### Core Tables

1. **hospitals**
   - Stores hospital information
   - Tracks trust score and total cases

2. **disease_cases**
   - Local hospital case records
   - Includes symptoms, environmental data
   - Patient demographics

3. **model_updates**
   - Tracks each hospital's model updates
   - Stores weights, accuracy, loss per round

4. **global_models**
   - Aggregated global model per round
   - Stores combined weights and accuracy

5. **predictions**
   - User predictions history
   - Stores input, output, and explanations

6. **alerts**
   - Outbreak alerts
   - Tracks severity, status, location

## Machine Learning Pipeline

### Feature Engineering
```
Input Features (22 total):
├── Symptom Features (18)
│   ├── fever: 0 or 1
│   ├── cough: 0 or 1
│   ├── fatigue: 0 or 1
│   └── ... (15 more symptoms)
├── Environmental Features (2)
│   ├── temperature: continuous (°C)
│   └── humidity: continuous (%)
└── Patient Demographics (2)
    ├── age: continuous (years)
    └── gender: 0 or 1 (binary)
```

### Model Architecture
```
Random Forest Classifier
├── n_estimators: 100 trees
├── max_depth: 10
├── Features: 22 input features
└── Output Classes: 6 diseases
    ├── flu
    ├── dengue
    ├── malaria
    ├── covid
    ├── common_cold
    └── typhoid
```

### Training Process
```
1. Data Preparation
   ├── Load cases from database
   ├── Extract symptoms (one-hot encoding)
   ├── Normalize temperature and humidity
   └── Split into train/test (80/20)

2. Model Training
   ├── Fit Random Forest on training data
   ├── Validate on test data
   └── Extract feature importances

3. Weight Extraction
   ├── Get feature importances
   ├── Get class labels
   └── Serialize to JSON

4. Federated Aggregation
   ├── Collect weights from all hospitals
   ├── Average feature importances
   └── Create global model
```

## Alert Detection Algorithm

```python
def detect_alerts():
    # Get cases from last 7 days
    recent_cases = get_cases(last_7_days)

    # Group by location and disease
    grouped = group_by(recent_cases, ['location', 'disease'])

    # Check thresholds
    for location, disease, count in grouped:
        if count > THRESHOLD:
            severity = calculate_severity(count, THRESHOLD)
            create_alert(location, disease, count, severity)
```

### Severity Classification
- **Low**: 20-25 cases (5-25% above threshold)
- **Medium**: 26-30 cases (26-50% above threshold)
- **High**: 31-40 cases (51-100% above threshold)
- **Critical**: 40+ cases (>100% above threshold)

## Scalability Considerations

### Current Implementation
- 3 hospitals
- ~450 total cases
- Single-round federated learning
- In-memory model aggregation

### Production Scaling
- Support 100+ hospitals
- Millions of cases
- Multi-round federated learning
- Distributed model aggregation
- Asynchronous training
- Model versioning
- Rollback capabilities

## Security Measures

### Current
- Row Level Security (RLS) on database
- CORS protection
- Input validation
- Data isolation

### Production Requirements
- JWT authentication
- Role-based access control (RBAC)
- API rate limiting
- Encrypted data transmission (HTTPS)
- Audit logging
- HIPAA compliance
- Differential privacy algorithms

## Technology Choices

### Frontend: React + TypeScript
- **Why**: Type safety, component reusability, large ecosystem
- **Trade-offs**: Larger bundle size vs vanilla JS

### Backend: FastAPI
- **Why**: High performance, automatic API docs, async support
- **Trade-offs**: Python ecosystem vs Go/Rust performance

### Database: PostgreSQL (Supabase)
- **Why**: ACID compliance, JSON support, mature ecosystem
- **Trade-offs**: Vertical scaling limits vs NoSQL horizontal scaling

### ML: Scikit-learn
- **Why**: Simple API, well-tested, good for tabular data
- **Trade-offs**: Limited deep learning vs TensorFlow/PyTorch

## Future Enhancements

1. **Advanced FL Algorithms**
   - FedProx (handling heterogeneous data)
   - FedAvg with momentum
   - Personalized federated learning

2. **Deep Learning Models**
   - LSTM for time-series prediction
   - CNNs for medical imaging (if applicable)
   - Transformer models for symptom analysis

3. **Privacy Enhancements**
   - Secure multi-party computation (SMPC)
   - Homomorphic encryption
   - Differential privacy with epsilon bounds

4. **Real-time Processing**
   - WebSocket connections for live updates
   - Stream processing for continuous learning
   - Real-time alert notifications

5. **Geographic Analysis**
   - Interactive maps with heatmaps
   - Spatial clustering algorithms
   - Movement pattern analysis

## Conclusion

Auralis demonstrates a practical implementation of federated learning for healthcare surveillance. The architecture prioritizes data privacy while maintaining model accuracy, showcasing how AI can be deployed in sensitive domains without compromising patient confidentiality.
