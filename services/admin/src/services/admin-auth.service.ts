import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateAdminToken } from '../utils/jwt'
import { createAuditLog } from '../utils/audit'
import { AdminRole, CreateAdminInput } from '../types'

const prisma = new PrismaClient()

const ROLE_ACCESS_LEVELS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'LEVEL_5',
  OPERATIONS_MANAGER: 'LEVEL_4',
  FINANCE_MANAGER: 'LEVEL_4',
  MARKETING_MANAGER: 'LEVEL_3',
  ANALYTICS_MANAGER: 'LEVEL_3',
  HEAD_OF_SUPPORT: 'LEVEL_3',
  CONTENT_MODERATOR: 'LEVEL_2',
  SUPPORT_AGENT: 'LEVEL_1',
}

export class AdminAuthService {

  async createAdmin(input: CreateAdminInput, createdBy?: string) {
    const existing = await prisma.adminUser.findUnique({ where: { email: input.email } })
    if (existing) throw new Error('Admin with this email already exists')

    const passwordHash = await bcrypt.hash(input.password, 12)
    const accessLevel = ROLE_ACCESS_LEVELS[input.role as AdminRole]

    const admin = await prisma.adminUser.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        role: input.role as any,
        accessLevel: accessLevel as any,
      },
      select: {
        id: true, email: true, name: true, role: true, accessLevel: true, createdAt: true,
      },
    })

    if (createdBy) {
      await createAuditLog({
        adminUserId: createdBy,
        action: 'CREATE_ADMIN',
        targetEntity: 'AdminUser',
        targetId: admin.id,
        changesAfter: { email: admin.email, role: admin.role },
      })
    }

    return admin
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const admin = await prisma.adminUser.findUnique({ where: { email } })

    if (!admin || !admin.isActive) {
      throw new Error('Invalid credentials')
    }

    const valid = await bcrypt.compare(password, admin.passwordHash)
    if (!valid) throw new Error('Invalid credentials')

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ipAddress },
    })

    const token = generateAdminToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role as AdminRole,
      accessLevel: admin.accessLevel as any,
    })

    await createAuditLog({
      adminUserId: admin.id,
      action: 'ADMIN_LOGIN',
      ipAddress,
      userAgent,
    })

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        accessLevel: admin.accessLevel,
      },
      token,
    }
  }

  async getAdmins() {
    return prisma.adminUser.findMany({
      select: {
        id: true, email: true, name: true, role: true,
        accessLevel: true, isActive: true, lastLoginAt: true, createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async deactivateAdmin(adminId: string, deactivatedBy: string) {
    const admin = await prisma.adminUser.findUnique({ where: { id: adminId } })
    if (!admin) throw new Error('Admin not found')

    await prisma.adminUser.update({
      where: { id: adminId },
      data: { isActive: false },
    })

    await createAuditLog({
      adminUserId: deactivatedBy,
      action: 'DEACTIVATE_ADMIN',
      targetEntity: 'AdminUser',
      targetId: adminId,
    })

    return { message: 'Admin deactivated' }
  }
}
