import mongoose from 'mongoose';

const levelIncomeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    investment: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment', required: true, index: true },
    roiHistory: { type: mongoose.Schema.Types.ObjectId, ref: 'RoiHistory', required: true, index: true },
    level: { type: Number, required: true, min: 1, max: 5 },
    percent: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    dateKey: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

levelIncomeSchema.index({ user: 1, roiHistory: 1, level: 1 }, { unique: true });

export const LevelIncome = mongoose.model('LevelIncome', levelIncomeSchema);
