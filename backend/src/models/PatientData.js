import mongoose from 'mongoose';
import { DISEASES, GENDERS, OUTCOMES, PATIENT_SEVERITIES } from '../constants/enums.js';

const patientDataSchema = new mongoose.Schema(
  {
    hospital_id: { type: String, trim: true },
    hospital_name: { type: String, required: true, trim: true },
    disease: { type: String, required: true, enum: DISEASES },
    age: { type: Number },
    gender: { type: String, enum: GENDERS },
    symptoms: { type: String, trim: true },
    severity: { type: String, required: true, enum: PATIENT_SEVERITIES },
    outcome: { type: String, enum: OUTCOMES },
    report_date: { type: Date, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    region: { type: String, trim: true }
  },
  { timestamps: true }
);

export const PatientData = mongoose.model('PatientData', patientDataSchema);
