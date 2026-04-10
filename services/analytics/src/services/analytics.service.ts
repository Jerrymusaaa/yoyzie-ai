import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import { env } from '../config/env'
import {
  IngestMetricsInput,
  IngestAccountMetricsInput,
  TrackClickInput,
  Platform,
} from '../types'

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

export class AnalyticsService {

  // ─── Metrics Ingestion ────────────────────────────────────────────

  async ingestPostMetrics(userId: string, input: IngestMetricsInput) {
    const {
      platform,
      externalPostId,
      impressions = 0,
      reach = 0,
      likes = 0,
      comments = 0,
      shares = 0,
      saves = 0,
      clicks = 0,
      videoViews = 0,
    } = input

    const engagementRate = impressions > 0
      ? ((likes + comments + shares + saves) / impressions) * 100
      : 0

    const clickToViewRate = videoViews > 0
      ? (clicks / videoViews) * 100
      : impressions > 0
      ? (clicks / impressions) * 100
      : 0

    const metric = await prisma.postMetric.create({
      data: {
        userId,
        platform,
        externalPostId,
        impressions,
        reach,
        likes,
        comments,
        shares,
        saves,
        clicks,
        videoViews,
        engagementRate,
        clickToViewRate,
      },
    })

    return metric
  }

  async ingestAccountMetrics(userId: string, input: IngestAccountMetricsInput) {
    const {
      platform,
      followers,
      following = 0,
      posts = 0,
      totalReach = 0,
      totalImpressions = 0,
    } = input

    const recentMetrics = await prisma.postMetric.findMany({
      where: {
        userId,
        platform,
        recordedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    })

    const avgEngagementRate = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.engagementRate, 0) / recentMetrics.length
      : 0

    const metric = await prisma.accountMetric.create({
      data: {
        userId,
        platform,
        followers,
        following,
        posts,
        totalReach,
        totalImpressions,
        avgEngagementRate,
      },
    })

    return metric
  }

  // ─── Click Tracking ───────────────────────────────────────────────

  async trackClick(userId: string, input: TrackClickInput) {
    const click = await prisma.clickEvent.create({
      data: {
        userId,
        platform: input.platform,
        postId: input.postId,
        clickType: input.clickType,
        referrer: input.referrer,
        userAgent: input.userAgent,
        ipHash: input.ipHash,
      },
    })

    return click
  }

  async getClickToViewRatio(userId: string, platform: Platform, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const metrics = await prisma.postMetric.findMany({
      where: {
        userId,
        platform,
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: 'desc' },
    })

    if (metrics.length === 0) {
      return { platform, ratio: 0, trend: 'insufficient_data', posts: 0 }
    }

    const avgRatio = metrics.reduce((sum, m) => sum + m.clickToViewRate, 0) / metrics.length

    // Calculate trend by comparing first and second half
    const half = Math.floor(metrics.length / 2)
    const recentHalf = metrics.slice(0, half)
    const olderHalf = metrics.slice(half)

    let trend = 'stable'
    if (recentHalf.length > 0 && olderHalf.length > 0) {
      const recentAvg = recentHalf.reduce((s, m) => s + m.clickToViewRate, 0) / recentHalf.length
      const olderAvg = olderHalf.reduce((s, m) => s + m.clickToViewRate, 0) / olderHalf.length
      if (recentAvg > olderAvg * 1.1) trend = 'improving'
      else if (recentAvg < olderAvg * 0.9) trend = 'declining'
    }

    return {
      platform,
      ratio: parseFloat(avgRatio.toFixed(2)),
      trend,
      posts: metrics.length,
      period: `${days} days`,
    }
  }

  // ─── Dashboard Overview ───────────────────────────────────────────

