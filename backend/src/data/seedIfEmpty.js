import {
  DiseaseAlert,
  Hospital,
  ModelUpdate,
  PatientData,
  Prediction
} from '../models/index.js';
import {
  diseaseAlerts,
  hospitals,
  modelUpdates,
  patientData,
  predictions
} from './seedData.js';

export const seedIfEmpty = async () => {
  const hospitalCount = await Hospital.countDocuments();

  if (hospitalCount > 0) {
    return false;
  }

  await Promise.all([
    DiseaseAlert.insertMany(diseaseAlerts),
    Hospital.insertMany(hospitals),
    ModelUpdate.insertMany(modelUpdates),
    PatientData.insertMany(patientData),
    Prediction.insertMany(predictions)
  ]);

  return true;
};
