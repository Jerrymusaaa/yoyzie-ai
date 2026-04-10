import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import { env } from '../config/env'
import { BotAnalysisInput, Platform } from '../types'

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

export class BotDetectionService {

  private calculateEngagementRate(
    followerCount: number,
    avgLikes: number,
    avgComments: number
  ): number {
    if (followerCount === 0) return 0
    return ((avgLikes + avgComments) / followerCount) * 100
  }

  private scoreFollowRatio(followers: number, following: number): number {
    if (following === 0) return 1.0
    const ratio = followers / following
    // Suspicious if following >> followers (ratio < 0.1) or extremely high
    if (ratio < 0.1) return 0.3
    if (ratio < 0.3) return 0.5
    if (ratio < 0.5) return 0.7
    if (ratio > 100) return 0.6 // Could be celebrity but flag
    return 1.0
  }

  private scoreEngagementAuthenticity(
    followerCount: number,
    engagementRate: number,
    platform: string
  ): number {
    // Expected engagement rates by platform and follower tier
    const benchmarks: Record<string, Record<string, number>> = {
      INSTAGRAM: {
        nano: 5.0,   // < 10k
        micro: 3.5,  // 10k-100k
        macro: 2.0,  // 100k-1M
        mega: 1.5,   // > 1M
      },
      TIKTOK: {
        nano: 9.0,
        micro: 6.0,
        macro: 4.0,
        mega: 2.5,
      },
      TWITTER: {
        nano: 2.0,
        micro: 1.5,
        macro: 1.0,
        mega: 0.5,
      },
      LINKEDIN: {
        nano: 4.0,
        micro: 3.0,
        macro: 2.0,
        mega: 1.0,
      },
    }

    const tier = followerCount < 10000 ? 'nano'
      : followerCount < 100000 ? 'micro'
      : followerCount < 1000000 ? 'macro'
      : 'mega'

    const expected = benchmarks[platform]?.[tier] || 2.0

    // Suspiciously high engagement can also indicate fake likes
    if (engagementRate > expected * 5) return 0.4
    if (engagementRate > expected * 3) return 0.6
    if (engagementRate < expected * 0.1) return 0.3
    if (engagementRate < expected * 0.3) return 0.6
    return 1.0
  }

  private async scoreCommentQuality(commentSamples: string[]): Promise<number> {
    if (!commentSamples || commentSamples.length === 0) return 0.7

    const prompt = `Analyze these social media comments and rate their authenticity from 0 to 1.
Comments that look bot-generated include: generic praise ("Great post!", "Amazing!", "Love this!"),
emoji-only responses, irrelevant comments, repeated phrases, or promotional spam.
Authentic comments have specific references to the content, personal opinions, questions, or conversations.

Comments to analyze:
${commentSamples.slice(0, 20).map((c, i) => `${i + 1}. "${c}"`).join('\n')}

Return ONLY a decimal number between 0 and 1 representing authenticity (1 = fully authentic, 0 = all bots). Nothing else.`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 10,
      })

      const score = parseFloat(response.choices[0]?.message?.content?.trim() || '0.7')
      return isNaN(score) ? 0.7 : Math.min(1, Math.max(0, score))
    } catch {
      return 0.7
    }
  }

  async analyzeAccount(
    userId: string,
    platform: Platform,
    input: BotAnalysisInput
  ) {
    const {
      followerCount,
      followingCount,
      postCount,
      avgLikes,
      avgComments,
      followerGrowthRate = 0,
      commentSamples = [],
    } = input

    const engagementRate = this.calculateEngagementRate(followerCount, avgLikes, avgComments)
    const followRatioScore = this.scoreFollowRatio(followerCount, followingCount)
    const engagementScore = this.scoreEngagementAuthenticity(followerCount, engagementRate, platform)
    const commentScore = await this.scoreCommentQuality(commentSamples)

    // Suspicious growth: more than 20% follower increase rapidly
    const suspiciousGrowth = followerGrowthRate > 20

    // Cross-platform consistency score (simplified — in production compare across platforms)
    const crossPlatformScore = 0.75

    // Weighted bot score calculation
    const weights = {
      followRatio: 0.25,
      engagement: 0.35,
      commentQuality: 0.25,
      growthPattern: 0.15,
    }

    const growthScore = suspiciousGrowth ? 0.3 : 1.0

    const authenticityScore =
      followRatioScore * weights.followRatio +
      engagementScore * weights.engagement +
      commentScore * weights.commentQuality +
      growthScore * weights.growthPattern

    const botScore = Math.round((1 - authenticityScore) * 100)
    const realFollowerPct = Math.round(authenticityScore * 100)

    const reportData = {
      followerCount,
      followingCount,
      postCount,
      avgLikes,
      avgComments,
      engagementRate: engagementRate.toFixed(2),
      followRatioScore: followRatioScore.toFixed(2),
      engagementScore: engagementScore.toFixed(2),
      commentScore: commentScore.toFixed(2),
      growthScore: growthScore.toFixed(2),
      suspiciousGrowth,
      authenticityScore: authenticityScore.toFixed(2),
    }

    const report = await prisma.botDetectionReport.upsert({
      where: { userId_platform: { userId, platform } },
      update: {
        botScore,
        realFollowerPct,
        engagementAuthenticityPct: Math.round(engagementScore * 100),
        suspiciousFollowerGrowth: suspiciousGrowth,
        commentQualityScore: Math.round(commentScore * 100),
        crossPlatformConsistencyScore: Math.round(crossPlatformScore * 100),
        reportData,
        lastAnalyzedAt: new Date(),
      },
      create: {
        userId,
        platform,
        botScore,
        realFollowerPct,
        engagementAuthenticityPct: Math.round(engagementScore * 100),
        suspiciousFollowerGrowth: suspiciousGrowth,
        commentQualityScore: Math.round(commentScore * 100),
        crossPlatformConsistencyScore: Math.round(crossPlatformScore * 100),
        reportData,
      },
    })

    return report
  }

  async getReport(userId: string, platform: Platform) {
    const report = await prisma.botDetectionReport.findUnique({
      where: { userId_platform: { userId, platform } },
    })

    if (!report) throw new Error(`No bot detection report found for ${platform}`)
    return report
  }

  async getAllReports(userId: string) {
    return prisma.botDetectionReport.findMany({
      where: { userId },
      orderBy: { lastAnalyzedAt: 'desc' },
    })
  }
}
