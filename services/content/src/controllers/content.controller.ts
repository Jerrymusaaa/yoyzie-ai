import { Request, Response } from 'express'
import { ContentService } from '../services/content.service'
import { sendSuccess, sendError } from '../utils/response'

const contentService = new ContentService()

export class ContentController {

  async generateCaptions(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { platform, topic, tone, includeHashtags, includeEmojis, language, count, brandVoice } = req.body

      if (!platform || !topic) {
        return sendError(res, 'platform and topic are required')
      }

      const result = await contentService.generateCaptions(userId, {
        platform, topic, tone, includeHashtags, includeEmojis, language, count, brandVoice,
      })

      return sendSuccess(res, 'Captions generated successfully', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async generateHashtags(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { topic, platform, count, includeKenyanTrends } = req.body

      if (!topic || !platform) {
        return sendError(res, 'topic and platform are required')
      }

      const result = await contentService.generateHashtags(userId, {
        topic, platform, count, includeKenyanTrends,
      })

      return sendSuccess(res, 'Hashtags generated successfully', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async adaptContent(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { originalContent, fromPlatform, toPlatforms, tone } = req.body

      if (!originalContent || !fromPlatform || !toPlatforms?.length) {
        return sendError(res, 'originalContent, fromPlatform, and toPlatforms are required')
      }

      const result = await contentService.adaptContent(userId, {
        originalContent, fromPlatform, toPlatforms, tone,
      })

      return sendSuccess(res, 'Content adapted successfully', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async generateThread(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { topic, pointCount, tone } = req.body

      if (!topic) return sendError(res, 'topic is required')

      const result = await contentService.generateThread(userId, { topic, pointCount, tone })
      return sendSuccess(res, 'Thread generated successfully', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async generateArticle(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { topic, tone, wordCount, includeHeadings } = req.body

      if (!topic) return sendError(res, 'topic is required')

      const result = await contentService.generateArticle(userId, {
        topic, tone, wordCount, includeHeadings,
      })

      return sendSuccess(res, 'Article generated successfully', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async chat(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { messages } = req.body

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return sendError(res, 'messages array is required')
      }

      const result = await contentService.chat(userId, messages)
      return sendSuccess(res, 'Response generated', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async saveBrandVoice(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const result = await contentService.saveBrandVoice(userId, req.body)
      return sendSuccess(res, 'Brand voice saved successfully', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getBrandVoice(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const result = await contentService.getBrandVoice(userId)
      return sendSuccess(res, 'Brand voice fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const type = req.query.type as string | undefined

      const result = await contentService.getHistory(userId, page, limit, type)
      return sendSuccess(res, 'Content history fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async saveContent(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const contentId = req.params.id as string
      const result = await contentService.saveContent(userId, contentId)
      return sendSuccess(res, 'Content saved', result)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  async deleteContent(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const contentId = req.params.id as string
      const result = await contentService.deleteContent(userId, contentId)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }
}
