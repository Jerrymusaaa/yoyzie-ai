import { PrismaClient } from '@prisma/client'
import { AgentName, AgentRequest, AgentResponse } from '../types'
import { ContentGenerationAgent } from '../agents/content-generation.agent'
import { KenyanTrendAgent } from '../agents/kenyan-trend.agent'
import { AnalyticsInsightAgent } from '../agents/analytics-insight.agent'
import { CampaignStrategyAgent } from '../agents/campaign-strategy.agent'
import { InfluencerMatchingAgent } from '../agents/influencer-matching.agent'
import { ProposalWritingAgent } from '../agents/proposal-writing.agent'
import { FraudDetectionAgent } from '../agents/fraud-detection.agent'
import { AIChatAssistantAgent } from '../agents/ai-chat-assistant.agent'

const prisma = new PrismaClient()

export class OrchestratorService {

  private agents = {
    CONTENT_GENERATION: new ContentGenerationAgent(),
    KENYAN_TREND: new KenyanTrendAgent(),
    ANALYTICS_INSIGHT: new AnalyticsInsightAgent(),
    CAMPAIGN_STRATEGY: new CampaignStrategyAgent(),
    INFLUENCER_MATCHING: new InfluencerMatchingAgent(),
    PROPOSAL_WRITING: new ProposalWritingAgent(),
    FRAUD_DETECTION: new FraudDetectionAgent(),
    AI_CHAT_ASSISTANT: new AIChatAssistantAgent(),
  }

  async runAgent(request: AgentRequest): Promise<AgentResponse> {
    const { agentName, userId, input, userToken } = request
    const startTime = Date.now()

    const job = await prisma.agentJob.create({
      data: {
        userId,
        agentName: agentName as any,
        status: 'RUNNING',
        input,
        startedAt: new Date(),
        model: 'gpt-4o',
      },
    })

    try {
      const agent = this.agents[agentName as keyof typeof this.agents]
      if (!agent) throw new Error(`Unknown agent: ${agentName}`)

      const agentInput = agentName === 'AI_CHAT_ASSISTANT'
        ? { ...input, userId, userToken }
        : input

      const output = await (agent as any).run(agentInput)
      const durationMs = Date.now() - startTime
      const tokensUsed = output.tokensUsed || 0

      await prisma.agentJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          output,
          tokensUsed,
          durationMs,
          completedAt: new Date(),
        },
      })

      await prisma.agentUsageLog.create({
        data: {
          userId,
          agentName,
          tokensUsed,
          model: 'gpt-4o',
          success: true,
        },
      })

      return {
        jobId: job.id,
        agentName,
        output,
        tokensUsed,
        durationMs,
        model: 'gpt-4o',
      }
    } catch (error: any) {
      const durationMs = Date.now() - startTime

      await prisma.agentJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          error: error.message,
          durationMs,
          completedAt: new Date(),
        },
      })

      await prisma.agentUsageLog.create({
        data: {
          userId,
          agentName,
          tokensUsed: 0,
          model: 'gpt-4o',
          success: false,
        },
      })

      throw error
    }
  }

  async getJob(jobId: string, userId: string) {
    const job = await prisma.agentJob.findFirst({
      where: { id: jobId, userId },
    })
    if (!job) throw new Error('Job not found')
    return job
  }

  async getJobHistory(userId: string, agentName?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where: any = { userId }
    if (agentName) where.agentName = agentName

    const [jobs, total] = await Promise.all([
      prisma.agentJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, agentName: true, status: true,
          tokensUsed: true, durationMs: true, createdAt: true, completedAt: true,
        },
      }),
      prisma.agentJob.count({ where }),
    ])

    return {
      jobs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async getUsageStats(userId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const logs = await prisma.agentUsageLog.findMany({
      where: { userId, date: { gte: since } },
    })

    const totalTokens = logs.reduce((s, l) => s + l.tokensUsed, 0)
    const totalRequests = logs.length
    const successRate = logs.length > 0
      ? (logs.filter((l) => l.success).length / logs.length) * 100
      : 0

    const byAgent = logs.reduce((acc: Record<string, any>, log) => {
      if (!acc[log.agentName]) {
        acc[log.agentName] = { requests: 0, tokens: 0, failures: 0 }
      }
      acc[log.agentName].requests++
      acc[log.agentName].tokens += log.tokensUsed
      if (!log.success) acc[log.agentName].failures++
      return acc
    }, {})

    return {
      period: `${days} days`,
      totalTokens,
      totalRequests,
      successRate: parseFloat(successRate.toFixed(1)),
      byAgent,
    }
  }

  getAgentRegistry() {
    return Object.keys(this.agents).map((name) => ({
      name,
      model: 'gpt-4o',
      status: 'active',
    }))
  }
}
