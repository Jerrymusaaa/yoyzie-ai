import { Router } from 'express'
import { WalletController } from '../controllers/wallet.controller'
import { authenticate } from '../middleware/auth.middleware'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new WalletController()

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
const withdrawalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })

// M-Pesa webhook callbacks — no auth, Safaricom calls these
router.post('/mpesa/b2c/result', (req, res) => controller.mpesaB2CResult(req, res))
router.post('/mpesa/b2c/timeout', (req, res) => controller.mpesaB2CTimeout(req, res))

// Internal — service-to-service credit (no user auth needed)
router.post('/credit', generalLimiter, (req, res) => controller.creditWallet(req, res))

// Protected routes
router.use(authenticate)

// Wallet overview
router.get('/balance', generalLimiter, (req, res) => controller.getWallet(req, res))
router.get('/transactions', generalLimiter, (req, res) => controller.getTransactions(req, res))
router.get('/statement', generalLimiter, (req, res) => controller.getEarningsStatement(req, res))
router.patch('/settings', generalLimiter, (req, res) => controller.updateSettings(req, res))

// Withdrawals
router.post('/withdraw/mpesa', withdrawalLimiter, (req, res) => controller.withdrawMpesa(req, res))
router.post('/withdraw/paypal', withdrawalLimiter, (req, res) => controller.withdrawPaypal(req, res))
router.post('/withdraw/bank', withdrawalLimiter, (req, res) => controller.withdrawBank(req, res))

// Escrow
router.post('/escrow/hold', generalLimiter, (req, res) => controller.holdEscrow(req, res))
router.post('/escrow/:campaignId/release', generalLimiter, (req, res) => controller.releaseEscrow(req, res))
router.post('/escrow/:campaignId/refund', generalLimiter, (req, res) => controller.refundEscrow(req, res))

// Finance team — pending withdrawals queue
router.get('/pending-withdrawals', generalLimiter, (req, res) => controller.getPendingWithdrawals(req, res))

export default router
