import mongoose from 'mongoose';

const PLAN_CONFIG = {
  starter: { durationDays: 30, dailyRoiPercent: 1 },
  growth: { durationDays: 60, dailyRoiPercent: 1.5 },
  premium: { durationDays: 90, dailyRoiPercent: 2 }
};

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    plan: { type: String, required: true, enum: Object.keys(PLAN_CONFIG) },
    dailyRoiPercent: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active', index: true }
  },
  { timestamps: true }
);

investmentSchema.index({ user: 1, status: 1 });

export { PLAN_CONFIG };
export const Investment = mongoose.model('Investment', investmentSchema);
