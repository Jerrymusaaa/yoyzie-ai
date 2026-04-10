import { PrismaClient } from '@prisma/client'
import { createAuditLog } from '../utils/audit'
import { UpdateUserInput, BanUserInput } from '../types'

const prisma = new PrismaClient()

export class UserManagementService {

  async searchUsers(query: string, status?: string, accountType?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where: any = {}

    if (query) {
      where.OR = [
        { email: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
        { id: { contains: query } },
      ]
    }

    if (status) where.status = status
    if (accountType) where.accountType = accountType

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true,
          accountCategory: true, accountType: true,
          status: true, emailVerified: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return {
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        oauthAccounts: { select: { provider: true, createdAt: true } },
        sessions: {
          orderBy: { lastSeenAt: 'desc' },
          take: 5,
          select: { ipAddress: true, userAgent: true, createdAt: true, lastSeenAt: true },
        },
        _count: { select: { refreshTokens: true } },
      },
    })

    if (!user) throw new Error('User not found')
    return user
  }

  async updateUser(adminId: string, userId: string, input: UpdateUserInput, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const before = { name: user.name, email: user.email, status: user.status, accountType: user.accountType }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.email && { email: input.email }),
        ...(input.status && { status: input.status as any }),
        ...(input.accountType && { accountType: input.accountType as any }),
      },
    })

    await createAuditLog({
      adminUserId: adminId,
      action: 'UPDATE_USER',
      targetEntity: 'User',
      targetId: userId,
      changesBefore: before,
      changesAfter: input,
      ipAddress,
    })

    return updated
  }

  async suspendUser(adminId: string, userId: string, reason: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' },
    })

    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    await createAuditLog({
      adminUserId: adminId,
      action: 'SUSPEND_USER',
      targetEntity: 'User',
      targetId: userId,
      changesBefore: { status: user.status },
      changesAfter: { status: 'SUSPENDED', reason },
      ipAddress,
    })

    return { message: 'User suspended' }
  }

  async reactivateUser(adminId: string, userId: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    })

    await createAuditLog({
      adminUserId: adminId,
      action: 'REACTIVATE_USER',
      targetEntity: 'User',
      targetId: userId,
      changesAfter: { status: 'ACTIVE' },
      ipAddress,
    })

    return { message: 'User reactivated' }
  }

  async banUser(adminId: string, userId: string, input: BanUserInput, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const ban = await prisma.userBan.create({
      data: {
        userId,
        bannedBy: adminId,
        reason: input.reason,
        isPermanent: input.isPermanent,
        bannedUntil: input.bannedUntil ? new Date(input.bannedUntil) : undefined,
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' },
    })

    await createAuditLog({
      adminUserId: adminId,
      action: input.isPermanent ? 'PERMANENT_BAN' : 'TEMPORARY_BAN',
      targetEntity: 'User',
      targetId: userId,
      changesAfter: { reason: input.reason, isPermanent: input.isPermanent, bannedUntil: input.bannedUntil },
      ipAddress,
    })

    return ban
  }

  async deleteUser(adminId: string, userId: string, reason: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'DELETED',
        email: `deleted_${userId}_${user.email}`,
      },
    })

    await createAuditLog({
      adminUserId: adminId,
      action: 'DELETE_USER',
      targetEntity: 'User',
      targetId: userId,
      changesBefore: { email: user.email, status: user.status },
      changesAfter: { status: 'DELETED', reason },
      ipAddress,
    })

    return { message: 'User account deleted' }
  }

  async getPlatformStats() {
    const [
      totalUsers, activeUsers, suspendedUsers,
      individualUsers, influencerUsers, businessUsers,
      newUsersToday, newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({ where: { accountCategory: 'INDIVIDUAL' } }),
      prisma.user.count({ where: { accountCategory: 'INFLUENCER' } }),
      prisma.user.count({ where: { accountCategory: 'BUSINESS' } }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      }),
    ])

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        byCategory: {
          individual: individualUsers,
          influencer: influencerUsers,
          business: businessUsers,
        },
        newToday: newUsersToday,
        newThisMonth: newUsersThisMonth,
      },
    }
  }
}
