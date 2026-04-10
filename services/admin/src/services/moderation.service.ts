import { PrismaClient } from '@prisma/client'
import { createAuditLog } from '../utils/audit'
import { ModerationReportInput, ReviewModerationInput } from '../types'

const prisma = new PrismaClient()

export class ModerationService {

  async createReport(reportedBy: string, input: ModerationReportInput) {
    return prisma.contentModerationReport.create({
      data: {
        reportedBy,
        targetUserId: input.targetUserId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        description: input.description,
      },
    })
  }

  async getReports(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where: any = {}
    if (status) where.status = status

    const [reports, total] = await Promise.all([
      prisma.contentModerationReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contentModerationReport.count({ where }),
    ])

    return {
      reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async reviewReport(
    adminId: string,
    reportId: string,
    input: ReviewModerationInput,
    ipAddress?: string
  ) {
    const report = await prisma.contentModerationReport.findUnique({ where: { id: reportId } })
    if (!report) throw new Error('Report not found')

    const updated = await prisma.contentModerationReport.update({
      where: { id: reportId },
      data: {
        status: 'REVIEWED',
        action: input.action as any,
        actionReason: input.actionReason,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    })

    // Apply bans if needed
    if (input.action === 'TEMPORARY_BAN' || input.action === 'PERMANENT_BAN') {
      await prisma.userBan.create({
        data: {
          userId: report.targetUserId,
          bannedBy: adminId,
          reason: input.actionReason,
          isPermanent: input.action === 'PERMANENT_BAN',
          bannedUntil: input.action === 'TEMPORARY_BAN'
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            : undefined,
        },
      })

      await prisma.user.update({
        where: { id: report.targetUserId },
        data: { status: 'SUSPENDED' },
      })
    }

    await createAuditLog({
      adminUserId: adminId,
      action: `MODERATION_${input.action}`,
      targetEntity: 'ContentModerationReport',
      targetId: reportId,
      changesAfter: { action: input.action, reason: input.actionReason },
      ipAddress,
    })

    return updated
  }

  async getReportStats() {
    const [total, pending, reviewed] = await Promise.all([
      prisma.contentModerationReport.count(),
      prisma.contentModerationReport.count({ where: { status: 'PENDING' } }),
      prisma.contentModerationReport.count({ where: { status: 'REVIEWED' } }),
    ])

    return { total, pending, reviewed }
  }
}
