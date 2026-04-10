import dotenv from 'dotenv'
dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5010'),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,

  MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY!,
  MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET!,
  MPESA_SHORTCODE: process.env.MPESA_SHORTCODE!,
  MPESA_PASSKEY: process.env.MPESA_PASSKEY!,
  MPESA_STK_CALLBACK_URL: process.env.MPESA_STK_CALLBACK_URL!,
  MPESA_ENV: process.env.MPESA_ENV || 'sandbox',

  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  FROM_EMAIL: process.env.FROM_EMAIL || 'billing@yoyzie.ai',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
}
