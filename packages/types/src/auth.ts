export interface TokenPayload {
  userId: string
  email: string
  accountCategory: string
  accountType: string
  iat?: number
  exp?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  accountCategory: string
  accountType: string
}

export interface LoginInput {
  email: string
  password: string
}
