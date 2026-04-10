import Bull from 'bull'
import { env } from '../config/env'

export const trendRefreshQueue = new Bull('trend-refresh', {
  redis: env.REDIS_URL,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 20,
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
  },
})

// Repeat every 30 minutes
export const scheduleTrendRefresh = async () => {
  await trendRefreshQueue.add(
    { type: 'refresh_all' },
    {
      repeat: { cron: '*/30 * * * *' },
      jobId: 'trend-refresh-cron',
    }
  )
  console.log('✅ Trend refresh job scheduled every 30 minutes')
}
