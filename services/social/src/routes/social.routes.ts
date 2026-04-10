import { Router } from 'express'
import { SocialController } from '../controllers/social.controller'
import { authenticate } from '../middleware/auth.middleware'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new SocialController()

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

// Get all connected accounts
router.get('/accounts', authenticate, (req, res) => controller.getConnectedAccounts(req, res))

// Disconnect a platform
router.delete('/accounts/:platform', authenticate, (req, res) => controller.disconnectAccount(req, res))

// Refresh token for a platform
router.post('/accounts/:platform/refresh', authenticate, (req, res) => controller.refreshToken(req, res))

// Connect initiation — returns OAuth URL
router.get('/instagram/connect', authenticate, (req, res) => controller.connectInstagram(req, res))
router.get('/facebook/connect', authenticate, (req, res) => controller.connectFacebook(req, res))
router.get('/tiktok/connect', authenticate, (req, res) => controller.connectTikTok(req, res))
router.get('/linkedin/connect', authenticate, (req, res) => controller.connectLinkedIn(req, res))
router.get('/twitter/connect', authenticate, (req, res) => controller.connectTwitter(req, res))

// OAuth Callbacks — no auth middleware, state param carries userId
router.get('/instagram/callback', generalLimiter, (req, res) => controller.instagramCallback(req, res))
router.get('/facebook/callback', generalLimiter, (req, res) => controller.facebookCallback(req, res))
router.get('/tiktok/callback', generalLimiter, (req, res) => controller.tiktokCallback(req, res))
router.get('/linkedin/callback', generalLimiter, (req, res) => controller.linkedinCallback(req, res))
router.get('/twitter/callback', generalLimiter, (req, res) => controller.twitterCallback(req, res))

export default router
