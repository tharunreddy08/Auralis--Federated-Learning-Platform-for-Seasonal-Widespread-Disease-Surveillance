import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['training', 'alert', 'activity', 'report', 'system']
    },
    level: {
      type: String,
      required: true,
      enum: ['info', 'warning', 'error'],
      default: 'info'
    },
    source: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const SystemLog = mongoose.model('SystemLog', systemLogSchema);
