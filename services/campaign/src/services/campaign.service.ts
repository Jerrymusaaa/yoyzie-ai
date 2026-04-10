import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import { env } from '../config/env'
import {
  CreateCampaignInput,
  UpdateCampaignInput,
  CreateApplicationInput,
  SendMessageInput,
  CreateMilestoneInput,
  CreateDisputeInput,
  CreateReviewInput,
  CampaignSearchFilters,
} from '../types'

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

export class CampaignService {

  // ─── Campaign CRUD ────────────────────────────────────────────────

  async createCampaign(userId: string, input: CreateCampaignInput) {
    const campaign = await prisma.campaign.create({
      data: {
        companyUserId: userId,
        title: input.title,
        description: input.description,
        budget: input.budget,
        currency: input.currency || 'KES',
        platforms: input.platforms as any[],
        category: input.category as any,
        niche: input.niche,
        deliverables: input.deliverables,
        timeline: input.timeline,
        targetAudienceAge: input.targetAudienceAge,
        targetAudienceLocation: input.targetAudienceLocation,
        minFollowers: input.minFollowers || 0,
        maxBudget: input.maxBudget,
        status: 'OPEN',
      },
    })

    return campaign
  }

  async updateCampaign(userId: string, campaignId: string, input: UpdateCampaignInput) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, companyUserId: userId },
    })

    if (!campaign) throw new Error('Campaign not found')

    if (['COMPLETED', 'CANCELLED'].includes(campaign.status)) {
      throw new Error('Cannot update a completed or cancelled campaign')
    }

    return prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description && { description: input.description }),
        ...(input.budget && { budget: input.budget }),
        ...(input.platforms && { platforms: input.platforms as any[] }),
        ...(input.category && { category: input.category as any }),
        ...(input.niche !== undefined && { niche: input.niche }),
        ...(input.deliverables && { deliverables: input.deliverables }),
        ...(input.timeline && { timeline: input.timeline }),
        ...(input.targetAudienceAge !== undefined && { targetAudienceAge: input.targetAudienceAge }),
        ...(input.targetAudienceLocation !== undefined && { targetAudienceLocation: input.targetAudienceLocation }),
        ...(input.minFollowers !== undefined && { minFollowers: input.minFollowers }),
        ...(input.status && { status: input.status as any }),
      },
    })
  }

  async deleteCampaign(userId: string, campaignId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, companyUserId: userId },
    })

    if (!campaign) throw new Error('Campaign not found')
    if (campaign.status === 'IN_PROGRESS') throw new Error('Cannot delete an active campaign')

    await prisma.campaign.delete({ where: { id: campaignId } })
    return { message: 'Campaign deleted successfully' }
  }

  async getCampaign(campaignId: string, userId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        applications: {
          where: { influencerId: userId },
          take: 1,
        },
        milestones: { orderBy: { createdAt: 'asc' } },
        _count: { select: { applications: true, messages: true } },
      },
    })

    if (!campaign) throw new Error('Campaign not found')
    return campaign
  }

  async getMyCampaigns(userId: string, status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where: any = { companyUserId: userId }
    if (status) where.status = status

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { applications: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ])

    return {
      campaigns,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  // ─── Campaign Marketplace (Influencer Browse) ─────────────────────

  async browseCampaigns(filters: CampaignSearchFilters) {
    const {
      category,
      platform,
      minBudget,
      maxBudget,
      minFollowers,
      location,
      page = 1,
      limit = 20,
    } = filters

    const skip = (page - 1) * limit

    const where: any = { status: 'OPEN' }

    if (category) where.category = category
    if (platform) where.platforms = { has: platform }
    if (minBudget) where.budget = { gte: minBudget }
    if (maxBudget) where.budget = { ...where.budget, lte: maxBudget }
    if (minFollowers) where.minFollowers = { lte: minFollowers }
    if (location) where.targetAudienceLocation = { contains: location, mode: 'insensitive' }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          budget: true,
          currency: true,
          platforms: true,
          category: true,
          niche: true,
          deliverables: true,
          timeline: true,
          targetAudienceAge: true,
          targetAudienceLocation: true,
          minFollowers: true,
          applicationsCount: true,
          createdAt: true,
        },
      }),
      prisma.campaign.count({ where }),
    ])

    return {
      campaigns,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  // ─── Applications ─────────────────────────────────────────────────

  async applyToCampaign(influencerId: string, input: CreateApplicationInput) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: input.campaignId },
    })

    if (!campaign) throw new Error('Campaign not found')
    if (campaign.status !== 'OPEN') throw new Error('This campaign is not accepting applications')
    if (campaign.companyUserId === influencerId) throw new Error('You cannot apply to your own campaign')

    const existing = await prisma.campaignApplication.findUnique({
      where: {
        campaignId_influencerId: {
          campaignId: input.campaignId,
          influencerId,
        },
      },
    })

    if (existing) throw new Error('You have already applied to this campaign')

    const application = await prisma.campaignApplication.create({
      data: {
        campaignId: input.campaignId,
        influencerId,
        proposalText: input.proposalText,
        proposedRate: input.proposedRate,
        estimatedReach: input.estimatedReach,
        portfolioLinks: input.portfolioLinks || [],
      },
    })

    await prisma.campaign.update({
      where: { id: input.campaignId },
      data: { applicationsCount: { increment: 1 } },
    })

    return application
  }

  async getApplications(campaignId: string, companyUserId: string, page = 1, limit = 20) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, companyUserId },
    })

    if (!campaign) throw new Error('Campaign not found or unauthorized')

    const skip = (page - 1) * limit

    const [applications, total] = await Promise.all([
      prisma.campaignApplication.findMany({
        where: { campaignId },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.campaignApplication.count({ where: { campaignId } }),
    ])

    return {
      applications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async getMyApplications(influencerId: string, status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where: any = { influencerId }
    if (status) where.status = status

    const [applications, total] = await Promise.all([
      prisma.campaignApplication.findMany({
        where,
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              budget: true,
              currency: true,
              status: true,
              category: true,
            },
          },
        },
      }),
      prisma.campaignApplication.count({ where }),
    ])

    return {
      applications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async updateApplicationStatus(
    companyUserId: string,
    applicationId: string,
    status: 'ACCEPTED' | 'REJECTED'
  ) {
    const application = await prisma.campaignApplication.findUnique({
      where: { id: applicationId },
      include: { campaign: true },
    })

    if (!application) throw new Error('Application not found')
    if (application.campaign.companyUserId !== companyUserId) {
      throw new Error('Unauthorized')
    }

    const updated = await prisma.campaignApplication.update({
      where: { id: applicationId },
      data: { status, respondedAt: new Date() },
    })

    if (status === 'ACCEPTED') {
      await prisma.campaign.update({
        where: { id: application.campaignId },
        data: {
          selectedInfluencerId: application.influencerId,
          status: 'IN_PROGRESS',
        },
      })

      // Reject all other applications
      await prisma.campaignApplication.updateMany({
        where: {
          campaignId: application.campaignId,
          id: { not: applicationId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED', respondedAt: new Date() },
      })
    }

    return updated
  }

  async withdrawApplication(influencerId: string, applicationId: string) {
    const application = await prisma.campaignApplication.findFirst({
      where: { id: applicationId, influencerId },
    })

    if (!application) throw new Error('Application not found')
    if (application.status !== 'PENDING') {
      throw new Error('Can only withdraw pending applications')
    }

    const updated = await prisma.campaignApplication.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN' },
    })

    await prisma.campaign.update({
      where: { id: application.campaignId },
      data: { applicationsCount: { decrement: 1 } },
    })

    return updated
  }

  // ─── Messaging ────────────────────────────────────────────────────

  async sendMessage(userId: string, input: SendMessageInput) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: input.campaignId },
    })

    if (!campaign) throw new Error('Campaign not found')

    const isParticipant =
      campaign.companyUserId === userId ||
      campaign.selectedInfluencerId === userId

    if (!isParticipant) throw new Error('You are not a participant in this campaign')

    const message = await prisma.campaignMessage.create({
      data: {
        campaignId: input.campaignId,
        senderId: userId,
        content: input.content,
        messageType: (input.messageType as any) || 'TEXT',
        fileUrl: input.fileUrl,
      },
    })

    return message
  }

  async getMessages(userId: string, campaignId: string, page = 1, limit = 50) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) throw new Error('Campaign not found')

    const isParticipant =
      campaign.companyUserId === userId ||
      campaign.selectedInfluencerId === userId

    if (!isParticipant) throw new Error('Unauthorized')

    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      prisma.campaignMessage.findMany({
        where: { campaignId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.campaignMessage.count({ where: { campaignId } }),
    ])

    // Mark unread messages as read
    await prisma.campaignMessage.updateMany({
      where: {
        campaignId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    })

    return {
      messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  // ─── Milestones ───────────────────────────────────────────────────

  async createMilestone(userId: string, input: CreateMilestoneInput) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: input.campaignId, companyUserId: userId },
    })

    if (!campaign) throw new Error('Campaign not found or unauthorized')

    return prisma.campaignMilestone.create({
      data: {
        campaignId: input.campaignId,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        amount: input.amount,
      },
    })
  }

  async completeMilestone(influencerId: string, milestoneId: string) {
    const milestone = await prisma.campaignMilestone.findUnique({
      where: { id: milestoneId },
      include: { campaign: true },
    })

    if (!milestone) throw new Error('Milestone not found')
    if (milestone.campaign.selectedInfluencerId !== influencerId) {
      throw new Error('Unauthorized')
    }

    return prisma.campaignMilestone.update({
      where: { id: milestoneId },
      data: { completed: true, completedAt: new Date() },
    })
  }

  async approveMilestone(companyUserId: string, milestoneId: string) {
    const milestone = await prisma.campaignMilestone.findUnique({
      where: { id: milestoneId },
      include: { campaign: true },
    })

    if (!milestone) throw new Error('Milestone not found')
    if (milestone.campaign.companyUserId !== companyUserId) throw new Error('Unauthorized')
    if (!milestone.completed) throw new Error('Milestone has not been marked complete yet')

    return prisma.campaignMilestone.update({
      where: { id: milestoneId },
      data: { approvedAt: new Date() },
    })
  }

  // ─── Disputes ─────────────────────────────────────────────────────

  async raiseDispute(userId: string, input: CreateDisputeInput) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: input.campaignId },
    })

    if (!campaign) throw new Error('Campaign not found')

    const isParticipant =
      campaign.companyUserId === userId ||
      campaign.selectedInfluencerId === userId

    if (!isParticipant) throw new Error('Unauthorized')

    return prisma.campaignDispute.create({
      data: {
        campaignId: input.campaignId,
        raisedBy: userId,
        reason: input.reason,
        description: input.description,
      },
    })
  }

  async getDisputes(userId: string, campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) throw new Error('Campaign not found')

    const isParticipant =
      campaign.companyUserId === userId ||
      campaign.selectedInfluencerId === userId

    if (!isParticipant) throw new Error('Unauthorized')

    return prisma.campaignDispute.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ─── Reviews ──────────────────────────────────────────────────────

  async submitReview(userId: string, input: CreateReviewInput) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: input.campaignId },
    })

    if (!campaign) throw new Error('Campaign not found')
    if (campaign.status !== 'COMPLETED') {
      throw new Error('Reviews can only be submitted after campaign completion')
    }

    const isParticipant =
      campaign.companyUserId === userId ||
      campaign.selectedInfluencerId === userId

    if (!isParticipant) throw new Error('Unauthorized')

    if (input.rating < 1 || input.rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }

    return prisma.campaignReview.create({
      data: {
        campaignId: input.campaignId,
        reviewerId: userId,
        revieweeId: input.revieweeId,
        rating: input.rating,
        comment: input.comment,
      },
    })
  }

  async getReviews(userId: string) {
    return prisma.campaignReview.findMany({
      where: { revieweeId: userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async completeCampaign(companyUserId: string, campaignId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, companyUserId },
    })

    if (!campaign) throw new Error('Campaign not found')
    if (campaign.status !== 'IN_PROGRESS') {
      throw new Error('Only in-progress campaigns can be completed')
    }

    return prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })
  }

  // ─── AI Proposal Helper ───────────────────────────────────────────

  async generateProposal(
    influencerId: string,
    campaignId: string,
    influencerBio: string,
    followerCount: number,
    niche: string
  ) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) throw new Error('Campaign not found')

    const prompt = `You are helping a Kenyan influencer write a compelling campaign proposal.

Campaign Details:
- Title: ${campaign.title}
- Description: ${campaign.description}
- Budget: KES ${campaign.budget}
- Deliverables: ${campaign.deliverables.join(', ')}
- Timeline: ${campaign.timeline} days
- Target Audience: ${campaign.targetAudienceAge || 'General'}, ${campaign.targetAudienceLocation || 'Kenya'}

Influencer Profile:
- Bio: ${influencerBio}
- Followers: ${followerCount.toLocaleString()}
- Niche: ${niche}

Write a professional, persuasive campaign proposal (150-250 words) that:
1. Opens with why they are a great fit for this campaign
2. Highlights their relevant audience and engagement
3. Briefly outlines their content approach for the deliverables
4. Ends with a confident closing statement
Keep it authentic and specific to the Kenyan market.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 400,
    })

    return {
      proposal: response.choices[0]?.message?.content || '',
      tokensUsed: response.usage?.total_tokens || 0,
    }
  }

  // ─── Stats ────────────────────────────────────────────────────────

  async getCampaignStats(userId: string, campaignId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, companyUserId: userId },
      include: {
        applications: true,
        milestones: true,
        _count: { select: { messages: true } },
      },
    })

    if (!campaign) throw new Error('Campaign not found')

    const completedMilestones = campaign.milestones.filter((m) => m.completed).length
    const approvedMilestones = campaign.milestones.filter((m) => m.approvedAt).length
    const pendingApplications = campaign.applications.filter((a) => a.status === 'PENDING').length

    return {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
        budget: campaign.budget,
        currency: campaign.currency,
      },
      stats: {
        totalApplications: campaign.applicationsCount,
        pendingApplications,
        totalMilestones: campaign.milestones.length,
        completedMilestones,
        approvedMilestones,
        totalMessages: campaign._count.messages,
        escrowFunded: campaign.escrowFunded,
        escrowAmount: campaign.escrowAmount,
      },
    }
  }
}
