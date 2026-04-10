import { Request, Response } from 'express'
import { CampaignService } from '../services/campaign.service'
import { sendSuccess, sendError } from '../utils/response'

const campaignService = new CampaignService()

export class CampaignController {

  async createCampaign(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { title, description, budget, platforms, category, deliverables, timeline } = req.body

      if (!title || !description || !budget || !platforms?.length || !category || !deliverables?.length || !timeline) {
        return sendError(res, 'title, description, budget, platforms, category, deliverables, and timeline are required')
      }

      const campaign = await campaignService.createCampaign(userId, req.body)
      return sendSuccess(res, 'Campaign created successfully', campaign, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async updateCampaign(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const campaignId = req.params.id as string
      const campaign = await campaignService.updateCampaign(userId, campaignId, req.body)
      return sendSuccess(res, 'Campaign updated successfully', campaign)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async deleteCampaign(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const campaignId = req.params.id as string
      const result = await campaignService.deleteCampaign(userId, campaignId)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getCampaign(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const campaignId = req.params.id as string
      const campaign = await campaignService.getCampaign(campaignId, userId)
      return sendSuccess(res, 'Campaign fetched', campaign)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  async getMyCampaigns(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const status = req.query.status as string | undefined
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const result = await campaignService.getMyCampaigns(userId, status, page, limit)
      return sendSuccess(res, 'Campaigns fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async browseCampaigns(req: Request, res: Response) {
    try {
      const {
        category, platform, minBudget, maxBudget,
        minFollowers, location, page, limit,
      } = req.query

      const result = await campaignService.browseCampaigns({
        category: category as string,
        platform: platform as string,
        minBudget: minBudget ? parseFloat(minBudget as string) : undefined,
        maxBudget: maxBudget ? parseFloat(maxBudget as string) : undefined,
        minFollowers: minFollowers ? parseInt(minFollowers as string) : undefined,
        location: location as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      })

      return sendSuccess(res, 'Campaign marketplace fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async completeCampaign(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const campaignId = req.params.id as string
      const campaign = await campaignService.completeCampaign(userId, campaignId)
      return sendSuccess(res, 'Campaign marked as completed', campaign)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getCampaignStats(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const campaignId = req.params.id as string
      const stats = await campaignService.getCampaignStats(userId, campaignId)
      return sendSuccess(res, 'Campaign stats fetched', stats)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  // ─── Applications ─────────────────────────────────────────────────

  async applyToCampaign(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { campaignId, proposalText, proposedRate, estimatedReach, portfolioLinks } = req.body

      if (!campaignId || !proposalText || !proposedRate) {
        return sendError(res, 'campaignId, proposalText, and proposedRate are required')
      }

      const application = await campaignService.applyToCampaign(userId, {
        campaignId, proposalText, proposedRate, estimatedReach, portfolioLinks,
      })

      return sendSuccess(res, 'Application submitted successfully', application, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getApplications(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const campaignId = req.params.id as string
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const result = await campaignService.getApplications(campaignId, userId, page, limit)
      return sendSuccess(res, 'Applications fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getMyApplications(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const status = req.query.status as string | undefined
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const result = await campaignService.getMyApplications(userId, status, page, limit)
      return sendSuccess(res, 'Your applications fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async updateApplicationStatus(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const applicationId = req.params.applicationId as string
      const { status } = req.body

      if (!['ACCEPTED', 'REJECTED'].includes(status)) {
        return sendError(res, 'status must be ACCEPTED or REJECTED')
      }

      const result = await campaignService.updateApplicationStatus(userId, applicationId, status)
      return sendSuccess(res, `Application ${status.toLowerCase()} successfully`, result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async withdrawApplication(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const applicationId = req.params.applicationId as string
      const result = await campaignService.withdrawApplication(userId, applicationId)
      return sendSuccess(res, 'Application withdrawn', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // ─── Messaging ────────────────────────────────────────────────────

  async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { campaignId, content, messageType, fileUrl } = req.body

      if (!campaignId || !content) {
        return sendError(res, 'campaignId and content are required')
      }

      const message = await campaignService.sendMessage(userId, {
        campaignId, content, messageType, fileUrl,
      })

      return sendSuccess(res, 'Message sent', message, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const campaignId = req.params.id as string
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const result = await campaignService.getMessages(userId, campaignId, page, limit)
      return sendSuccess(res, 'Messages fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // ─── Milestones ───────────────────────────────────────────────────

  async createMilestone(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { campaignId, title, description, dueDate, amount } = req.body

      if (!campaignId || !title) {
        return sendError(res, 'campaignId and title are required')
      }

      const milestone = await campaignService.createMilestone(userId, {
        campaignId, title, description, dueDate, amount,
      })

      return sendSuccess(res, 'Milestone created', milestone, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async completeMilestone(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const milestoneId = req.params.milestoneId as string
      const result = await campaignService.completeMilestone(userId, milestoneId)
      return sendSuccess(res, 'Milestone marked as complete', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async approveMilestone(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const milestoneId = req.params.milestoneId as string
      const result = await campaignService.approveMilestone(userId, milestoneId)
      return sendSuccess(res, 'Milestone approved', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // ─── Disputes ─────────────────────────────────────────────────────

  async raiseDispute(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { campaignId, reason, description } = req.body

      if (!campaignId || !reason || !description) {
        return sendError(res, 'campaignId, reason, and description are required')
      }

      const dispute = await campaignService.raiseDispute(userId, {
        campaignId, reason, description,
      })

      return sendSuccess(res, 'Dispute raised successfully', dispute, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getDisputes(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const campaignId = req.params.id as string
      const disputes = await campaignService.getDisputes(userId, campaignId)
      return sendSuccess(res, 'Disputes fetched', disputes)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // ─── Reviews ──────────────────────────────────────────────────────

  async submitReview(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { campaignId, revieweeId, rating, comment } = req.body

      if (!campaignId || !revieweeId || !rating) {
        return sendError(res, 'campaignId, revieweeId, and rating are required')
      }

      const review = await campaignService.submitReview(userId, {
        campaignId, revieweeId, rating, comment,
      })

      return sendSuccess(res, 'Review submitted', review, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getMyReviews(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const reviews = await campaignService.getReviews(userId)
      return sendSuccess(res, 'Reviews fetched', reviews)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // ─── AI Proposal ──────────────────────────────────────────────────

  async generateProposal(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { campaignId, influencerBio, followerCount, niche } = req.body

      if (!campaignId || !influencerBio || !followerCount || !niche) {
        return sendError(res, 'campaignId, influencerBio, followerCount, and niche are required')
      }

      const result = await campaignService.generateProposal(
        userId, campaignId, influencerBio, followerCount, niche
      )

      return sendSuccess(res, 'Proposal generated', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }
}
