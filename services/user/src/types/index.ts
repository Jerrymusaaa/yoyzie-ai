export interface TokenPayload {
  userId: string
  email: string
  accountCategory: string
  accountType: string
}

export interface UpdateProfileInput {
  name?: string
  bio?: string
  website?: string
  location?: string
  phone?: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
