import dotenv from 'dotenv'
dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5011'),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  FROM_EMAIL: process.env.FROM_EMAIL || 'notifications@yoyzie.ai',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
}
