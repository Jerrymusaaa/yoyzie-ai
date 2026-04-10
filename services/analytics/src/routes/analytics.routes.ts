import { Router } from 'express'
import { AnalyticsController } from '../controllers/analytics.controller'
import { authenticate } from '../middleware/auth.middleware'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new AnalyticsController()

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 })

router.use(authenticate)

// Metrics ingestion
router.post('/metrics/post', generalLimiter, (req, res) => controller.ingestPostMetrics(req, res))
router.post('/metrics/account', generalLimiter, (req, res) => controller.ingestAccountMetrics(req, res))

// Click tracking
router.post('/clicks', generalLimiter, (req, res) => controller.trackClick(req, res))
router.get('/clicks/ratio', generalLimiter, (req, res) => controller.getClickToViewRatio(req, res))

// Dashboard and performance
router.get('/overview', generalLimiter, (req, res) => controller.getDashboardOverview(req, res))
router.get('/posts/performance', generalLimiter, (req, res) => controller.getPostPerformance(req, res))
router.get('/posts/top', generalLimiter, (req, res) => controller.getTopPosts(req, res))
router.get('/followers/growth', generalLimiter, (req, res) => controller.getFollowerGrowth(req, res))

// Demographics
router.post('/demographics', generalLimiter, (req, res) => controller.saveDemographics(req, res))
router.get('/demographics', generalLimiter, (req, res) => controller.getDemographics(req, res))

// Benchmarks
router.get('/benchmarks', generalLimiter, (req, res) => controller.getBenchmarks(req, res))

// AI reports
router.post('/reports/generate', aiLimiter, (req, res) => controller.generateAISummary(req, res))
router.get('/reports', generalLimiter, (req, res) => controller.getReports(req, res))

// Bot detection
router.post('/bot-detection/analyze', aiLimiter, (req, res) => controller.analyzeBotScore(req, res))
router.get('/bot-detection/reports', generalLimiter, (req, res) => controller.getAllBotReports(req, res))
router.get('/bot-detection/:platform', generalLimiter, (req, res) => controller.getBotReport(req, res))

export default router
