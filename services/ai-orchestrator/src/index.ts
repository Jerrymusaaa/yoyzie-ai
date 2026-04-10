import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import orchestratorRoutes from './routes/orchestrator.routes'

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

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-orchestrator',
    timestamp: new Date().toISOString(),
    agents: [
      'CONTENT_GENERATION', 'KENYAN_TREND', 'ANALYTICS_INSIGHT',
      'CAMPAIGN_STRATEGY', 'INFLUENCER_MATCHING', 'AI_CHAT_ASSISTANT',
      'PROPOSAL_WRITING', 'FRAUD_DETECTION',
    ],
  })
})

app.use('/api/v1/ai', orchestratorRoutes)

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

app.listen(env.PORT, () => {
  console.log(`✅ AI Orchestrator running on port ${env.PORT}`)
  console.log(`📍 Health: http://localhost:${env.PORT}/health`)
  console.log(`🤖 Agents: 8 agents ready`)
})

export default app
