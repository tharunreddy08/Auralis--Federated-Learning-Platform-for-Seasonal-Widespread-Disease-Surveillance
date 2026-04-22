import mongoose from 'mongoose';
import { ALERT_SEVERITIES, ALERT_STATUSES, DISEASES } from '../constants/enums.js';

const diseaseAlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    disease: { type: String, required: true, enum: DISEASES },
    severity: { type: String, required: true, enum: ALERT_SEVERITIES },
    region: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    case_count: { type: Number, default: 0 },
    status: { type: String, required: true, enum: ALERT_STATUSES },
    resolved_by: { type: String, trim: true },
    resolved_at: { type: Date },
    resolution_note: { type: String, trim: true },
    admin_message: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  { timestamps: true }
);

export const DiseaseAlert = mongoose.model('DiseaseAlert', diseaseAlertSchema);
