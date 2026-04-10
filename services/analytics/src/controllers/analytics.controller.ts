import { Request, Response } from 'express'
import { AnalyticsService } from '../services/analytics.service'
import { BotDetectionService } from '../services/bot-detection.service'
import { sendSuccess, sendError } from '../utils/response'

const analyticsService = new AnalyticsService()
const botDetectionService = new BotDetectionService()

export class AnalyticsController {

  async ingestPostMetrics(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { platform, externalPostId } = req.body

      if (!platform || !externalPostId) {
        return sendError(res, 'platform and externalPostId are required')
      }

      const metric = await analyticsService.ingestPostMetrics(userId, req.body)
      return sendSuccess(res, 'Post metrics ingested', metric, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async ingestAccountMetrics(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { platform, followers } = req.body

      if (!platform || followers === undefined) {
        return sendError(res, 'platform and followers are required')
      }

      const metric = await analyticsService.ingestAccountMetrics(userId, req.body)
      return sendSuccess(res, 'Account metrics ingested', metric, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async trackClick(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { platform, postId, clickType } = req.body

      if (!platform || !postId || !clickType) {
        return sendError(res, 'platform, postId, and clickType are required')
      }

      const click = await analyticsService.trackClick(userId, {
        ...req.body,
        userAgent: req.headers['user-agent'],
      })

      return sendSuccess(res, 'Click tracked', click, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getDashboardOverview(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const days = parseInt(req.query.days as string) || 30
      const overview = await analyticsService.getDashboardOverview(userId, days)
      return sendSuccess(res, 'Dashboard overview fetched', overview)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getPostPerformance(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const platform = req.query.platform as any
      const days = parseInt(req.query.days as string) || 30
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      const result = await analyticsService.getPostPerformance(userId, platform, days, page, limit)
      return sendSuccess(res, 'Post performance fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getFollowerGrowth(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const platform = req.query.platform as any
      const days = parseInt(req.query.days as string) || 30

      if (!platform) return sendError(res, 'platform is required')

      const result = await analyticsService.getFollowerGrowth(userId, platform, days)
      return sendSuccess(res, 'Follower growth fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getClickToViewRatio(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const platform = req.query.platform as any
      const days = parseInt(req.query.days as string) || 30

      if (!platform) return sendError(res, 'platform is required')

      const result = await analyticsService.getClickToViewRatio(userId, platform, days)
      return sendSuccess(res, 'Click-to-view ratio fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getTopPosts(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const platform = req.query.platform as any
      const days = parseInt(req.query.days as string) || 30
      const limit = parseInt(req.query.limit as string) || 10

      const posts = await analyticsService.getTopPosts(userId, platform, days, limit)
      return sendSuccess(res, 'Top posts fetched', posts)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async saveDemographics(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { platform, demographics } = req.body

      if (!platform || !demographics?.length) {
        return sendError(res, 'platform and demographics array are required')
      }

      const result = await analyticsService.saveDemographics(userId, platform, demographics)
      return sendSuccess(res, 'Demographics saved', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getDemographics(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const platform = req.query.platform as any
      const result = await analyticsService.getDemographics(userId, platform)
      return sendSuccess(res, 'Demographics fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async generateAISummary(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const period = req.query.period as 'weekly' | 'monthly' || 'weekly'

      if (!['weekly', 'monthly'].includes(period)) {
        return sendError(res, 'period must be weekly or monthly')
      }

      const result = await analyticsService.generateAISummary(userId, period)
      return sendSuccess(res, 'AI summary generated', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getReports(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const result = await analyticsService.getReports(userId, page, limit)
      return sendSuccess(res, 'Reports fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getBenchmarks(req: Request, res: Response) {
    try {
      const platform = req.query.platform as any
      if (!platform) return sendError(res, 'platform is required')

      const result = await analyticsService.getBenchmarks(platform)
      return sendSuccess(res, 'Benchmarks fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // ─── Bot Detection ────────────────────────────────────────────────

  async analyzeBotScore(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { platform, followerCount, followingCount, postCount, avgLikes, avgComments, followerGrowthRate, commentSamples } = req.body

      if (!platform || followerCount === undefined) {
        return sendError(res, 'platform and followerCount are required')
      }

      const report = await botDetectionService.analyzeAccount(userId, platform, {
        followerCount,
        followingCount: followingCount || 0,
        postCount: postCount || 0,
        avgLikes: avgLikes || 0,
        avgComments: avgComments || 0,
        followerGrowthRate,
        commentSamples,
      })

      return sendSuccess(res, 'Bot detection analysis complete', report)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getBotReport(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const platform = req.params.platform as any
      const report = await botDetectionService.getReport(userId, platform.toUpperCase())
      return sendSuccess(res, 'Bot detection report fetched', report)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  async getAllBotReports(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const reports = await botDetectionService.getAllReports(userId)
      return sendSuccess(res, 'All bot reports fetched', reports)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }
}
