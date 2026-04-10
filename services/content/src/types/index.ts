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

export type Tone =
  | 'professional'
  | 'casual'
  | 'humorous'
  | 'inspirational'
  | 'educational'
  | 'promotional'

export interface GenerateCaptionInput {
  platform: Platform
  topic: string
  tone?: Tone
  includeHashtags?: boolean
  includeEmojis?: boolean
  language?: 'en' | 'sw' | 'sheng'
  count?: number
  brandVoice?: BrandVoiceInput
}

export interface GenerateHashtagsInput {
  topic: string
  platform: Platform
  count?: number
  includeKenyanTrends?: boolean
}

export interface AdaptContentInput {
  originalContent: string
  fromPlatform: Platform
  toPlatforms: Platform[]
  tone?: Tone
}

export interface GenerateThreadInput {
  topic: string
  pointCount?: number
  tone?: Tone
}

export interface GenerateArticleInput {
  topic: string
  tone?: Tone
  wordCount?: number
  includeHeadings?: boolean
}

export interface BrandVoiceInput {
  tone?: string
  style?: string
  keywords?: string[]
  avoidWords?: string[]
  examples?: string[]
}

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
