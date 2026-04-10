import dotenv from 'dotenv'
dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5012'),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN || '',
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
}
