import { Request, Response } from 'express'
import { SchedulingService } from '../services/scheduling.service'
import { sendSuccess, sendError } from '../utils/response'

const schedulingService = new SchedulingService()

export class SchedulingController {

  async createPost(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { platform, caption, hashtags, mediaUrls, scheduledAt, timezone } = req.body

      if (!platform || !caption || !scheduledAt) {
        return sendError(res, 'platform, caption, and scheduledAt are required')
      }

      const post = await schedulingService.createPost(userId, {
        platform, caption, hashtags, mediaUrls, scheduledAt, timezone,
      })

      return sendSuccess(res, 'Post scheduled successfully', post, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const postId = req.params.id as string
      const post = await schedulingService.updatePost(userId, postId, req.body)
      return sendSuccess(res, 'Post updated successfully', post)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const postId = req.params.id as string
      const result = await schedulingService.deletePost(userId, postId)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getPost(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const postId = req.params.id as string
      const post = await schedulingService.getPost(userId, postId)
      return sendSuccess(res, 'Post fetched successfully', post)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  async getPosts(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const status = req.query.status as string | undefined
      const platform = req.query.platform as string | undefined
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      const result = await schedulingService.getPosts(userId, status, platform, page, limit)
      return sendSuccess(res, 'Posts fetched successfully', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getCalendar(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { startDate, endDate, platform } = req.query as {
        startDate: string
        endDate: string
        platform?: any
      }

      if (!startDate || !endDate) {
        return sendError(res, 'startDate and endDate are required')
      }

      const result = await schedulingService.getCalendar(userId, {
        startDate, endDate, platform,
      })

      return sendSuccess(res, 'Calendar fetched successfully', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getOptimalTimes(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const platform = req.query.platform as any

      if (!platform) {
        return sendError(res, 'platform query parameter is required')
      }

      const result = await schedulingService.getOptimalTimes(userId, platform)
      return sendSuccess(res, 'Optimal posting times fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getUpcomingPosts(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const limit = parseInt(req.query.limit as string) || 5
      const posts = await schedulingService.getUpcomingPosts(userId, limit)
      return sendSuccess(res, 'Upcoming posts fetched', posts)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async cancelPost(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const postId = req.params.id as string
      const post = await schedulingService.cancelPost(userId, postId)
      return sendSuccess(res, 'Post cancelled successfully', post)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getQueueStatus(req: Request, res: Response) {
    try {
      const status = await schedulingService.getQueueStatus()
      return sendSuccess(res, 'Queue status fetched', status)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }
}
