import mongoose from 'mongoose';
import { MODEL_TYPES, MODEL_UPDATE_STATUSES } from '../constants/enums.js';

const modelUpdateSchema = new mongoose.Schema(
  {
    hospital_id: { type: String, trim: true },
    hospital_name: { type: String, required: true, trim: true },
    model_type: { type: String, required: true, enum: MODEL_TYPES },
    accuracy: { type: Number },
    loss: { type: Number },
    training_samples: { type: Number },
    round_number: { type: Number },
    status: { type: String, required: true, enum: MODEL_UPDATE_STATUSES },
    weights_hash: { type: String, trim: true }
  },
  { timestamps: true }
);

export const ModelUpdate = mongoose.model('ModelUpdate', modelUpdateSchema);
