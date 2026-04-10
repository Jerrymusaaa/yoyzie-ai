import { Request, Response } from 'express'
import { NotificationService } from '../services/notification.service'
import { sendSuccess, sendError } from '../utils/response'

const notificationService = new NotificationService()

export class NotificationController {

  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const unreadOnly = req.query.unreadOnly === 'true'

      const result = await notificationService.getNotifications(userId, page, limit, unreadOnly)
      return sendSuccess(res, 'Notifications fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const result = await notificationService.getUnreadCount(userId)
      return sendSuccess(res, 'Unread count fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const notificationId = req.params.id as string
      const result = await notificationService.markAsRead(userId, notificationId)
      return sendSuccess(res, 'Notification marked as read', result)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const result = await notificationService.markAllAsRead(userId)
      return sendSuccess(res, `${result.updated} notifications marked as read`, result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const notificationId = req.params.id as string
      const result = await notificationService.deleteNotification(userId, notificationId)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  async clearAll(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const result = await notificationService.clearAllNotifications(userId)
      return sendSuccess(res, `${result.deleted} read notifications cleared`, result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getPreferences(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const prefs = await notificationService.getOrCreatePreferences(userId)
      return sendSuccess(res, 'Preferences fetched', prefs)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const prefs = await notificationService.updatePreferences(userId, req.body)
      return sendSuccess(res, 'Preferences updated', prefs)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getAnnouncements(req: Request, res: Response) {
    try {
      const announcements = await notificationService.getActiveAnnouncements()
      return sendSuccess(res, 'Announcements fetched', announcements)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async createAnnouncement(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { title, body, targetAll, targetType, expiresAt } = req.body

      if (!title || !body) {
        return sendError(res, 'title and body are required')
      }

      const announcement = await notificationService.createAnnouncement(userId, {
        title, body, targetAll, targetType, expiresAt,
      })

      return sendSuccess(res, 'Announcement created', announcement, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // Internal endpoint — called by other services
  async createNotification(req: Request, res: Response) {
    try {
      const { userId, type, title, body, data, sendEmail, emailAddress } = req.body

      if (!userId || !type || !title || !body) {
        return sendError(res, 'userId, type, title, and body are required')
      }

      const notification = await notificationService.createNotification({
        userId, type, title, body, data, sendEmail, emailAddress,
      })

      return sendSuccess(res, 'Notification created', notification, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async createBulkNotifications(req: Request, res: Response) {
    try {
      const { userIds, type, title, body, data } = req.body

      if (!userIds?.length || !type || !title || !body) {
        return sendError(res, 'userIds, type, title, and body are required')
      }

      const result = await notificationService.createBulkNotifications({
        userIds, type, title, body, data,
      })

      return sendSuccess(res, `${result.created} notifications created`, result, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // Template shortcuts — called by other services
  async notifyCampaignApplication(req: Request, res: Response) {
    try {
      const { companyUserId, companyEmail, influencerName, campaignTitle, campaignId } = req.body
      const result = await notificationService.notifyCampaignApplication(
        companyUserId, companyEmail, influencerName, campaignTitle, campaignId
      )
      return sendSuccess(res, 'Notification sent', result, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async notifyCampaignAccepted(req: Request, res: Response) {
    try {
      const { influencerId, influencerEmail, campaignTitle, campaignId } = req.body
      const result = await notificationService.notifyCampaignAccepted(
        influencerId, influencerEmail, campaignTitle, campaignId
      )
      return sendSuccess(res, 'Notification sent', result, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async notifyPaymentReceived(req: Request, res: Response) {
    try {
      const { influencerId, influencerEmail, amount, campaignTitle } = req.body
      const result = await notificationService.notifyPaymentReceived(
        influencerId, influencerEmail, amount, campaignTitle
      )
      return sendSuccess(res, 'Notification sent', result, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async notifyWithdrawal(req: Request, res: Response) {
    try {
      const { userId, userEmail, amount, method, success, reason } = req.body

      if (success) {
        await notificationService.notifyWithdrawalProcessed(userId, userEmail, amount, method)
      } else {
        await notificationService.notifyWithdrawalFailed(userId, userEmail, amount, reason)
      }

      return sendSuccess(res, 'Withdrawal notification sent', null, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }
}
