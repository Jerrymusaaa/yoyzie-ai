import { Router } from 'express'
import { ContentController } from '../controllers/content.controller'
import { authenticate } from '../middleware/auth.middleware'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new ContentController()

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many AI requests. Please slow down.',
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

// All routes require authentication
router.use(authenticate)

// AI generation endpoints
router.post('/captions', aiLimiter, (req, res) => controller.generateCaptions(req, res))
router.post('/hashtags', aiLimiter, (req, res) => controller.generateHashtags(req, res))
router.post('/adapt', aiLimiter, (req, res) => controller.adaptContent(req, res))
router.post('/thread', aiLimiter, (req, res) => controller.generateThread(req, res))
router.post('/article', aiLimiter, (req, res) => controller.generateArticle(req, res))
router.post('/chat', aiLimiter, (req, res) => controller.chat(req, res))

// Brand voice
router.get('/brand-voice', generalLimiter, (req, res) => controller.getBrandVoice(req, res))
router.post('/brand-voice', generalLimiter, (req, res) => controller.saveBrandVoice(req, res))

// Content history
router.get('/history', generalLimiter, (req, res) => controller.getHistory(req, res))
router.patch('/history/:id/save', generalLimiter, (req, res) => controller.saveContent(req, res))
router.delete('/history/:id', generalLimiter, (req, res) => controller.deleteContent(req, res))

export default router
