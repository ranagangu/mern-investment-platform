import mongoose from 'mongoose';

const roiHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    investment: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment', required: true, index: true },
    dateKey: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    dailyRoiPercent: { type: Number, required: true, min: 0 },
    calculatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

roiHistorySchema.index({ user: 1, investment: 1, dateKey: 1 }, { unique: true });

export const RoiHistory = mongoose.model('RoiHistory', roiHistorySchema);
