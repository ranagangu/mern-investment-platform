import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Investment, PLAN_CONFIG } from '../models/index.js';

const router = Router();

const investmentSchema = z.object({
  amount: z.number().positive(),
  plan: z.enum(Object.keys(PLAN_CONFIG))
});

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = investmentSchema.parse(req.body);
    const plan = PLAN_CONFIG[payload.plan];
    const startDate = new Date();
    const investment = await Investment.create({
      user: req.user._id,
      amount: payload.amount,
      plan: payload.plan,
      dailyRoiPercent: plan.dailyRoiPercent,
      startDate,
      endDate: addDays(startDate, plan.durationDays),
      status: 'active'
    });

    res.status(201).json({ investment });
  } catch (error) {
    next(error);
  }
});

router.get('/plans', requireAuth, (_req, res) => {
  res.json({ plans: PLAN_CONFIG });
});

export default router;
