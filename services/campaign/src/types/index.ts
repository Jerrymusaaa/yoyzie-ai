export interface TokenPayload {
  userId: string
  email: string
  accountCategory: string
  accountType: string
}

export interface CreateCampaignInput {
  title: string
  description: string
  budget: number
  currency?: string
  platforms: string[]
  category: string
  niche?: string
  deliverables: string[]
  timeline: number
  targetAudienceAge?: string
  targetAudienceLocation?: string
  minFollowers?: number
  maxBudget?: number
}

export interface UpdateCampaignInput {
  title?: string
  description?: string
  budget?: number
  platforms?: string[]
  category?: string
  niche?: string
  deliverables?: string[]
  timeline?: number
  targetAudienceAge?: string
  targetAudienceLocation?: string
  minFollowers?: number
  status?: string
}

export interface CreateApplicationInput {
  campaignId: string
  proposalText: string
  proposedRate: number
  estimatedReach?: number
  portfolioLinks?: string[]
}

export interface SendMessageInput {
  campaignId: string
  content: string
  messageType?: string
  fileUrl?: string
}

export interface CreateMilestoneInput {
  campaignId: string
  title: string
  description?: string
  dueDate?: string
  amount?: number
}

export interface CreateDisputeInput {
  campaignId: string
  reason: string
  description: string
}

export interface CreateReviewInput {
  campaignId: string
  revieweeId: string
  rating: number
  comment?: string
}

export interface CampaignSearchFilters {
  category?: string
  platform?: string
  minBudget?: number
  maxBudget?: number
  minFollowers?: number
  location?: string
  page?: number
  limit?: number
}

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
