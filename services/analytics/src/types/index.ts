export interface TokenPayload {
  userId: string
  email: string
  accountCategory: string
  accountType: string
}

export type Platform =
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'LINKEDIN'
  | 'TWITTER'
  | 'FACEBOOK'
  | 'YOUTUBE'

export interface IngestMetricsInput {
  platform: Platform
  externalPostId: string
  impressions?: number
  reach?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
  clicks?: number
  videoViews?: number
}

export interface IngestAccountMetricsInput {
  platform: Platform
  followers: number
  following?: number
  posts?: number
  totalReach?: number
  totalImpressions?: number
}

export interface BotAnalysisInput {
  followerCount: number
  followingCount: number
  postCount: number
  avgLikes: number
  avgComments: number
  followerGrowthRate?: number
  commentSamples?: string[]
}

export interface TrackClickInput {
  platform: Platform
  postId: string
  clickType: string
  referrer?: string
  userAgent?: string
  ipHash?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
