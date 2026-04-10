import { Router } from 'express'
import { CampaignController } from '../controllers/campaign.controller'
import { authenticate } from '../middleware/auth.middleware'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new CampaignController()

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 })

router.use(authenticate)

// Campaign CRUD
router.post('/', generalLimiter, (req, res) => controller.createCampaign(req, res))
router.get('/my', generalLimiter, (req, res) => controller.getMyCampaigns(req, res))
router.get('/marketplace', generalLimiter, (req, res) => controller.browseCampaigns(req, res))
router.get('/:id', generalLimiter, (req, res) => controller.getCampaign(req, res))
router.patch('/:id', generalLimiter, (req, res) => controller.updateCampaign(req, res))
router.delete('/:id', generalLimiter, (req, res) => controller.deleteCampaign(req, res))
router.post('/:id/complete', generalLimiter, (req, res) => controller.completeCampaign(req, res))
router.get('/:id/stats', generalLimiter, (req, res) => controller.getCampaignStats(req, res))

// Applications
router.post('/applications/apply', generalLimiter, (req, res) => controller.applyToCampaign(req, res))
router.get('/applications/mine', generalLimiter, (req, res) => controller.getMyApplications(req, res))
router.get('/:id/applications', generalLimiter, (req, res) => controller.getApplications(req, res))
router.patch('/applications/:applicationId/status', generalLimiter, (req, res) => controller.updateApplicationStatus(req, res))
router.post('/applications/:applicationId/withdraw', generalLimiter, (req, res) => controller.withdrawApplication(req, res))

// Messaging
router.post('/messages/send', generalLimiter, (req, res) => controller.sendMessage(req, res))
router.get('/:id/messages', generalLimiter, (req, res) => controller.getMessages(req, res))

// Milestones
router.post('/milestones', generalLimiter, (req, res) => controller.createMilestone(req, res))
router.post('/milestones/:milestoneId/complete', generalLimiter, (req, res) => controller.completeMilestone(req, res))
router.post('/milestones/:milestoneId/approve', generalLimiter, (req, res) => controller.approveMilestone(req, res))

// Disputes
router.post('/disputes', generalLimiter, (req, res) => controller.raiseDispute(req, res))
router.get('/:id/disputes', generalLimiter, (req, res) => controller.getDisputes(req, res))

// Reviews
router.post('/reviews', generalLimiter, (req, res) => controller.submitReview(req, res))
router.get('/reviews/mine', generalLimiter, (req, res) => controller.getMyReviews(req, res))

// AI
router.post('/ai/proposal', aiLimiter, (req, res) => controller.generateProposal(req, res))

export default router
