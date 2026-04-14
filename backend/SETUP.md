# Backend Setup Guide

This backend runs on Node.js, Express, and MongoDB.

## Install

```bash
cd backend
npm install
```

## Configure Environment

Create backend/.env (or copy backend/.env.example):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auralis
```

For MongoDB Atlas, set MONGODB_URI to your cluster string.

## Run Backend

```bash
cd backend
npm run dev
```

Default URLs:
- API base: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## Seed Data (Optional)

```bash
cd backend
npm run seed
```

The app also auto-seeds if collections are empty.

## Backend Structure

```text
backend/
  .env.example
  package.json
  server.js
  src/
    app.js
    server.js
    config/
      db.js
    constants/
      enums.js
    data/
      seedData.js
      seedIfEmpty.js
    middleware/
      errorHandler.js
    models/
      DiseaseAlert.js
      Hospital.js
      ModelUpdate.js
      PatientData.js
      Prediction.js
      index.js
    routes/
      createCrudRouter.js
      index.js
    scripts/
      seed.js
```
