export interface TokenPayload {
  userId: string
  email: string
  accountCategory: string
  accountType: string
}

export interface OAuthTokens {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  scopes?: string[]
}

export interface SocialProfileData {
  platformAccountId: string
  platformUsername?: string
  platformDisplayName?: string
  followerCount?: number
  followingCount?: number
  postCount?: number
  profileImageUrl?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
