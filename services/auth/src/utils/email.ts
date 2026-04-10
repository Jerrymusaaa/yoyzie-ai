import { env } from '../config/env'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Email send failed: ${error}`)
  }
}

export const sendVerificationEmail = async (email: string, token: string, name: string) => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Verify your Yoyzie AI account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066FF;">Welcome to Yoyzie AI, ${name}!</h2>
        <p>Please verify your email address to get started.</p>
        <a href="${verifyUrl}" 
           style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Verify Email
        </a>
        <p style="color:#888;font-size:13px;margin-top:24px;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  })
}

export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Reset your Yoyzie AI password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066FF;">Password Reset Request</h2>
        <p>Hi ${name}, we received a request to reset your password.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Reset Password
        </a>
        <p style="color:#888;font-size:13px;margin-top:24px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  })
}
