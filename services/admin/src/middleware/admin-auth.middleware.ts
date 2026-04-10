import { Request, Response, NextFunction } from 'express'
import { verifyAdminToken } from '../utils/jwt'
import { sendError } from '../utils/response'
import { AdminRole, ROLE_PERMISSIONS } from '../types'

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'No admin token provided', 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = verifyAdminToken(token)
    req.admin = payload
    next()
  } catch {
    return sendError(res, 'Invalid or expired admin token', 401)
  }
}

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) return sendError(res, 'Unauthorized', 401)

    const role = req.admin.role as AdminRole
    const permissions = ROLE_PERMISSIONS[role] || []

    const hasAccess = permissions.includes('*') || permissions.includes(permission)
    if (!hasAccess) {
      return sendError(
        res,
        `Access denied. Required permission: ${permission}`,
        403
      )
    }

    next()
  }
}

export const requireLevel = (minLevel: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) return sendError(res, 'Unauthorized', 401)

    const levelMap: Record<string, number> = {
      LEVEL_1: 1, LEVEL_2: 2, LEVEL_3: 3, LEVEL_4: 4, LEVEL_5: 5,
    }

    const adminLevel = levelMap[req.admin.accessLevel] || 0
    if (adminLevel < minLevel) {
      return sendError(res, `Access level ${minLevel} required`, 403)
    }

    next()
  }
}
