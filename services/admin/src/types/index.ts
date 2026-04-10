export type AdminRole =
  | 'SUPER_ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'FINANCE_MANAGER'
  | 'MARKETING_MANAGER'
  | 'ANALYTICS_MANAGER'
  | 'HEAD_OF_SUPPORT'
  | 'CONTENT_MODERATOR'
  | 'SUPPORT_AGENT'

export type AdminAccessLevel =
  | 'LEVEL_1'
  | 'LEVEL_2'
  | 'LEVEL_3'
  | 'LEVEL_4'
  | 'LEVEL_5'

export interface AdminTokenPayload {
  adminId: string
  email: string
  role: AdminRole
  accessLevel: AdminAccessLevel
}

export interface CreateAdminInput {
  email: string
  name: string
  password: string
  role: AdminRole
}

export interface UpdateUserInput {
  name?: string
  email?: string
  status?: string
  accountType?: string
}

export interface BanUserInput {
  reason: string
  isPermanent: boolean
  bannedUntil?: string
}

export interface ModerationReportInput {
  targetUserId: string
  targetType: string
  targetId: string
  reason: string
  description?: string
}

export interface ReviewModerationInput {
  action: string
  actionReason: string
}

export interface CreateTicketInput {
  subject: string
  description: string
  priority?: string
}

export interface ReplyTicketInput {
  message: string
}

export interface CreatePromoInput {
  code: string
  discountPct: number
  maxUses?: number
  validUntil?: string
}

export interface AuditLogInput {
  adminUserId: string
  action: string
  targetEntity?: string
  targetId?: string
  changesBefore?: any
  changesAfter?: any
  ipAddress?: string
  userAgent?: string
}

// Role-based permission map
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ['*'],
  OPERATIONS_MANAGER: [
    'users.read', 'users.update', 'users.suspend',
    'disputes.read', 'disputes.resolve',
    'moderation.read', 'moderation.action',
    'support.read', 'support.reply',
    'platform.health',
  ],
  FINANCE_MANAGER: [
    'billing.read', 'billing.update',
    'wallet.read', 'wallet.payouts',
    'invoices.read',
    'disputes.read', 'disputes.financial',
  ],
  MARKETING_MANAGER: [
    'announcements.read', 'announcements.create',
    'promo.read', 'promo.create',
    'users.read',
  ],
  ANALYTICS_MANAGER: [
    'analytics.read',
    'users.read',
    'billing.read',
  ],
  HEAD_OF_SUPPORT: [
    'support.read', 'support.reply', 'support.assign',
    'users.read', 'users.basic_unlock',
    'tickets.all',
  ],
  CONTENT_MODERATOR: [
    'moderation.read', 'moderation.action',
    'users.read',
    'reports.read',
  ],
  SUPPORT_AGENT: [
    'support.read', 'support.reply',
    'users.read',
  ],
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload
    }
  }
}
