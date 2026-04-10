import dotenv from 'dotenv'
dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5013'),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET!,
  ADMIN_JWT_EXPIRES_IN: process.env.ADMIN_JWT_EXPIRES_IN || '8h',
  SESSION_TIMEOUT_MINUTES: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30'),
  WALLET_SERVICE_URL: process.env.WALLET_SERVICE_URL || 'http://localhost:5009',
  BILLING_SERVICE_URL: process.env.BILLING_SERVICE_URL || 'http://localhost:5010',
  NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5011',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:5013',
}
