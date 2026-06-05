import cron from 'node-cron';
import { env } from '../config/env.js';
import { runDailyIncomeCalculation } from '../services/incomeService.js';

export function startDailyIncomeCron() {
  cron.schedule(
    '0 0 * * *',
    async () => {
      try {
        const summary = await runDailyIncomeCalculation(new Date());
        console.log('Daily income calculation completed', summary);
      } catch (error) {
        console.error('Daily income calculation failed', error);
      }
    },
    { timezone: env.cronTimezone }
  );
}
