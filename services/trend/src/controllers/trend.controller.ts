import { Request, Response } from 'express'
import { TrendService } from '../services/trend.service'
import { sendSuccess, sendError } from '../utils/response'

const trendService = new TrendService()

export class TrendController {

  async getHashtags(req: Request, res: Response) {
    try {
      const platform = (req.query.platform as string || 'TWITTER').toUpperCase() as any
      const location = req.query.location as string || 'Kenya'
      const limit = parseInt(req.query.limit as string) || 20

      const trends = await trendService.getHashtags(platform, location, limit)
      return sendSuccess(res, 'Hashtags fetched', { platform, location, trends })
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getSounds(req: Request, res: Response) {
    try {
      const platform = (req.query.platform as string || 'TIKTOK').toUpperCase() as any
      const limit = parseInt(req.query.limit as string) || 20

      const sounds = await trendService.getSounds(platform, limit)
      return sendSuccess(res, 'Trending sounds fetched', { platform, sounds })
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getTopics(req: Request, res: Response) {
    try {
      const location = req.query.location as string || 'Kenya'
      const limit = parseInt(req.query.limit as string) || 20

      const topics = await trendService.getTopics(location, limit)
      return sendSuccess(res, 'Topics fetched', { location, topics })
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getCountyTrends(req: Request, res: Response) {
    try {
      const county = req.params.county as string
      const limit = parseInt(req.query.limit as string) || 10

      const trends = await trendService.getCountyTrends(county, limit)
      return sendSuccess(res, `${county} trends fetched`, { county, trends })
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getAllTrends(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50
      const trends = await trendService.getAllActiveTrends(limit)
      return sendSuccess(res, 'All active trends fetched', trends)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getTrendSuggestions(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { content, platform, count } = req.body

      if (!content || !platform) {
        return sendError(res, 'content and platform are required')
      }

      const result = await trendService.getTrendSuggestions(userId, {
        content,
        platform: platform.toUpperCase(),
        count,
      })

      return sendSuccess(res, 'Trend suggestions generated', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async refreshTrends(req: Request, res: Response) {
    try {
      const results = await trendService.refreshAllTrends()
      return sendSuccess(res, 'Trends refreshed successfully', results)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getRefreshLogs(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20
      const logs = await trendService.getRefreshLogs(limit)
      return sendSuccess(res, 'Refresh logs fetched', logs)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getRefreshStats(req: Request, res: Response) {
    try {
      const stats = await trendService.getRefreshStats()
      return sendSuccess(res, 'Refresh stats fetched', stats)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }
}
