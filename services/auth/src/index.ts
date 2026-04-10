import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { env } from './config/env'
import authRoutes from './routes/auth.routes'

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}))

// Parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Logging
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))

// Passport
app.use(passport.initialize())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/v1/auth', authRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

app.listen(env.PORT, () => {
  console.log(`✅ Auth Service running on port ${env.PORT}`)
  console.log(`📍 Health: http://localhost:${env.PORT}/health`)
})

export default app
