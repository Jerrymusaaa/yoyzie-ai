import dotenv from 'dotenv'
dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5009'),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,

  MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY!,
  MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET!,
  MPESA_SHORTCODE: process.env.MPESA_SHORTCODE!,
  MPESA_PASSKEY: process.env.MPESA_PASSKEY!,
  MPESA_B2C_INITIATOR: process.env.MPESA_B2C_INITIATOR!,
  MPESA_B2C_SECURITY_CREDENTIAL: process.env.MPESA_B2C_SECURITY_CREDENTIAL!,
  MPESA_B2C_RESULT_URL: process.env.MPESA_B2C_RESULT_URL!,
  MPESA_B2C_QUEUE_TIMEOUT_URL: process.env.MPESA_B2C_QUEUE_TIMEOUT_URL!,
  MPESA_ENV: process.env.MPESA_ENV || 'sandbox',

  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID!,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET!,
  PAYPAL_ENV: process.env.PAYPAL_ENV || 'sandbox',

  COMMISSION_FREE: parseInt(process.env.COMMISSION_FREE || '25'),
  COMMISSION_STARTER: parseInt(process.env.COMMISSION_STARTER || '20'),
  COMMISSION_PRO: parseInt(process.env.COMMISSION_PRO || '15'),
  COMMISSION_CREATOR_MODE: parseInt(process.env.COMMISSION_CREATOR_MODE || '10'),

  OTP_THRESHOLD: parseInt(process.env.OTP_THRESHOLD || '10000'),
  FINANCE_REVIEW_THRESHOLD: parseInt(process.env.FINANCE_REVIEW_THRESHOLD || '50000'),

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
}
