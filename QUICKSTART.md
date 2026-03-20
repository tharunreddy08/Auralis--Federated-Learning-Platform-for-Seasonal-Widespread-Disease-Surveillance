# Auralis - Quick Start Guide

Get Auralis up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed
- Supabase database configured (already done)

## Quick Setup

### Step 1: Install Backend Dependencies

```bash
cd backend
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
cd ..
```

### Step 2: Seed the Database

```bash
cd backend
python seed_data.py
```

You should see:
```
Clearing existing data...
Seeding hospitals...
Generating disease cases...
Generating alerts...
✅ Data seeding completed successfully!
```

### Step 3: Start the Backend

In the `backend` directory:
```bash
python main.py
```

The backend will start at `http://localhost:8000`

You can view the API documentation at `http://localhost:8000/docs`

### Step 4: Start the Frontend

Open a new terminal and run:
```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

## First Steps

1. **Open the application** at `http://localhost:5173`

2. **View the Dashboard** - You'll see:
   - Total hospitals: 3
   - Total cases: 450
   - Disease trends and distribution charts

3. **Run Federated Learning**:
   - Go to "Hospital Simulation"
   - Click "Run Federated Learning"
   - Watch the training process
   - See the global model accuracy

4. **Make a Prediction**:
   - Go to "Prediction"
   - Select symptoms like: fever, cough, fatigue
   - Set temperature: 38.5°C
   - Set humidity: 70%
   - Click "Predict Disease"
   - View the results with explainability

5. **Check Alerts**:
   - Go to "Alerts"
   - View active outbreak alerts
   - Filter by status (active/resolved)

## Troubleshooting

### Backend won't start?
- Make sure you're in the virtual environment
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify the `.env` file has Supabase credentials

### Frontend won't build?
- Run `npm install` to ensure all dependencies are installed
- Clear the cache: `rm -rf node_modules && npm install`

### No data showing?
- Make sure you ran `python seed_data.py`
- Check that the backend is running at `http://localhost:8000`
- Try reseeding: `cd backend && python seed_data.py`

### Prediction not working?
- You must run federated learning first!
- Go to "Hospital Simulation" → Click "Run Federated Learning"
- Wait for training to complete
- Then try making a prediction

## API Testing

You can test the API directly:

```bash
# Get all hospitals
curl http://localhost:8000/api/hospitals

# Get dashboard stats
curl http://localhost:8000/api/dashboard/stats

# Run federated learning
curl -X POST http://localhost:8000/api/federated-learning/train \
  -H "Content-Type: application/json" \
  -d '{"round_number": 1, "epochs": 10}'

# Make a prediction
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough", "fatigue"],
    "temperature": 38.5,
    "humidity": 70,
    "location": "New York"
  }'
```

## Next Steps

- Explore different disease predictions with various symptom combinations
- Run multiple federated learning rounds to see model improvement
- Monitor alerts and outbreak patterns
- Review feature importance to understand AI decision-making

## Support

For detailed documentation, see the main README.md file.

Enjoy exploring Auralis!
