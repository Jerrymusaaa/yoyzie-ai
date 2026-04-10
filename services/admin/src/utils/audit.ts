import { PrismaClient } from '@prisma/client'
import { AuditLogInput } from '../types'

const prisma = new PrismaClient()

export const createAuditLog = async (input: AuditLogInput) => {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: input.adminUserId,
        action: input.action,
        targetEntity: input.targetEntity,
        targetId: input.targetId,
        changesBefore: input.changesBefore,
        changesAfter: input.changesAfter,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    })
  } catch (error) {
    console.error('Audit log creation failed:', error)
  }
}
