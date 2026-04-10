import { PrismaClient } from '@prisma/client'
import { CreateTicketInput, ReplyTicketInput } from '../types'

const prisma = new PrismaClient()

export class SupportService {

  async createTicket(userId: string, input: CreateTicketInput) {
    return prisma.supportTicket.create({
      data: {
        userId,
        subject: input.subject,
        description: input.description,
        priority: (input.priority as any) || 'MEDIUM',
      },
    })
  }

  async getTickets(
    status?: string,
    priority?: string,
    assignedTo?: string,
    page = 1,
    limit = 20
  ) {
    const skip = (page - 1) * limit
    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assignedTo) where.assignedTo = assignedTo

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        skip,
        take: limit,
        include: {
          _count: { select: { replies: true } },
        },
      }),
      prisma.supportTicket.count({ where }),
    ])

    return {
      tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async getTicket(ticketId: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        replies: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!ticket) throw new Error('Ticket not found')
    return ticket
  }

  async getUserTickets(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { replies: true } } },
      }),
      prisma.supportTicket.count({ where: { userId } }),
    ])

    return {
      tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async replyToTicket(
    ticketId: string,
    senderId: string,
    input: ReplyTicketInput,
    isAdmin = false
  ) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) throw new Error('Ticket not found')

    const reply = await prisma.supportTicketReply.create({
      data: {
        ticketId,
        senderId,
        isAdmin,
        message: input.message,
      },
    })

    if (isAdmin && ticket.status === 'OPEN') {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' },
      })
    }

    return reply
  }

  async updateTicketStatus(ticketId: string, status: string, adminId: string) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) throw new Error('Ticket not found')

    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: status as any,
        ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
        ...(status === 'IN_PROGRESS' && { assignedTo: adminId }),
      },
    })
  }

  async getTicketStats() {
    const [total, open, inProgress, resolved] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
    ])

    return { total, open, inProgress, resolved }
  }
}
