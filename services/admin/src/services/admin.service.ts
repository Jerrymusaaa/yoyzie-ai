import { PrismaClient } from '@prisma/client'
import { createAuditLog } from '../utils/audit'
import { CreatePromoInput } from '../types'

const prisma = new PrismaClient()

export class AdminService {

  async getAuditLogs(adminUserId?: string, action?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit
    const where: any = {}
    if (adminUserId) where.adminUserId = adminUserId
    if (action) where.action = { contains: action, mode: 'insensitive' }

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          adminUser: { select: { name: true, email: true, role: true } },
        },
      }),
      prisma.adminAuditLog.count({ where }),
    ])

    return {
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async getPlatformHealth() {
    const services = [
      { name: 'Auth Service', port: 5001 },
      { name: 'User Service', port: 5002 },
      { name: 'Social Service', port: 5003 },
      { name: 'Content Service', port: 5004 },
      { name: 'Scheduling Service', port: 5005 },
      { name: 'Analytics Service', port: 5006 },
      { name: 'Campaign Service', port: 5007 },
      { name: 'Wallet Service', port: 5009 },
      { name: 'Billing Service', port: 5010 },
      { name: 'Notification Service', port: 5011 },
      { name: 'Trend Service', port: 5012 },
    ]

    const healthChecks = await Promise.allSettled(
      services.map(async (service) => {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000)
        try {
          const response = await fetch(
            `http://localhost:${service.port}/health`,
            { signal: controller.signal }
          )
          clearTimeout(timeout)
          const data = await response.json() as any
          return { ...service, status: 'healthy', data }
        } catch {
          clearTimeout(timeout)
          return { ...service, status: 'unhealthy', data: null }
        }
      })
    )

    return healthChecks.map((result, i) => {
      if (result.status === 'fulfilled') return result.value
      return { ...services[i], status: 'unhealthy', data: null }
    })
  }

  async createPromoCode(adminId: string, input: CreatePromoInput) {
    const existing = await prisma.promoCode.findUnique({ where: { code: input.code } })
    if (existing) throw new Error('Promo code already exists')

    const promo = await prisma.promoCode.create({
      data: {
        code: input.code.toUpperCase(),
        discountPct: input.discountPct,
        maxUses: input.maxUses,
        validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
        createdBy: adminId,
      },
    })

    await createAuditLog({
      adminUserId: adminId,
      action: 'CREATE_PROMO_CODE',
      targetEntity: 'PromoCode',
      targetId: promo.id,
      changesAfter: { code: promo.code, discountPct: promo.discountPct },
    })

    return promo
  }

  async getPromoCodes(page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const [codes, total] = await Promise.all([
      prisma.promoCode.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.promoCode.count(),
    ])

    return {
      codes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async validatePromoCode(code: string) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promo) throw new Error('Invalid promo code')
    if (!promo.isActive) throw new Error('This promo code is no longer active')
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      throw new Error('This promo code has reached its usage limit')
    }
    if (promo.validUntil && promo.validUntil < new Date()) {
      throw new Error('This promo code has expired')
    }

    return { valid: true, discountPct: promo.discountPct }
  }

  async usePromoCode(code: string) {
    await prisma.promoCode.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    })
  }

  // Financial overview fetched from wallet service via HTTP
  async getFinancialOverview(walletServiceUrl: string) {
    try {
      const response = await fetch(`${walletServiceUrl}/api/v1/wallet/pending-withdrawals`)
      const data = await response.json() as any
      return {
        pendingWithdrawals: data?.data?.pagination?.total || 0,
        note: 'Full financial data available in Wallet Service',
      }
    } catch {
      return {
        pendingWithdrawals: 0,
        note: 'Wallet service unavailable',
      }
    }
  }

  async getDashboardSummary() {
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      openTickets,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.contentModerationReport.count({ where: { status: 'PENDING' } }),
    ])

    return {
      users: { total: totalUsers, active: activeUsers, newToday: newUsersToday },
      support: { openTickets },
      moderation: { pendingReports },
    }
  }
}
