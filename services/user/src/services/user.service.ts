import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { UpdateProfileInput, ChangePasswordInput } from '../types'

const prisma = new PrismaClient()

export class UserService {

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        accountCategory: true,
        accountType: true,
        emailVerified: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        oauthAccounts: {
          select: {
            provider: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) throw new Error('User not found')
    if (user.status === 'DELETED') throw new Error('User not found')

    return user
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name && { name: input.name }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        accountCategory: true,
        accountType: true,
        emailVerified: true,
        updatedAt: true,
      },
    })

    return updated
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const { currentPassword, newPassword } = input

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    if (!user.passwordHash) {
      throw new Error('This account uses social login. Password cannot be changed.')
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw new Error('Current password is incorrect')

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters')
    }

    if (currentPassword === newPassword) {
      throw new Error('New password must be different from current password')
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    // Revoke all refresh tokens so user must log in again
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    return { message: 'Password changed successfully. Please log in again.' }
  }

  async updateAccountType(userId: string, accountType: string) {
    const validTypes = [
      'INDIVIDUAL_PRO', 'CREATOR', 'POWER_USER',
      'INFLUENCER_FREE', 'INFLUENCER_STARTER', 'INFLUENCER_PRO', 'CREATOR_MODE',
      'SME', 'GROWING_BUSINESS', 'ENTERPRISE',
    ]

    if (!validTypes.includes(accountType)) {
      throw new Error(`Invalid account type. Must be one of: ${validTypes.join(', ')}`)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { accountType: accountType as any },
      select: {
        id: true,
        name: true,
        email: true,
        accountCategory: true,
        accountType: true,
      },
    })

    return updated
  }

  async getSessions(userId: string) {
    const sessions = await prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' },
      take: 10,
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastSeenAt: true,
      },
    })

    return sessions
  }

  async deleteAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    if (user.passwordHash) {
      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) throw new Error('Password is incorrect')
    }

    // Soft delete
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'DELETED',
        email: `deleted_${userId}_${user.email}`,
      },
    })

    // Revoke all tokens
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    return { message: 'Account deleted successfully' }
  }

  async getPublicProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        accountCategory: true,
        accountType: true,
        createdAt: true,
      },
    })

    if (!user) throw new Error('User not found')
    return user
  }

  async searchUsers(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          accountCategory: true,
          accountType: true,
          emailVerified: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
