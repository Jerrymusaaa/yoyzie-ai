import { Router } from 'express'
import { OrchestratorController } from '../controllers/orchestrator.controller'
import { authenticate } from '../middleware/auth.middleware'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new OrchestratorController()

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 })
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })

router.use(authenticate)

// Generic agent runner
router.post('/run', aiLimiter, (req, res) => controller.runAgent(req, res))

// Specialized agent endpoints
router.post('/chat', aiLimiter, (req, res) => controller.chat(req, res))
router.post('/content/generate', aiLimiter, (req, res) => controller.generateContent(req, res))
router.post('/trends', aiLimiter, (req, res) => controller.getTrends(req, res))
router.post('/analytics/insight', aiLimiter, (req, res) => controller.analyzePerformance(req, res))
router.post('/campaign/strategy', aiLimiter, (req, res) => controller.campaignStrategy(req, res))
router.post('/influencers/match', aiLimiter, (req, res) => controller.matchInfluencers(req, res))
router.post('/proposal/write', aiLimiter, (req, res) => controller.writeProposal(req, res))
router.post('/fraud/detect', aiLimiter, (req, res) => controller.detectFraud(req, res))

// Job tracking
router.get('/jobs', generalLimiter, (req, res) => controller.getJobHistory(req, res))
router.get('/jobs/:jobId', generalLimiter, (req, res) => controller.getJob(req, res))

// Usage and registry
router.get('/usage', generalLimiter, (req, res) => controller.getUsageStats(req, res))
router.get('/agents', generalLimiter, (req, res) => controller.getAgentRegistry(req, res))

export default router
