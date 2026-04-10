import { env } from '../config/env'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
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

    return response.ok
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

export const buildNotificationEmail = (
  title: string,
  body: string,
  ctaText?: string,
  ctaUrl?: string
): string => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #050A14; padding: 24px; text-align: center;">
        <h1 style="color: #0066FF; margin: 0; font-size: 24px;">Yoyzie AI</h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #050A14; margin-top: 0;">${title}</h2>
        <p style="color: #444; line-height: 1.6;">${body}</p>
        ${ctaText && ctaUrl ? `
          <div style="margin-top: 24px;">
            <a href="${ctaUrl}"
               style="display:inline-block;background:#0066FF;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
              ${ctaText}
            </a>
          </div>
        ` : ''}
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">
          You are receiving this because you have an account on Yoyzie AI.<br/>
          <a href="${env.CLIENT_URL}/settings/notifications" style="color: #0066FF;">Manage notification preferences</a>
        </p>
      </div>
    </div>
  `
}
