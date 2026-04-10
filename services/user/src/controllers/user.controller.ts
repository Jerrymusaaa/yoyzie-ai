import { Request, Response } from 'express'
import { UserService } from '../services/user.service'
import { sendSuccess, sendError } from '../utils/response'

const userService = new UserService()

export class UserController {

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const user = await userService.getProfile(userId)
      return sendSuccess(res, 'Profile fetched successfully', user)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const user = await userService.updateProfile(userId, req.body)
      return sendSuccess(res, 'Profile updated successfully', user)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { currentPassword, newPassword } = req.body

      if (!currentPassword || !newPassword) {
        return sendError(res, 'currentPassword and newPassword are required')
      }

      const result = await userService.changePassword(userId, { currentPassword, newPassword })
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async updateAccountType(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { accountType } = req.body

      if (!accountType) {
        return sendError(res, 'accountType is required')
      }

      const user = await userService.updateAccountType(userId, accountType)
      return sendSuccess(res, 'Account type updated successfully', user)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getSessions(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const sessions = await userService.getSessions(userId)
      return sendSuccess(res, 'Sessions fetched successfully', sessions)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { password } = req.body

      if (!password) {
        return sendError(res, 'Password is required to delete account')
      }

      const result = await userService.deleteAccount(userId, password)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getPublicProfile(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string
      const user = await userService.getPublicProfile(userId)
      return sendSuccess(res, 'Public profile fetched successfully', user)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  async searchUsers(req: Request, res: Response) {
    try {
      const query = req.query.q as string
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      if (!query || query.trim().length < 2) {
        return sendError(res, 'Search query must be at least 2 characters')
      }

      const result = await userService.searchUsers(query.trim(), page, limit)
      return sendSuccess(res, 'Search results', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }
}
