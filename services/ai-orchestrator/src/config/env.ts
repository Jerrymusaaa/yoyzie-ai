import dotenv from 'dotenv'
dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5014'),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  CONTENT_SERVICE_URL: process.env.CONTENT_SERVICE_URL || 'http://localhost:5004',
  ANALYTICS_SERVICE_URL: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:5006',
  CAMPAIGN_SERVICE_URL: process.env.CAMPAIGN_SERVICE_URL || 'http://localhost:5007',
  TREND_SERVICE_URL: process.env.TREND_SERVICE_URL || 'http://localhost:5012',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
}
