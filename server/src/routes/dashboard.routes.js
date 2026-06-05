import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Investment, LevelIncome, RoiHistory } from '../models/index.js';
import { toUtcDateKey } from '../utils/dates.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const todayKey = toUtcDateKey();

    const [investments, roiRows, levelRows, investmentTotals, roiTotals, levelTotals] = await Promise.all([
      Investment.find({ user: userId }).sort({ createdAt: -1 }).lean(),
      RoiHistory.find({ user: userId }).sort({ dateKey: -1 }).limit(30).lean(),
      LevelIncome.find({ user: userId })
        .populate('fromUser', 'name email referralCode')
        .sort({ dateKey: -1 })
        .limit(30)
        .lean(),
      Investment.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      RoiHistory.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            daily: { $sum: { $cond: [{ $eq: ['$dateKey', todayKey] }, '$amount', 0] } }
          }
        }
      ]),
      LevelIncome.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            daily: { $sum: { $cond: [{ $eq: ['$dateKey', todayKey] }, '$amount', 0] } }
          }
        }
      ])
    ]);

    res.json({
      user: req.user,
      metrics: {
        totalInvestments: investmentTotals.reduce((sum, row) => sum + row.total, 0),
        activeInvestments: investmentTotals.find((row) => row._id === 'active')?.total || 0,
        totalRoi: roiTotals[0]?.total || 0,
        dailyRoi: roiTotals[0]?.daily || 0,
        totalLevelIncome: levelTotals[0]?.total || 0,
        dailyLevelIncome: levelTotals[0]?.daily || 0,
        walletBalance: req.user.wallet.totalBalance
      },
      investments,
      roiHistory: roiRows,
      levelIncome: levelRows
    });
  } catch (error) {
    next(error);
  }
});

export default router;
