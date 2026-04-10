import { Request, Response } from 'express'
import { AdminAuthService } from '../services/admin-auth.service'
import { UserManagementService } from '../services/user-management.service'
import { ModerationService } from '../services/moderation.service'
import { SupportService } from '../services/support.service'
import { AdminService } from '../services/admin.service'
import { sendSuccess, sendError } from '../utils/response'

const adminAuthService = new AdminAuthService()
const userService = new UserManagementService()
const moderationService = new ModerationService()
const supportService = new SupportService()
const adminService = new AdminService()

export class AdminController {

  // ─── Auth ─────────────────────────────────────────────────────────

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      if (!email || !password) return sendError(res, 'Email and password required')

      const result = await adminAuthService.login(
        email, password, req.ip, req.headers['user-agent']
      )
      return sendSuccess(res, 'Admin login successful', result)
    } catch (error: any) {
      return sendError(res, error.message, 401)
    }
  }

  async createAdmin(req: Request, res: Response) {
    try {
      const { email, name, password, role } = req.body
      if (!email || !name || !password || !role) {
        return sendError(res, 'email, name, password, and role are required')
      }

      const admin = await adminAuthService.createAdmin(req.body, req.admin?.adminId)
      return sendSuccess(res, 'Admin created', admin, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getAdmins(req: Request, res: Response) {
    try {
      const admins = await adminAuthService.getAdmins()
      return sendSuccess(res, 'Admins fetched', admins)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async deactivateAdmin(req: Request, res: Response) {
    try {
      const adminId = req.params.id as string
      const result = await adminAuthService.deactivateAdmin(adminId, req.admin!.adminId)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // ─── Dashboard ────────────────────────────────────────────────────

  async getDashboard(req: Request, res: Response) {
    try {
      const summary = await adminService.getDashboardSummary()
      return sendSuccess(res, 'Dashboard summary fetched', summary)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getPlatformHealth(req: Request, res: Response) {
    try {
      const health = await adminService.getPlatformHealth()
      return sendSuccess(res, 'Platform health fetched', health)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // ─── User Management ──────────────────────────────────────────────

  async searchUsers(req: Request, res: Response) {
    try {
      const query = req.query.q as string || ''
      const status = req.query.status as string | undefined
      const accountType = req.query.accountType as string | undefined
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      const result = await userService.searchUsers(query, status, accountType, page, limit)
      return sendSuccess(res, 'Users fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getUserDetail(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string
      const user = await userService.getUserDetail(userId)
      return sendSuccess(res, 'User detail fetched', user)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string
      const result = await userService.updateUser(req.admin!.adminId, userId, req.body, req.ip)
      return sendSuccess(res, 'User updated', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async suspendUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string
      const { reason } = req.body
      if (!reason) return sendError(res, 'Reason is required')

      const result = await userService.suspendUser(req.admin!.adminId, userId, reason, req.ip)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async reactivateUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string
      const result = await userService.reactivateUser(req.admin!.adminId, userId, req.ip)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async banUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string
      const { reason, isPermanent, bannedUntil } = req.body
      if (!reason) return sendError(res, 'Reason is required')

      const result = await userService.banUser(
        req.admin!.adminId, userId, { reason, isPermanent, bannedUntil }, req.ip
      )
      return sendSuccess(res, 'User banned', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string
      const { reason } = req.body
      if (!reason) return sendError(res, 'Reason is required')

      const result = await userService.deleteUser(req.admin!.adminId, userId, reason, req.ip)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getPlatformStats(req: Request, res: Response) {
    try {
      const stats = await userService.getPlatformStats()
      return sendSuccess(res, 'Platform stats fetched', stats)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // ─── Moderation ───────────────────────────────────────────────────

  async getReports(req: Request, res: Response) {
    try {
      const status = req.query.status as string | undefined
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      const result = await moderationService.getReports(status, page, limit)
      return sendSuccess(res, 'Reports fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async reviewReport(req: Request, res: Response) {
    try {
      const reportId = req.params.reportId as string
      const { action, actionReason } = req.body

      if (!action || !actionReason) {
        return sendError(res, 'action and actionReason are required')
      }

      const result = await moderationService.reviewReport(
        req.admin!.adminId, reportId, { action, actionReason }, req.ip
      )

      return sendSuccess(res, 'Report reviewed', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getModerationStats(req: Request, res: Response) {
    try {
      const stats = await moderationService.getReportStats()
      return sendSuccess(res, 'Moderation stats fetched', stats)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // ─── Support ──────────────────────────────────────────────────────

  async getTickets(req: Request, res: Response) {
    try {
      const status = req.query.status as string | undefined
      const priority = req.query.priority as string | undefined
      const assignedTo = req.query.assignedTo as string | undefined
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20

      const result = await supportService.getTickets(status, priority, assignedTo, page, limit)
      return sendSuccess(res, 'Tickets fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getTicket(req: Request, res: Response) {
    try {
      const ticketId = req.params.ticketId as string
      const ticket = await supportService.getTicket(ticketId)
      return sendSuccess(res, 'Ticket fetched', ticket)
    } catch (error: any) {
      return sendError(res, error.message, 404)
    }
  }

  async replyToTicket(req: Request, res: Response) {
    try {
      const ticketId = req.params.ticketId as string
      const { message } = req.body
      if (!message) return sendError(res, 'Message is required')

      const reply = await supportService.replyToTicket(
        ticketId, req.admin!.adminId, { message }, true
      )

      return sendSuccess(res, 'Reply sent', reply, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async updateTicketStatus(req: Request, res: Response) {
    try {
      const ticketId = req.params.ticketId as string
      const { status } = req.body
      if (!status) return sendError(res, 'Status is required')

      const ticket = await supportService.updateTicketStatus(
        ticketId, status, req.admin!.adminId
      )

      return sendSuccess(res, 'Ticket status updated', ticket)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getTicketStats(req: Request, res: Response) {
    try {
      const stats = await supportService.getTicketStats()
      return sendSuccess(res, 'Ticket stats fetched', stats)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // ─── Audit Logs ───────────────────────────────────────────────────

  async getAuditLogs(req: Request, res: Response) {
    try {
      const adminUserId = req.query.adminId as string | undefined
      const action = req.query.action as string | undefined
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50

      const result = await adminService.getAuditLogs(adminUserId, action, page, limit)
      return sendSuccess(res, 'Audit logs fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  // ─── Promo Codes ──────────────────────────────────────────────────

  async createPromoCode(req: Request, res: Response) {
    try {
      const { code, discountPct, maxUses, validUntil } = req.body
      if (!code || !discountPct) return sendError(res, 'code and discountPct are required')

      const promo = await adminService.createPromoCode(req.admin!.adminId, {
        code, discountPct, maxUses, validUntil,
      })

      return sendSuccess(res, 'Promo code created', promo, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getPromoCodes(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const result = await adminService.getPromoCodes(page, limit)
      return sendSuccess(res, 'Promo codes fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async validatePromoCode(req: Request, res: Response) {
    try {
      const code = req.params.code as string
      const result = await adminService.validatePromoCode(code)
      return sendSuccess(res, 'Promo code is valid', result)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  // ─── Financial ────────────────────────────────────────────────────

  async getFinancialOverview(req: Request, res: Response) {
    try {
      const overview = await adminService.getFinancialOverview(process.env.WALLET_SERVICE_URL || 'http://localhost:5009')
      return sendSuccess(res, 'Financial overview fetched', overview)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }
}
