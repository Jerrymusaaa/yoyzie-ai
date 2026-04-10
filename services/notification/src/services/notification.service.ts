import { PrismaClient } from '@prisma/client'
import { sendEmail, buildNotificationEmail } from '../utils/email'
import { env } from '../config/env'
import {
  CreateNotificationInput,
  BulkNotificationInput,
  UpdatePreferencesInput,
  CreateAnnouncementInput,
  NotificationType,
} from '../types'

const prisma = new PrismaClient()

// Email subject lines per notification type
const EMAIL_SUBJECTS: Record<NotificationType, string> = {
  CAMPAIGN_APPLICATION: 'New application for your campaign',
  CAMPAIGN_ACCEPTED: '🎉 Your campaign application was accepted',
  CAMPAIGN_REJECTED: 'Campaign application update',
  CAMPAIGN_COMPLETED: 'Campaign completed successfully',
  CAMPAIGN_MESSAGE: 'New message in your campaign',
  CAMPAIGN_MILESTONE: 'Campaign milestone update',
  CAMPAIGN_DISPUTE: 'Campaign dispute raised',
  PAYMENT_RECEIVED: '💰 Payment received',
  PAYMENT_SENT: 'Payment sent successfully',
  WITHDRAWAL_PROCESSED: '✅ Withdrawal processed',
  WITHDRAWAL_FAILED: 'Withdrawal failed',
  SUBSCRIPTION_ACTIVATED: '✅ Subscription activated',
  SUBSCRIPTION_EXPIRING: '⏰ Your subscription is expiring soon',
  SUBSCRIPTION_EXPIRED: 'Your subscription has expired',
  BOT_REPORT_READY: 'Your bot detection report is ready',
  SYSTEM_ANNOUNCEMENT: 'Important update from Yoyzie AI',
  REVIEW_RECEIVED: 'You received a new review',
}

// CTA config per notification type
const EMAIL_CTA: Record<NotificationType, { text: string; path: string }> = {
  CAMPAIGN_APPLICATION: { text: 'View Applications', path: '/dashboard/campaigns' },
  CAMPAIGN_ACCEPTED: { text: 'View Campaign', path: '/dashboard/campaigns' },
  CAMPAIGN_REJECTED: { text: 'Browse Campaigns', path: '/dashboard/campaigns/marketplace' },
  CAMPAIGN_COMPLETED: { text: 'Leave a Review', path: '/dashboard/campaigns' },
  CAMPAIGN_MESSAGE: { text: 'Reply Now', path: '/dashboard/campaigns' },
  CAMPAIGN_MILESTONE: { text: 'View Milestone', path: '/dashboard/campaigns' },
  CAMPAIGN_DISPUTE: { text: 'View Dispute', path: '/dashboard/campaigns' },
  PAYMENT_RECEIVED: { text: 'View Wallet', path: '/dashboard/wallet' },
  PAYMENT_SENT: { text: 'View Transaction', path: '/dashboard/wallet' },
  WITHDRAWAL_PROCESSED: { text: 'View Wallet', path: '/dashboard/wallet' },
  WITHDRAWAL_FAILED: { text: 'Retry Withdrawal', path: '/dashboard/wallet' },
  SUBSCRIPTION_ACTIVATED: { text: 'Go to Dashboard', path: '/dashboard' },
  SUBSCRIPTION_EXPIRING: { text: 'Renew Now', path: '/billing/upgrade' },
  SUBSCRIPTION_EXPIRED: { text: 'Reactivate', path: '/billing/upgrade' },
  BOT_REPORT_READY: { text: 'View Report', path: '/dashboard/analytics' },
  SYSTEM_ANNOUNCEMENT: { text: 'Learn More', path: '/dashboard' },
  REVIEW_RECEIVED: { text: 'View Review', path: '/dashboard/profile' },
}

export class NotificationService {

  // ─── Create Single Notification ───────────────────────────────────

