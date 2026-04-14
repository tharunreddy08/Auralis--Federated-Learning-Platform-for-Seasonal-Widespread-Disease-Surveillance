import mongoose from 'mongoose';
import { DISEASES, TRENDS } from '../constants/enums.js';

const predictionSchema = new mongoose.Schema(
  {
    disease: { type: String, required: true, enum: DISEASES },
    region: { type: String, required: true, trim: true },
    predicted_cases: { type: Number, required: true },
    confidence: { type: Number },
    prediction_date: { type: Date },
    model_version: { type: String, trim: true },
    trend: { type: String, enum: TRENDS }
  },
  { timestamps: true }
);

export const Prediction = mongoose.model('Prediction', predictionSchema);
