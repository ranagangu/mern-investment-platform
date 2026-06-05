import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { runDailyIncomeCalculation } from '../services/incomeService.js';

const router = Router();

router.post('/run-daily-roi', requireAuth, async (_req, res, next) => {
  try {
    const summary = await runDailyIncomeCalculation();
    res.json({ summary });
  } catch (error) {
    next(error);
  }
});

export default router;