  async createNotification(input: CreateNotificationInput) {
    const {
      userId,
      type,
      title,
      body,
      data,
      channel = 'IN_APP',
      sendEmail: shouldEmail = false,
      emailAddress,
    } = input

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        data: data || {},
        channel,
      },
    })

    // Send email if requested and address provided
    if (shouldEmail && emailAddress) {
      const prefs = await this.getOrCreatePreferences(userId)

      if (prefs.emailEnabled) {
        const cta = EMAIL_CTA[type]
        const html = buildNotificationEmail(
          title,
          body,
          cta?.text,
          cta ? `${env.CLIENT_URL}${cta.path}` : undefined
        )

        const sent = await sendEmail({
          to: emailAddress,
          subject: EMAIL_SUBJECTS[type] || title,
          html,
        })

        if (sent) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: { emailSent: true, emailSentAt: new Date() },
          })
        }
      }
    }

    return notification
  }

  // ─── Bulk Notifications ───────────────────────────────────────────

  async createBulkNotifications(input: BulkNotificationInput) {
    const { userIds, type, title, body, data } = input

    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type,
        title,
        body,
        data: data || {},
        channel: 'IN_APP' as any,
      })),
    })

    return { created: notifications.count }
  }

  // ─── Get Notifications ────────────────────────────────────────────

  async getNotifications(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const skip = (page - 1) * limit
    const where: any = { userId }
    if (unreadOnly) where.isRead = false

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ])

    return {
      notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  // ─── Mark as Read ─────────────────────────────────────────────────

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    })

    if (!notification) throw new Error('Notification not found')

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    })
  }

  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })

    return { updated: result.count }
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    })

    if (!notification) throw new Error('Notification not found')

    await prisma.notification.delete({ where: { id: notificationId } })
    return { message: 'Notification deleted' }
  }

  async clearAllNotifications(userId: string) {
    const result = await prisma.notification.deleteMany({
      where: { userId, isRead: true },
    })

    return { deleted: result.count }
  }

  // ─── Unread Count ─────────────────────────────────────────────────

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    })

    return { count }
  }

  // ─── Preferences ──────────────────────────────────────────────────

  async getOrCreatePreferences(userId: string) {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    })

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId },
      })
    }

    return prefs
  }

  async updatePreferences(userId: string, input: UpdatePreferencesInput) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: input,
      create: { userId, ...input },
    })
  }

  // ─── Announcements ────────────────────────────────────────────────

  async createAnnouncement(createdBy: string, input: CreateAnnouncementInput) {
    const announcement = await prisma.announcement.create({
      data: {
        title: input.title,
        body: input.body,
        targetAll: input.targetAll ?? true,
        targetType: input.targetType,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        createdBy,
      },
    })

    // If targeting all users, create in-app notifications in bulk
    if (announcement.targetAll) {
      const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
        take: 1000,
      })

      await this.createBulkNotifications({
        userIds: users.map((u) => u.id),
        type: 'SYSTEM_ANNOUNCEMENT',
        title: input.title,
        body: input.body,
      })
    }

    return announcement
  }

  async getActiveAnnouncements() {
    return prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ─── Pre-built Notification Templates ────────────────────────────

  async notifyCampaignApplication(
    companyUserId: string,
    companyEmail: string,
    influencerName: string,
    campaignTitle: string,
    campaignId: string
  ) {
    return this.createNotification({
      userId: companyUserId,
      type: 'CAMPAIGN_APPLICATION',
      title: 'New campaign application',
      body: `${influencerName} has applied to your campaign "${campaignTitle}"`,
      data: { campaignId },
      sendEmail: true,
      emailAddress: companyEmail,
    })
  }

  async notifyCampaignAccepted(
    influencerId: string,
    influencerEmail: string,
    campaignTitle: string,
    campaignId: string
  ) {
    return this.createNotification({
      userId: influencerId,
      type: 'CAMPAIGN_ACCEPTED',
      title: 'Application accepted! 🎉',
      body: `Congratulations! Your application for "${campaignTitle}" has been accepted.`,
      data: { campaignId },
      sendEmail: true,
      emailAddress: influencerEmail,
    })
  }

  async notifyCampaignRejected(
    influencerId: string,
    influencerEmail: string,
    campaignTitle: string,
    campaignId: string
  ) {
    return this.createNotification({
      userId: influencerId,
      type: 'CAMPAIGN_REJECTED',
      title: 'Application update',
      body: `Your application for "${campaignTitle}" was not selected this time. Keep applying!`,
      data: { campaignId },
      sendEmail: true,
      emailAddress: influencerEmail,
    })
  }

  async notifyPaymentReceived(
    influencerId: string,
    influencerEmail: string,
    amount: number,
    campaignTitle: string
  ) {
    return this.createNotification({
      userId: influencerId,
      type: 'PAYMENT_RECEIVED',
      title: '💰 Payment received',
      body: `KES ${amount.toLocaleString()} has been credited to your wallet for "${campaignTitle}"`,
      data: { amount, campaignTitle },
      sendEmail: true,
      emailAddress: influencerEmail,
    })
  }

  async notifyWithdrawalProcessed(
    userId: string,
    userEmail: string,
    amount: number,
    method: string
  ) {
    return this.createNotification({
      userId,
      type: 'WITHDRAWAL_PROCESSED',
      title: '✅ Withdrawal processed',
      body: `KES ${amount.toLocaleString()} has been sent to your ${method} account`,
      data: { amount, method },
      sendEmail: true,
      emailAddress: userEmail,
    })
  }

  async notifyWithdrawalFailed(
    userId: string,
    userEmail: string,
    amount: number,
    reason: string
  ) {
    return this.createNotification({
      userId,
      type: 'WITHDRAWAL_FAILED',
      title: 'Withdrawal failed',
      body: `Your withdrawal of KES ${amount.toLocaleString()} failed. Reason: ${reason}`,
      data: { amount, reason },
      sendEmail: true,
      emailAddress: userEmail,
    })
  }

  async notifyNewMessage(
    userId: string,
    userEmail: string,
    senderName: string,
    campaignTitle: string,
    campaignId: string
  ) {
    return this.createNotification({
      userId,
      type: 'CAMPAIGN_MESSAGE',
      title: 'New message',
      body: `${senderName} sent you a message in "${campaignTitle}"`,
      data: { campaignId, senderName },
      sendEmail: false,
      emailAddress: userEmail,
    })
  }

  async notifyReviewReceived(
    userId: string,
    userEmail: string,
    reviewerName: string,
    rating: number,
    campaignTitle: string
  ) {
    return this.createNotification({
      userId,
      type: 'REVIEW_RECEIVED',
      title: 'New review received',
      body: `${reviewerName} left you a ${rating}-star review for "${campaignTitle}"`,
      data: { reviewerName, rating, campaignTitle },
      sendEmail: true,
      emailAddress: userEmail,
    })
  }

  async notifyBotReportReady(
    userId: string,
    userEmail: string,
    platform: string,
    botScore: number
  ) {
    return this.createNotification({
      userId,
      type: 'BOT_REPORT_READY',
      title: 'Bot detection report ready',
      body: `Your ${platform} audience authenticity report is ready. Authenticity score: ${100 - botScore}%`,
      data: { platform, botScore },
      sendEmail: true,
      emailAddress: userEmail,
    })
  }
}
