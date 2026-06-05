import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { startDailyIncomeCron } from './jobs/dailyIncomeCron.js';

async function bootstrap() {
  await connectDb();
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });

  startDailyIncomeCron();
}

bootstrap().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
