export interface TokenPayload {
  userId: string
  email: string
  accountCategory: string
  accountType: string
}

export type TrendPlatform = 'TWITTER' | 'INSTAGRAM' | 'TIKTOK' | 'GENERAL'
export type TrendCategory = 'HASHTAG' | 'SOUND' | 'TOPIC' | 'CHALLENGE'

export interface TrendItem {
  name: string
  description?: string
  tweetVolume?: number
  postVolume?: number
  rank?: number
  url?: string
  county?: string
}

export interface TrendSuggestionRequest {
  content: string
  platform: TrendPlatform
  count?: number
}

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
