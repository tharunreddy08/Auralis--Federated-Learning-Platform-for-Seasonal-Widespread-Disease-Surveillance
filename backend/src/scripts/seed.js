import dotenv from 'dotenv';
import { connectDatabase } from '../config/db.js';
import { DiseaseAlert, Hospital, ModelUpdate, PatientData, Prediction } from '../models/index.js';
import { diseaseAlerts, hospitals, modelUpdates, patientData, predictions } from '../data/seedData.js';

dotenv.config();

const runSeed = async () => {
  try {
    await connectDatabase(process.env.MONGODB_URI);

    await Promise.all([
      DiseaseAlert.deleteMany({}),
      Hospital.deleteMany({}),
      ModelUpdate.deleteMany({}),
      PatientData.deleteMany({}),
      Prediction.deleteMany({})
    ]);

    await Promise.all([
      DiseaseAlert.insertMany(diseaseAlerts),
      Hospital.insertMany(hospitals),
      ModelUpdate.insertMany(modelUpdates),
      PatientData.insertMany(patientData),
      Prediction.insertMany(predictions)
    ]);

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

runSeed();
