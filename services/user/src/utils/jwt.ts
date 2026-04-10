import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { TokenPayload } from '../types'

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload
}
