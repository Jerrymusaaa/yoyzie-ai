import { env } from '../config/env'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (options: EmailOptions) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
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
    console.error('Email send failed:', await response.text())
  }
}

export const sendSubscriptionConfirmation = async (
  email: string,
  name: string,
  planName: string,
  amount: number,
  periodEnd: Date
) => {
  await sendEmail({
    to: email,
    subject: `Your Yoyzie AI ${planName} subscription is active`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0066FF;">Subscription Confirmed ✅</h2>
        <p>Hi ${name},</p>
        <p>Your <strong>${planName}</strong> subscription is now active.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;border:1px solid #eee;"><strong>Plan</strong></td><td style="padding:8px;border:1px solid #eee;">${planName}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;"><strong>Amount</strong></td><td style="padding:8px;border:1px solid #eee;">KES ${amount.toLocaleString()}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;"><strong>Next Billing</strong></td><td style="padding:8px;border:1px solid #eee;">${periodEnd.toLocaleDateString('en-KE')}</td></tr>
        </table>
        <a href="${env.CLIENT_URL}/dashboard" style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Go to Dashboard</a>
      </div>
    `,
  })
}

export const sendTrialExpiryWarning = async (
  email: string,
  name: string,
  daysLeft: number,
  planName: string
) => {
  await sendEmail({
    to: email,
    subject: `Your Yoyzie AI trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B35;">Trial Ending Soon ⏰</h2>
        <p>Hi ${name},</p>
        <p>Your <strong>${planName}</strong> trial ends in <strong>${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong>.</p>
        <p>Upgrade now to keep your data, settings, and access to all features.</p>
        <a href="${env.CLIENT_URL}/billing/upgrade" style="display:inline-block;background:#0066FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Upgrade Now</a>
      </div>
    `,
  })
}
