import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/index.js';
import { buildReferralPath, createUniqueReferralCode } from '../utils/referrals.js';
import { signAccessToken } from '../utils/tokens.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
  referralCode: z.string().trim().optional()
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

router.post('/register', async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const referrer = payload.referralCode
      ? await User.findOne({ referralCode: payload.referralCode.toUpperCase() })
      : null;

    if (payload.referralCode && !referrer) {
      return res.status(400).json({ message: 'Invalid referral code' });
    }

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      passwordHash: await User.hashPassword(payload.password),
      referralCode: await createUniqueReferralCode(payload.name),
      referredBy: referrer?._id || null,
      referralPath: buildReferralPath(referrer)
    });

    res.status(201).json({ token: signAccessToken(user), user });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await User.findOne({ email: payload.email }).select('+passwordHash');

    if (!user || !(await user.comparePassword(payload.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ token: signAccessToken(user), user });
  } catch (error) {
    next(error);
  }
});

export default router;
