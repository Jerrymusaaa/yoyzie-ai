import { Router } from 'express'
import { AdminController } from '../controllers/admin.controller'
import { authenticateAdmin, requirePermission, requireLevel } from '../middleware/admin-auth.middleware'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new AdminController()

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })

// Public — admin login
router.post('/auth/login', authLimiter, (req, res) => controller.login(req, res))

// Public — promo code validation
router.get('/promo/validate/:code', generalLimiter, (req, res) => controller.validatePromoCode(req, res))

// All routes below require admin authentication
router.use(authenticateAdmin)

// Admin management — Super Admin only
router.post('/admins', requireLevel(5), (req, res) => controller.createAdmin(req, res))
router.get('/admins', requireLevel(4), (req, res) => controller.getAdmins(req, res))
router.delete('/admins/:id', requireLevel(5), (req, res) => controller.deactivateAdmin(req, res))

// Dashboard
router.get('/dashboard', generalLimiter, (req, res) => controller.getDashboard(req, res))
router.get('/health', generalLimiter, (req, res) => controller.getPlatformHealth(req, res))
router.get('/stats/platform', generalLimiter, (req, res) => controller.getPlatformStats(req, res))

// User management
router.get('/users', requirePermission('users.read'), generalLimiter, (req, res) => controller.searchUsers(req, res))
router.get('/users/:userId', requirePermission('users.read'), generalLimiter, (req, res) => controller.getUserDetail(req, res))
router.patch('/users/:userId', requirePermission('users.update'), generalLimiter, (req, res) => controller.updateUser(req, res))
router.post('/users/:userId/suspend', requirePermission('users.suspend'), generalLimiter, (req, res) => controller.suspendUser(req, res))
router.post('/users/:userId/reactivate', requirePermission('users.update'), generalLimiter, (req, res) => controller.reactivateUser(req, res))
router.post('/users/:userId/ban', requireLevel(3), generalLimiter, (req, res) => controller.banUser(req, res))
router.delete('/users/:userId', requireLevel(5), generalLimiter, (req, res) => controller.deleteUser(req, res))

// Content moderation
router.get('/moderation/reports', requirePermission('moderation.read'), generalLimiter, (req, res) => controller.getReports(req, res))
router.patch('/moderation/reports/:reportId', requirePermission('moderation.action'), generalLimiter, (req, res) => controller.reviewReport(req, res))
router.get('/moderation/stats', requirePermission('moderation.read'), generalLimiter, (req, res) => controller.getModerationStats(req, res))

// Support tickets
router.get('/support/tickets', requirePermission('support.read'), generalLimiter, (req, res) => controller.getTickets(req, res))
router.get('/support/tickets/stats', requirePermission('support.read'), generalLimiter, (req, res) => controller.getTicketStats(req, res))
router.get('/support/tickets/:ticketId', requirePermission('support.read'), generalLimiter, (req, res) => controller.getTicket(req, res))
router.post('/support/tickets/:ticketId/reply', requirePermission('support.reply'), generalLimiter, (req, res) => controller.replyToTicket(req, res))
router.patch('/support/tickets/:ticketId/status', requirePermission('support.reply'), generalLimiter, (req, res) => controller.updateTicketStatus(req, res))

// Audit logs
router.get('/audit-logs', requireLevel(4), generalLimiter, (req, res) => controller.getAuditLogs(req, res))

// Promo codes
router.post('/promo', requirePermission('promo.create'), generalLimiter, (req, res) => controller.createPromoCode(req, res))
router.get('/promo', requirePermission('promo.read'), generalLimiter, (req, res) => controller.getPromoCodes(req, res))

// Financial
router.get('/financial/overview', requirePermission('billing.read'), generalLimiter, (req, res) => controller.getFinancialOverview(req, res))

export default router
