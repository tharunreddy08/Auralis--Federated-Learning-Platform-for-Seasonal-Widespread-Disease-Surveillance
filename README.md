# Auralis - Federated Learning Disease Surveillance Platform

A privacy-preserving AI-powered disease prediction and outbreak monitoring system that simulates multiple hospitals training models locally and aggregating results centrally without sharing raw patient data.

## Features

### Core Functionality

1. **Multi-Hospital Simulation**
   - Simulates 3 hospitals with separate datasets
   - Each hospital trains a local model independently
   - Synthetic data includes symptoms, temperature, humidity, location, and patient demographics

2. **Federated Learning Engine**
   - Local training at each hospital using Random Forest models
   - Secure aggregation of model weights (not raw data)
   - Global model updates through federated averaging
   - Complete data privacy preservation

3. **Disease Prediction API**
   - Input: symptoms + environmental data (temperature, humidity)
   - Output: predicted disease + risk score + confidence level
   - Real-time predictions using the global federated model

4. **Temporal Analysis**
   - Track disease cases over time with trend visualization
   - Detect outbreak spikes using threshold-based detection
   - Historical data analysis for pattern recognition

5. **Explainable AI**
   - Feature importance visualization showing which symptoms contributed most
   - SHAP-inspired explanation for each prediction
   - Probability distribution across all possible diseases

6. **Interactive Dashboard**
   - Real-time disease trends with line charts
   - Disease distribution visualization with bar and doughnut charts
   - Risk heatmap showing active alerts
   - Key metrics: total hospitals, cases, alerts, model accuracy

7. **Alert System**
   - Automatic outbreak detection when cases exceed thresholds
   - Severity levels: low, medium, high, critical
   - Location-based alerts for targeted response
   - Active/resolved status tracking

8. **Privacy Simulation**
   - Visual demonstration that data stays local
   - Only model weights are shared during federated learning
   - Complete compliance with data privacy regulations

## Tech Stack

### Frontend
- **React** with TypeScript
- **Chart.js** for data visualization
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **FastAPI** (Python) for REST API
- **Scikit-learn** for machine learning models
- **NumPy & Pandas** for data processing
- **Uvicorn** as ASGI server

### Database
- **PostgreSQL** via Supabase
- Row Level Security (RLS) enabled
- Optimized with indexes for performance

### AI/ML
- **Random Forest Classifier** for disease prediction
- **Federated Learning** simulation with weight aggregation
- **Feature Importance** for explainability

## Project Structure

```
auralis/
├── backend/
│   ├── main.py                  # FastAPI application
│   ├── models.py                # Pydantic data models
│   ├── database.py              # Supabase client
│   ├── federated_learning.py   # FL engine and model training
│   ├── seed_data.py             # Data generation script
│   └── requirements.txt         # Python dependencies
├── src/
│   ├── components/
│   │   └── Layout.tsx           # Main layout component
│   ├── pages/
│   │   ├── Dashboard.tsx        # Dashboard with charts
│   │   ├── HospitalSimulation.tsx  # FL simulation panel
│   │   ├── Prediction.tsx       # Disease prediction interface
│   │   └── Alerts.tsx           # Outbreak alerts
│   ├── lib/
│   │   └── api.ts               # API client
│   └── App.tsx                  # Main app component
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Supabase account (database is pre-configured)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Make sure the `.env` file in the project root contains Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Seed the database with initial data:
```bash
python seed_data.py
```

6. Start the FastAPI server:
```bash
python main.py
```

The backend will be running at `http://localhost:8000`

API Documentation available at `http://localhost:8000/docs`

### Frontend Setup

1. Install frontend dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

## Usage Guide

### 1. Dashboard
- View overall statistics: hospitals, cases, alerts, model accuracy
- Analyze disease trends over the last 14 days
- Examine disease distribution across all hospitals

### 2. Hospital Simulation
- Select individual hospitals to view their local data
- See disease distribution per hospital
- Click "Run Federated Learning" to train models across all hospitals
- View training results including accuracy and samples trained
- Observe that only model weights are shared (privacy preservation)

### 3. Prediction
- Select symptoms from the available list
- Input environmental data (temperature, humidity)
- Choose location
- Click "Predict Disease" to get AI-powered prediction
- View risk score, confidence level, and probability distribution
- Examine feature importance to understand which factors influenced the prediction

### 4. Alerts
- View all outbreak alerts
- Filter by status: all, active, or resolved
- See critical alerts highlighted at the top
- Monitor case counts vs thresholds
- Track severity levels for prioritization

## API Endpoints

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/{id}/cases` - Get cases for a specific hospital

### Disease Cases
- `GET /api/disease-cases` - Get all disease cases
- `GET /api/disease-cases/stats` - Get aggregated statistics

### Federated Learning
- `POST /api/federated-learning/train` - Run federated learning round
- `GET /api/federated-learning/status` - Get current FL status

### Predictions
- `POST /api/predict` - Make disease prediction
- `GET /api/predictions` - Get recent predictions

### Alerts
- `GET /api/alerts` - Get all alerts (optional status filter)
- `POST /api/alerts/detect` - Detect and create new alerts

### Utilities
- `POST /api/seed-data` - Seed database with dummy data
- `GET /api/dashboard/stats` - Get dashboard statistics

## Key Concepts

### Federated Learning
Auralis demonstrates federated learning where:
1. Each hospital trains a model on their local data
2. Only model parameters (weights) are sent to the central server
3. The central server aggregates weights using federated averaging
4. A global model is created without any hospital sharing patient data
5. Complete privacy preservation while maintaining model accuracy

### Privacy Preservation
- Patient data never leaves the hospital
- Only aggregated model updates are shared
- No individual patient information in the global model
- Compliant with healthcare data regulations

### Disease Prediction
The system uses Random Forest classifiers trained on:
- Symptoms (18 different symptoms)
- Environmental factors (temperature, humidity)
- Patient demographics (age, gender)

The model outputs:
- Predicted disease
- Risk score (0-1)
- Confidence level
- Feature importance for explainability

### Outbreak Detection
Alerts are triggered when:
- Case count exceeds threshold (default: 20 cases/week)
- Multiple cases cluster in a location
- Unusual spike in disease cases detected

## Development

### Build for Production

Frontend:
```bash
npm run build
```

Backend:
```bash
# The FastAPI app can be deployed with:
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Future Enhancements

- Real-time data streaming from hospitals
- Advanced FL algorithms (FedProx, FedAvg+)
- Deep learning models (LSTM for time series)
- Geographic heatmap visualization
- Mobile app for healthcare workers
- Integration with pharmacy data for early detection
- Multi-language support
- Role-based access control

## License

This project is for demonstration and educational purposes.

## Support

For issues or questions, please open an issue in the repository.
