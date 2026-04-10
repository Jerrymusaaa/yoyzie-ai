import { Router } from 'express'
import { BillingController } from '../controllers/billing.controller'
import { authenticate } from '../middleware/auth.middleware'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new BillingController()

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
const paymentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })

// Public
router.get('/plans', generalLimiter, (req, res) => controller.getPlans(req, res))

// Webhook callbacks — no auth
router.post('/mpesa/callback', (req, res) => controller.mpesaCallback(req, res))

// Seed plans — internal
router.post('/plans/seed', (req, res) => controller.seedPlans(req, res))

// Protected
router.use(authenticate)

router.get('/subscription', generalLimiter, (req, res) => controller.getSubscription(req, res))
router.post('/subscription/trial', generalLimiter, (req, res) => controller.startTrial(req, res))
router.post('/subscription/mpesa', paymentLimiter, (req, res) => controller.subscribeMpesa(req, res))
router.post('/subscription/stripe', paymentLimiter, (req, res) => controller.subscribeStripe(req, res))
router.post('/subscription/upgrade', paymentLimiter, (req, res) => controller.upgradePlan(req, res))
router.post('/subscription/cancel', generalLimiter, (req, res) => controller.cancelSubscription(req, res))

router.get('/invoices', generalLimiter, (req, res) => controller.getInvoices(req, res))
router.get('/features/:feature', generalLimiter, (req, res) => controller.checkFeatureAccess(req, res))

// Admin / Internal
router.post('/admin/check-trials', generalLimiter, (req, res) => controller.checkTrialExpiry(req, res))
router.get('/admin/overview', generalLimiter, (req, res) => controller.getBillingOverview(req, res))

export default router
