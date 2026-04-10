import { Router } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { AuthController } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validateRegister, validateLogin } from '../middleware/validate.middleware'
import { env } from '../config/env'
import rateLimit from 'express-rate-limit'

const router = Router()
const controller = new AuthController()

// Set up Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    (_accessToken, _refreshToken, profile, done) => {
      return done(null, profile)
    }
  )
)

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts. Please try again in 15 minutes.',
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

// Auth routes
router.post('/register', generalLimiter, validateRegister, (req, res) => controller.register(req, res))
router.post('/login', authLimiter, validateLogin, (req, res) => controller.login(req, res))
router.post('/logout', generalLimiter, (req, res) => controller.logout(req, res))
router.post('/refresh', generalLimiter, (req, res) => controller.refresh(req, res))
router.get('/verify-email/:token', generalLimiter, (req, res) => controller.verifyEmail(req, res))
router.post('/forgot-password', authLimiter, (req, res) => controller.forgotPassword(req, res))
router.post('/reset-password/:token', authLimiter, (req, res) => controller.resetPassword(req, res))
router.get('/me', authenticate, (req, res) => controller.getMe(req, res))

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/error' }),
  (req, res) => controller.googleCallback(req, res)
)

export default router
