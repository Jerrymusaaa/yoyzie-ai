import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import schedulingRoutes from './routes/scheduling.routes'
import { postQueue } from './queues/post.queue'

const app = express()

app.use(helmet())
app.use(cors({
  origin: env.NODE_ENV === 'development' ? '*' : env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))

app.get('/health', async (_req, res) => {
  const queueStatus = await postQueue.getJobCounts()
  res.json({
    status: 'ok',
    service: 'scheduling-service',
    timestamp: new Date().toISOString(),
    queue: queueStatus,
  })
})

app.use('/api/v1/scheduling', schedulingRoutes)

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

app.listen(env.PORT, () => {
  console.log(`✅ Scheduling Service running on port ${env.PORT}`)
  console.log(`📍 Health: http://localhost:${env.PORT}/health`)
})

export default app
