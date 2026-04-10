import { Router } from 'express'
import { NotificationController } from '../controllers/notification.controller'
import { authenticate } from '../middleware/auth.middleware'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new NotificationController()

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })

// Internal service-to-service endpoints — no user auth
router.post('/internal/create', generalLimiter, (req, res) => controller.createNotification(req, res))
router.post('/internal/bulk', generalLimiter, (req, res) => controller.createBulkNotifications(req, res))
router.post('/internal/campaign/application', generalLimiter, (req, res) => controller.notifyCampaignApplication(req, res))
router.post('/internal/campaign/accepted', generalLimiter, (req, res) => controller.notifyCampaignAccepted(req, res))
router.post('/internal/payment/received', generalLimiter, (req, res) => controller.notifyPaymentReceived(req, res))
router.post('/internal/withdrawal', generalLimiter, (req, res) => controller.notifyWithdrawal(req, res))

// Public
router.get('/announcements', generalLimiter, (req, res) => controller.getAnnouncements(req, res))

// Protected user routes
router.use(authenticate)

router.get('/', generalLimiter, (req, res) => controller.getNotifications(req, res))
router.get('/unread-count', generalLimiter, (req, res) => controller.getUnreadCount(req, res))
router.patch('/:id/read', generalLimiter, (req, res) => controller.markAsRead(req, res))
router.patch('/mark-all-read', generalLimiter, (req, res) => controller.markAllAsRead(req, res))
router.delete('/clear', generalLimiter, (req, res) => controller.clearAll(req, res))
router.delete('/:id', generalLimiter, (req, res) => controller.deleteNotification(req, res))

router.get('/preferences', generalLimiter, (req, res) => controller.getPreferences(req, res))
router.patch('/preferences', generalLimiter, (req, res) => controller.updatePreferences(req, res))

// Admin
router.post('/announcements', authenticate, generalLimiter, (req, res) => controller.createAnnouncement(req, res))

export default router
