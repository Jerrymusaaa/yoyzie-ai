import { Router } from 'express'
import { SchedulingController } from '../controllers/scheduling.controller'
import { authenticate } from '../middleware/auth.middleware'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new SchedulingController()

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

router.use(authenticate)

// Posts CRUD
router.post('/posts', generalLimiter, (req, res) => controller.createPost(req, res))
router.get('/posts', generalLimiter, (req, res) => controller.getPosts(req, res))
router.get('/posts/upcoming', generalLimiter, (req, res) => controller.getUpcomingPosts(req, res))
router.get('/posts/:id', generalLimiter, (req, res) => controller.getPost(req, res))
router.patch('/posts/:id', generalLimiter, (req, res) => controller.updatePost(req, res))
router.delete('/posts/:id', generalLimiter, (req, res) => controller.deletePost(req, res))
router.post('/posts/:id/cancel', generalLimiter, (req, res) => controller.cancelPost(req, res))

// Calendar
router.get('/calendar', generalLimiter, (req, res) => controller.getCalendar(req, res))

// Optimal posting times
router.get('/optimal-times', generalLimiter, (req, res) => controller.getOptimalTimes(req, res))

// Queue status (internal/admin use)
router.get('/queue/status', generalLimiter, (req, res) => controller.getQueueStatus(req, res))

export default router
