export interface TokenPayload {
  userId: string
  email: string
  accountCategory: string
  accountType: string
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

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
