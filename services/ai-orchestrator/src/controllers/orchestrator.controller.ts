import { Request, Response } from 'express'
import { OrchestratorService } from '../services/orchestrator.service'
import { sendSuccess, sendError } from '../utils/response'

const orchestratorService = new OrchestratorService()

export class OrchestratorController {

  async runAgent(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { agentName, input } = req.body

      if (!agentName || !input) {
        return sendError(res, 'agentName and input are required')
      }

      const userToken = req.headers.authorization?.split(' ')[1]

      const result = await orchestratorService.runAgent({
        agentName,
        userId,
        input,
        userToken,
      })

      return sendSuccess(res, `${agentName} agent completed`, result)
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

      const userToken = req.headers.authorization?.split(' ')[1]

      const result = await orchestratorService.runAgent({
        agentName: 'AI_CHAT_ASSISTANT',
        userId,
        input: { messages, accountType: req.user.accountType },
        userToken,
      })

      return sendSuccess(res, 'Chat response generated', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async generateContent(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { platform, topic, tone, count, language, includeHashtags, includeEmojis } = req.body

      if (!platform || !topic) {
        return sendError(res, 'platform and topic are required')
      }

      const result = await orchestratorService.runAgent({
        agentName: 'CONTENT_GENERATION',
        userId,
        input: { platform, topic, tone, count, language, includeHashtags, includeEmojis },
      })

      return sendSuccess(res, 'Content generated', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getTrends(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { platform, contentContext, count } = req.body

      if (!platform) return sendError(res, 'platform is required')

      const result = await orchestratorService.runAgent({
        agentName: 'KENYAN_TREND',
        userId,
        input: { platform, contentContext, count },
      })

      return sendSuccess(res, 'Trends fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async analyzePerformance(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { period, metrics } = req.body

      if (!period || !metrics) {
        return sendError(res, 'period and metrics are required')
      }

      const result = await orchestratorService.runAgent({
        agentName: 'ANALYTICS_INSIGHT',
        userId,
        input: { period, metrics },
      })

      return sendSuccess(res, 'Analytics insight generated', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async campaignStrategy(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const required = ['campaignTitle', 'budget', 'platforms', 'targetAudience', 'objectives', 'timeline', 'category']

      for (const field of required) {
        if (!req.body[field]) return sendError(res, `${field} is required`)
      }

      const result = await orchestratorService.runAgent({
        agentName: 'CAMPAIGN_STRATEGY',
        userId,
        input: req.body,
      })

      return sendSuccess(res, 'Campaign strategy generated', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async matchInfluencers(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { campaignBrief, availableInfluencers } = req.body

      if (!campaignBrief || !availableInfluencers) {
        return sendError(res, 'campaignBrief and availableInfluencers are required')
      }

      const result = await orchestratorService.runAgent({
        agentName: 'INFLUENCER_MATCHING',
        userId,
        input: { campaignBrief, availableInfluencers },
      })

      return sendSuccess(res, 'Influencers matched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async writeProposal(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const required = ['campaignTitle', 'campaignDescription', 'budget', 'deliverables',
        'timeline', 'targetAudience', 'influencerBio', 'followerCount', 'engagementRate', 'niche']

      for (const field of required) {
        if (!req.body[field]) return sendError(res, `${field} is required`)
      }

      const result = await orchestratorService.runAgent({
        agentName: 'PROPOSAL_WRITING',
        userId,
        input: req.body,
      })

      return sendSuccess(res, 'Proposal generated', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async detectFraud(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const required = ['amount', 'method', 'frequency', 'accountAgeDays']

      for (const field of required) {
        if (req.body[field] === undefined) return sendError(res, `${field} is required`)
      }

      const result = await orchestratorService.runAgent({
        agentName: 'FRAUD_DETECTION',
        userId,
        input: { ...req.body, userId },
      })

      return sendSuccess(res, 'Fraud detection complete', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getJob(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const jobId = req.params.jobId as string
      const job = await orchestratorService.getJob(jobId, userId)
      return sendSuccess(res, 'Job fetched', job)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  async getJobHistory(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const agentName = req.query.agent as string | undefined
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      const result = await orchestratorService.getJobHistory(userId, agentName, page, limit)
      return sendSuccess(res, 'Job history fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getUsageStats(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const days = parseInt(req.query.days as string) || 30
      const stats = await orchestratorService.getUsageStats(userId, days)
      return sendSuccess(res, 'Usage stats fetched', stats)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getAgentRegistry(req: Request, res: Response) {
    try {
      const agents = orchestratorService.getAgentRegistry()
      return sendSuccess(res, 'Agent registry fetched', agents)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }
}
