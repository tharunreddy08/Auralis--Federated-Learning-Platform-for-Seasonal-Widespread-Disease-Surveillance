import mongoose from 'mongoose';
import { HOSPITAL_STATUSES } from '../constants/enums.js';

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    location: { type: String, required: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    status: { type: String, required: true, enum: HOSPITAL_STATUSES },
    total_patients: { type: Number, default: 0 },
    last_model_update: { type: Date },
    contact_email: { type: String, trim: true, lowercase: true },
    region: { type: String, trim: true }
  },
  { timestamps: true }
);

export const Hospital = mongoose.model('Hospital', hospitalSchema);
