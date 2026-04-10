import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email'
import { RegisterInput, LoginInput } from '../types'

const prisma = new PrismaClient()

export class AuthService {
  async register(input: RegisterInput) {
    const { name, email, password, accountCategory, accountType } = input

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new Error('An account with this email already exists')
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const emailVerifyToken = crypto.randomBytes(32).toString('hex')
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        accountCategory: accountCategory as any,
        accountType: accountType as any,
        emailVerifyToken,
        emailVerifyExpiry,
      },
    })

    await sendVerificationEmail(email, emailVerifyToken, name)

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      accountCategory: user.accountCategory,
      accountType: user.accountType,
      emailVerified: user.emailVerified,
    }
  }

  async login(input: LoginInput, ipAddress?: string, userAgent?: string) {
    const { email, password } = input

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.passwordHash) {
      throw new Error('Invalid email or password')
    }

    if (user.status === 'SUSPENDED') {
      throw new Error('Your account has been suspended. Contact support.')
    }

    if (user.status === 'DELETED') {
      throw new Error('Invalid email or password')
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    if (!passwordValid) {
      throw new Error('Invalid email or password')
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      accountCategory: user.accountCategory,
      accountType: user.accountType,
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.userSession.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
      },
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountCategory: user.accountCategory,
        accountType: user.accountType,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
    }
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      throw new Error('Invalid or expired verification link')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        status: 'ACTIVE',
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    })

    return { message: 'Email verified successfully' }
  }

  async refreshTokens(token: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token } })

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token')
    }

    const payload = verifyRefreshToken(token)

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || user.status !== 'ACTIVE') {
      throw new Error('User not found or inactive')
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    })

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      accountCategory: user.accountCategory,
      accountType: user.accountType,
    }

    const newAccessToken = generateAccessToken(tokenPayload)
    const newRefreshToken = generateRefreshToken(tokenPayload)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    })
    return { message: 'Logged out successfully' }
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    // Always respond the same way — don't reveal if email exists
    if (!user) return { message: 'If that email exists, a reset link has been sent' }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry,
      },
    })

    await sendPasswordResetEmail(email, resetToken, user.name)

    return { message: 'If that email exists, a reset link has been sent' }
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      throw new Error('Invalid or expired reset link')
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    })

    // Revoke all refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    return { message: 'Password reset successfully. Please log in.' }
  }

  async handleOAuthUser(
    provider: 'GOOGLE' | 'APPLE',
    providerAccountId: string,
    email: string,
    name: string
  ) {
    let user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      const existingOauth = await prisma.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: { provider, providerAccountId },
        },
      })

      if (!existingOauth) {
        await prisma.oAuthAccount.create({
          data: { userId: user.id, provider, providerAccountId },
        })
      }
    } else {
      user = await prisma.user.create({
        data: {
          name,
          email,
          emailVerified: true,
          status: 'ACTIVE',
          accountCategory: 'INDIVIDUAL',
          accountType: 'INDIVIDUAL_PRO',
          oauthAccounts: {
            create: { provider, providerAccountId },
          },
        },
      })
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      accountCategory: user.accountCategory,
      accountType: user.accountType,
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return { user, accessToken, refreshToken }
  }

  async getMe(userId: string) {
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
      },
    })

    if (!user) throw new Error('User not found')
    return user
  }
}
