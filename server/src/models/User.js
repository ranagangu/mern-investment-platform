import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    roiBalance: { type: Number, default: 0, min: 0 },
    levelIncomeBalance: { type: Number, default: 0, min: 0 },
    totalBalance: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    referralCode: { type: String, required: true, unique: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    referralPath: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    wallet: { type: walletSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 12);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    return ret;
  }
});

export const User = mongoose.model('User', userSchema);
