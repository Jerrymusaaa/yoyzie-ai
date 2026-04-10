import { Request, Response, NextFunction } from 'express'
import { sendError } from '../utils/response'

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, accountCategory, accountType } = req.body

  if (!name || !email || !password || !accountCategory || !accountType) {
    return sendError(res, 'All fields are required: name, email, password, accountCategory, accountType')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendError(res, 'Invalid email address')
  }

  if (password.length < 8) {
    return sendError(res, 'Password must be at least 8 characters')
  }

  const validCategories = ['INDIVIDUAL', 'INFLUENCER', 'BUSINESS']
  if (!validCategories.includes(accountCategory)) {
    return sendError(res, `accountCategory must be one of: ${validCategories.join(', ')}`)
  }

  const validTypes = [
    'INDIVIDUAL_PRO', 'CREATOR', 'POWER_USER',
    'INFLUENCER_FREE', 'INFLUENCER_STARTER', 'INFLUENCER_PRO', 'CREATOR_MODE',
    'SME', 'GROWING_BUSINESS', 'ENTERPRISE'
  ]
  if (!validTypes.includes(accountType)) {
    return sendError(res, `accountType must be one of: ${validTypes.join(', ')}`)
  }

  next()
}

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  if (!email || !password) {
    return sendError(res, 'Email and password are required')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendError(res, 'Invalid email address')
  }

  next()
}
