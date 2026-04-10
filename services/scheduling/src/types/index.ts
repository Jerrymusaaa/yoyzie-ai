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

export type PostStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'CANCELLED'

export interface CreatePostInput {
  platform: Platform
  caption: string
  hashtags?: string[]
  mediaUrls?: string[]
  scheduledAt: string
  timezone?: string
}

export interface UpdatePostInput {
  caption?: string
  hashtags?: string[]
  mediaUrls?: string[]
  scheduledAt?: string
  status?: PostStatus
}

export interface CalendarQuery {
  startDate: string
  endDate: string
  platform?: Platform
}

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
