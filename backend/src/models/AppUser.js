import mongoose from 'mongoose';

const appUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    role: {
      type: String,
      required: true,
      enum: ['government_admin', 'hospital_admin', 'health_official']
    },
    region: { type: String, trim: true },
    hospital_name: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    last_active_at: { type: Date }
  },
  { timestamps: true }
);

export const AppUser = mongoose.model('AppUser', appUserSchema);
