export interface TokenPayload {
  userId: string
  email: string
  accountCategory: string
  accountType: string
}

export type NotificationType =
  | 'CAMPAIGN_APPLICATION'
  | 'CAMPAIGN_ACCEPTED'
  | 'CAMPAIGN_REJECTED'
  | 'CAMPAIGN_COMPLETED'
  | 'CAMPAIGN_MESSAGE'
  | 'CAMPAIGN_MILESTONE'
  | 'CAMPAIGN_DISPUTE'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_SENT'
  | 'WITHDRAWAL_PROCESSED'
  | 'WITHDRAWAL_FAILED'
  | 'SUBSCRIPTION_ACTIVATED'
  | 'SUBSCRIPTION_EXPIRING'
  | 'SUBSCRIPTION_EXPIRED'
  | 'BOT_REPORT_READY'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'REVIEW_RECEIVED'

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH'

export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, any>
  channel?: NotificationChannel
  sendEmail?: boolean
  emailAddress?: string
}

export interface BulkNotificationInput {
  userIds: string[]
  type: NotificationType
  title: string
  body: string
  data?: Record<string, any>
}

export interface UpdatePreferencesInput {
  emailEnabled?: boolean
  inAppEnabled?: boolean
  campaignUpdates?: boolean
  paymentAlerts?: boolean
  marketingEmails?: boolean
  weeklyDigest?: boolean
}

export interface CreateAnnouncementInput {
  title: string
  body: string
  targetAll?: boolean
  targetType?: string
  expiresAt?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
