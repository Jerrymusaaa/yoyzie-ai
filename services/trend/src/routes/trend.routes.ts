import { Router } from 'express'
import { TrendController } from '../controllers/trend.controller'
import { authenticate } from '../middleware/auth.middleware'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new TrendController()

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 })

// Public trend data — no auth needed
router.get('/hashtags', generalLimiter, (req, res) => controller.getHashtags(req, res))
router.get('/sounds', generalLimiter, (req, res) => controller.getSounds(req, res))
router.get('/topics', generalLimiter, (req, res) => controller.getTopics(req, res))
router.get('/all', generalLimiter, (req, res) => controller.getAllTrends(req, res))
router.get('/county/:county', generalLimiter, (req, res) => controller.getCountyTrends(req, res))

// Internal / admin
router.post('/refresh', generalLimiter, (req, res) => controller.refreshTrends(req, res))
router.get('/logs', generalLimiter, (req, res) => controller.getRefreshLogs(req, res))
router.get('/stats', generalLimiter, (req, res) => controller.getRefreshStats(req, res))

// AI suggestions — requires auth
router.post('/suggestions', authenticate, aiLimiter, (req, res) => controller.getTrendSuggestions(req, res))

export default router
