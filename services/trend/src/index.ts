import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import trendRoutes from './routes/trend.routes'
import { trendRefreshQueue, scheduleTrendRefresh } from './queues/trend.queue'
import { TrendService } from './services/trend.service'

const app = express()
const trendService = new TrendService()

app.use(helmet())
app.use(cors({
  origin: env.NODE_ENV === 'development' ? '*' : env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))

// Process trend refresh jobs
trendRefreshQueue.process(async (job) => {
  console.log('🔄 Running scheduled trend refresh...')
  const results = await trendService.refreshAllTrends()
  console.log('✅ Trend refresh complete:', results)
  return results
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'trend-service', timestamp: new Date().toISOString() })
})

app.use('/api/v1/trends', trendRoutes)

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

app.listen(env.PORT, async () => {
  console.log(`✅ Trend Service running on port ${env.PORT}`)
  console.log(`📍 Health: http://localhost:${env.PORT}/health`)

  // Schedule recurring refresh
  await scheduleTrendRefresh()

  // Run initial refresh on startup
  console.log('🔄 Running initial trend refresh...')
  trendService.refreshAllTrends().then((r) => {
    console.log('✅ Initial trends loaded:', r)
  }).catch(console.error)
})

export default app
