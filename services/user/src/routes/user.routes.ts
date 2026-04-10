import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { authenticate } from '../middleware/auth.middleware'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new UserController()

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

const sensitiveLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
})

// Public routes
router.get('/public/:userId', generalLimiter, (req, res) => controller.getPublicProfile(req, res))
router.get('/search', generalLimiter, (req, res) => controller.searchUsers(req, res))

// Protected routes — require valid JWT
router.get('/profile', authenticate, (req, res) => controller.getProfile(req, res))
router.patch('/profile', authenticate, generalLimiter, (req, res) => controller.updateProfile(req, res))
router.post('/change-password', authenticate, sensitiveLimit, (req, res) => controller.changePassword(req, res))
router.patch('/account-type', authenticate, sensitiveLimit, (req, res) => controller.updateAccountType(req, res))
router.get('/sessions', authenticate, (req, res) => controller.getSessions(req, res))
router.delete('/account', authenticate, sensitiveLimit, (req, res) => controller.deleteAccount(req, res))

export default router