  async getDashboardOverview(userId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [postMetrics, accountMetrics, clickEvents] = await Promise.all([
      prisma.postMetric.findMany({
        where: { userId, recordedAt: { gte: since } },
        orderBy: { recordedAt: 'desc' },
      }),
      prisma.accountMetric.findMany({
        where: { userId, recordedAt: { gte: since } },
        orderBy: { recordedAt: 'desc' },
      }),
      prisma.clickEvent.count({
        where: { userId, clickedAt: { gte: since } },
      }),
    ])

    const totalImpressions = postMetrics.reduce((s, m) => s + m.impressions, 0)
    const totalReach = postMetrics.reduce((s, m) => s + m.reach, 0)
    const totalLikes = postMetrics.reduce((s, m) => s + m.likes, 0)
    const totalComments = postMetrics.reduce((s, m) => s + m.comments, 0)
    const totalShares = postMetrics.reduce((s, m) => s + m.shares, 0)
    const totalClicks = postMetrics.reduce((s, m) => s + m.clicks, 0)
    const totalVideoViews = postMetrics.reduce((s, m) => s + m.videoViews, 0)

    const avgEngagementRate = postMetrics.length > 0
      ? postMetrics.reduce((s, m) => s + m.engagementRate, 0) / postMetrics.length
      : 0

    // Latest follower counts per platform
    const latestFollowers: Record<string, number> = {}
    for (const metric of accountMetrics) {
      if (!latestFollowers[metric.platform]) {
        latestFollowers[metric.platform] = metric.followers
      }
    }

    // Platform breakdown
    const platformBreakdown: Record<string, any> = {}
    for (const metric of postMetrics) {
      if (!platformBreakdown[metric.platform]) {
        platformBreakdown[metric.platform] = {
          posts: 0,
          impressions: 0,
          likes: 0,
          comments: 0,
          avgEngagementRate: 0,
        }
      }
      platformBreakdown[metric.platform].posts++
      platformBreakdown[metric.platform].impressions += metric.impressions
      platformBreakdown[metric.platform].likes += metric.likes
      platformBreakdown[metric.platform].comments += metric.comments
    }

    return {
      period: `${days} days`,
      summary: {
        totalImpressions,
        totalReach,
        totalLikes,
        totalComments,
        totalShares,
        totalClicks,
        totalVideoViews,
        totalClickEvents: clickEvents,
        avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
        totalPosts: postMetrics.length,
      },
      followers: latestFollowers,
      platformBreakdown,
    }
  }

  // ─── Post Performance ─────────────────────────────────────────────

  async getPostPerformance(userId: string, platform?: Platform, days = 30, page = 1, limit = 20) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const skip = (page - 1) * limit

    const where: any = { userId, recordedAt: { gte: since } }
    if (platform) where.platform = platform

