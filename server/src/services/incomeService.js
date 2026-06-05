import { Investment, LevelIncome, RoiHistory, User } from '../models/index.js';
import { startOfUtcDay, toUtcDateKey } from '../utils/dates.js';

export const LEVEL_INCOME_PERCENTAGES = [10, 5, 3, 2, 1];

function calculateRoiAmount(investment) {
  return Number(((investment.amount * investment.dailyRoiPercent) / 100).toFixed(2));
}

export async function runDailyIncomeCalculation(runDate = new Date()) {
  const dateKey = toUtcDateKey(runDate);
  const dayStart = startOfUtcDay(runDate);
  const activeInvestments = await Investment.find({
    status: 'active',
    startDate: { $lte: dayStart },
    endDate: { $gte: dayStart }
  }).lean();

  const summary = {
    dateKey,
    investmentsChecked: activeInvestments.length,
    roiCreated: 0,
    roiSkipped: 0,
    levelIncomeCreated: 0
  };

  for (const investment of activeInvestments) {
    const roiAmount = calculateRoiAmount(investment);
    const roiInsert = await RoiHistory.updateOne(
      { user: investment.user, investment: investment._id, dateKey },
      {
        $setOnInsert: {
          user: investment.user,
          investment: investment._id,
          dateKey,
          amount: roiAmount,
          dailyRoiPercent: investment.dailyRoiPercent,
          calculatedAt: new Date()
        }
      },
      { upsert: true }
    );

    if (!roiInsert.upsertedCount) {
      summary.roiSkipped += 1;
      continue;
    }

    const roiHistory = await RoiHistory.findOne({
      user: investment.user,
      investment: investment._id,
      dateKey
    });

    await User.updateOne(
      { _id: investment.user },
      {
        $inc: {
          'wallet.roiBalance': roiAmount,
          'wallet.totalBalance': roiAmount
        }
      }
    );

    summary.roiCreated += 1;

    const investingUser = await User.findById(investment.user).select('referralPath');
    const ancestors = investingUser?.referralPath || [];

    for (let index = 0; index < ancestors.length && index < LEVEL_INCOME_PERCENTAGES.length; index += 1) {
      const percent = LEVEL_INCOME_PERCENTAGES[index];
      const levelAmount = Number(((roiAmount * percent) / 100).toFixed(2));

      if (levelAmount <= 0) continue;

      const levelInsert = await LevelIncome.updateOne(
        { user: ancestors[index], roiHistory: roiHistory._id, level: index + 1 },
        {
          $setOnInsert: {
            user: ancestors[index],
            fromUser: investment.user,
            investment: investment._id,
            roiHistory: roiHistory._id,
            level: index + 1,
            percent,
            amount: levelAmount,
            dateKey
          }
        },
        { upsert: true }
      );

      if (levelInsert.upsertedCount) {
        await User.updateOne(
          { _id: ancestors[index] },
          {
            $inc: {
              'wallet.levelIncomeBalance': levelAmount,
              'wallet.totalBalance': levelAmount
            }
          }
        );
        summary.levelIncomeCreated += 1;
      }
    }
  }

  await Investment.updateMany({ status: 'active', endDate: { $lt: dayStart } }, { $set: { status: 'completed' } });

  return summary;
}
