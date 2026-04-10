import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/response'
import { env } from '../config/env'

const authService = new AuthService()

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const user = await authService.register(req.body)
      return sendSuccess(res, 'Registration successful. Please check your email to verify your account.', user, 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(
        req.body,
        req.ip,
        req.headers['user-agent']
      )

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      return sendSuccess(res, 'Login successful', { user, accessToken })
    } catch (error: any) {
      return sendError(res, error.message, 401)
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
      res.clearCookie('refreshToken')
      return sendSuccess(res, 'Logged out successfully')
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken
      if (!token) return sendError(res, 'Refresh token required', 401)

      const tokens = await authService.refreshTokens(token)

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      return sendSuccess(res, 'Tokens refreshed', { accessToken: tokens.accessToken })
    } catch (error: any) {
      return sendError(res, error.message, 401)
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const token = req.params.token as string
      const result = await authService.verifyEmail(token)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body
      if (!email) return sendError(res, 'Email is required')
      const result = await authService.forgotPassword(email)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const token = req.params.token as string
      const { password } = req.body
      if (!password) return sendError(res, 'New password is required')
      const result = await authService.resetPassword(token, password)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  async googleCallback(req: Request, res: Response) {
    try {
      const profile = req.user as any
      const { accessToken, refreshToken } = await authService.handleOAuthUser(
        'GOOGLE',
        profile.id,
        profile.emails[0].value,
        profile.displayName
      )

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      return res.redirect(`${env.CLIENT_URL}/auth/callback?token=${accessToken}`)
    } catch (error: any) {
      return res.redirect(`${env.CLIENT_URL}/auth/error?message=${encodeURIComponent(error.message)}`)
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const tokenUser = req.user as any
      const user = await authService.getMe(tokenUser.userId)
      return sendSuccess(res, 'User fetched successfully', user)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }
}
