import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { AdminTokenPayload } from '../types'

export const generateAdminToken = (payload: AdminTokenPayload): string => {
  return jwt.sign(payload, env.ADMIN_JWT_SECRET, {
    expiresIn: env.ADMIN_JWT_EXPIRES_IN as any,
  })
}

export const verifyAdminToken = (token: string): AdminTokenPayload => {
  return jwt.verify(token, env.ADMIN_JWT_SECRET) as AdminTokenPayload
}