    const [metrics, total] = await Promise.all([
      prisma.postMetric.findMany({
        where,
        orderBy: { engagementRate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.postMetric.count({ where }),
    ])

    return {
      metrics,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  // ─── Follower Growth ──────────────────────────────────────────────

  async getFollowerGrowth(userId: string, platform: Platform, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const metrics = await prisma.accountMetric.findMany({
      where: { userId, platform, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
      select: { followers: true, recordedAt: true },
    })

    if (metrics.length < 2) {
      return { platform, growth: 0, growthRate: 0, data: metrics }
    }

    const first = metrics[0].followers
    const last = metrics[metrics.length - 1].followers
    const growth = last - first
    const growthRate = first > 0 ? ((growth / first) * 100).toFixed(2) : '0'

    return {
      platform,
      growth,
      growthRate: parseFloat(growthRate),
      startFollowers: first,
      endFollowers: last,
      data: metrics,
    }
  }

  // ─── Audience Demographics ────────────────────────────────────────

  async saveDemographics(
    userId: string,
    platform: Platform,
    demographics: Array<{ ageRange: string; gender: string; location: string; percentage: number }>
  ) {
    // Delete existing for this user + platform before reinserting
    await prisma.audienceDemographic.deleteMany({
      where: { userId, platform },
    })

    const records = await prisma.audienceDemographic.createMany({
      data: demographics.map((d) => ({
        userId,
        platform,
        ageRange: d.ageRange,
        gender: d.gender,
        location: d.location,
        percentage: d.percentage,
      })),
    })

    return records
  }

  async getDemographics(userId: string, platform?: Platform) {
    const where: any = { userId }
    if (platform) where.platform = platform

    return prisma.audienceDemographic.findMany({
      where,
      orderBy: { percentage: 'desc' },
    })
  }

  // ─── AI Performance Summary ───────────────────────────────────────

  async generateAISummary(userId: string, period: 'weekly' | 'monthly') {
    const days = period === 'weekly' ? 7 : 30
    const overview = await this.getDashboardOverview(userId, days)

    const prompt = `You are a social media analytics expert working with a Kenyan business/creator.
Analyze this ${period} social media performance data and provide a concise, actionable summary.

Performance Data:
- Total Impressions: ${overview.summary.totalImpressions.toLocaleString()}
- Total Reach: ${overview.summary.totalReach.toLocaleString()}
- Total Likes: ${overview.summary.totalLikes.toLocaleString()}
- Total Comments: ${overview.summary.totalComments.toLocaleString()}
- Total Shares: ${overview.summary.totalShares.toLocaleString()}
- Total Clicks: ${overview.summary.totalClicks.toLocaleString()}
- Average Engagement Rate: ${overview.summary.avgEngagementRate}%
- Total Posts: ${overview.summary.totalPosts}
- Platform Breakdown: ${JSON.stringify(overview.platformBreakdown)}

Provide:
1. A 2-3 sentence performance summary
2. Top 3 insights from the data
3. Top 3 actionable recommendations for the Kenyan market
4. One key metric to focus on next ${period === 'weekly' ? 'week' : 'month'}

Keep the tone encouraging but honest. Be specific and practical.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    })

    const summaryText = response.choices[0]?.message?.content || ''
    const tokensUsed = response.usage?.total_tokens || 0

    const report = await prisma.analyticsReport.create({
      data: {
        userId,
        reportType: period,
        period: `Last ${days} days`,
        summary: summaryText,
        insights: overview,
      },
    })

    return { report, tokensUsed }
  }

  async getReports(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [reports, total] = await Promise.all([
      prisma.analyticsReport.findMany({
        where: { userId },
        orderBy: { generatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.analyticsReport.count({ where: { userId } }),
    ])

    return {
      reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  // ─── Top Performing Posts ─────────────────────────────────────────

  async getTopPosts(userId: string, platform?: Platform, days = 30, limit = 10) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const where: any = { userId, recordedAt: { gte: since } }
    if (platform) where.platform = platform

    const posts = await prisma.postMetric.findMany({
      where,
      orderBy: { engagementRate: 'desc' },
      take: limit,
    })

    return posts
  }

  // ─── Competitor Benchmarking (Creator plan+) ──────────────────────

  async getBenchmarks(platform: Platform) {
    const benchmarks: Record<string, any> = {
      INSTAGRAM: {
        nano: { followers: '1k-10k', avgEngagement: '5.0%', avgLikes: 250, avgComments: 15 },
        micro: { followers: '10k-100k', avgEngagement: '3.5%', avgLikes: 1500, avgComments: 75 },
        macro: { followers: '100k-1M', avgEngagement: '2.0%', avgLikes: 8000, avgComments: 300 },
        mega: { followers: '1M+', avgEngagement: '1.5%', avgLikes: 30000, avgComments: 800 },
      },
      TIKTOK: {
        nano: { followers: '1k-10k', avgEngagement: '9.0%', avgViews: 5000, avgLikes: 400 },
        micro: { followers: '10k-100k', avgEngagement: '6.0%', avgViews: 25000, avgLikes: 1500 },
        macro: { followers: '100k-1M', avgEngagement: '4.0%', avgViews: 100000, avgLikes: 5000 },
        mega: { followers: '1M+', avgEngagement: '2.5%', avgViews: 500000, avgLikes: 20000 },
      },
      LINKEDIN: {
        small: { followers: '< 1k', avgEngagement: '4.0%', avgLikes: 30, avgComments: 5 },
        medium: { followers: '1k-10k', avgEngagement: '3.0%', avgLikes: 150, avgComments: 20 },
        large: { followers: '10k+', avgEngagement: '2.0%', avgLikes: 500, avgComments: 60 },
      },
      TWITTER: {
        small: { followers: '< 1k', avgEngagement: '2.0%', avgLikes: 15, avgRetweets: 3 },
        medium: { followers: '1k-10k', avgEngagement: '1.5%', avgLikes: 80, avgRetweets: 15 },
        large: { followers: '10k+', avgEngagement: '1.0%', avgLikes: 300, avgRetweets: 60 },
      },
    }

    return {
      platform,
      kenyaContext: 'Kenyan accounts typically see 15-25% higher engagement than global averages due to highly active community participation.',
      benchmarks: benchmarks[platform] || {},
    }
  }
}
