import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import { env } from '../config/env'
import { TwitterTrendsService } from './twitter-trends.service'
import { TikTokTrendsService } from './tiktok-trends.service'
import { TrendPlatform, TrendCategory, TrendSuggestionRequest } from '../types'

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
const twitterService = new TwitterTrendsService()
const tiktokService = new TikTokTrendsService()

// Kenyan counties for location-based trends
const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Thika', 'Malindi', 'Kitale', 'Garissa', 'Nyeri',
  'Meru', 'Embu', 'Machakos', 'Kericho', 'Kisii',
]

export class TrendService {

  // ─── Refresh All Trends ───────────────────────────────────────────

  async refreshAllTrends() {
    const results = {
      twitter: 0,
      tiktokHashtags: 0,
      tiktokSounds: 0,
    }

    // Twitter/X Kenya trends
    try {
      const kenyaTrends = await twitterService.getKenyaTrends()
      const nairobiTrends = await twitterService.getNairobiTrends()
      const allTwitter = [...kenyaTrends, ...nairobiTrends]

      for (const trend of allTwitter) {
        await prisma.trend.upsert({
          where: {
            platform_name_location: {
              platform: 'TWITTER',
              name: trend.name,
              location: trend.county || 'Kenya',
            },
          },
          update: {
            tweetVolume: trend.tweetVolume,
            rank: trend.rank,
            isActive: true,
            detectedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          create: {
            platform: 'TWITTER',
            category: 'HASHTAG',
            name: trend.name,
            description: trend.description,
            tweetVolume: trend.tweetVolume,
            rank: trend.rank,
            location: trend.county || 'Kenya',
            county: trend.county,
            url: trend.url,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        })
      }

      results.twitter = allTwitter.length

      await prisma.trendRefreshLog.create({
        data: { platform: 'TWITTER', trendsFound: allTwitter.length, success: true },
      })
    } catch (error: any) {
      await prisma.trendRefreshLog.create({
        data: { platform: 'TWITTER', trendsFound: 0, success: false, error: error.message },
      })
    }

    // TikTok hashtags
    try {
      const hashtags = await tiktokService.getTrendingHashtags()

      for (const tag of hashtags) {
        await prisma.trend.upsert({
          where: {
            platform_name_location: {
              platform: 'TIKTOK',
              name: tag.name,
              location: 'Global',
            },
          },
          update: {
            postVolume: tag.postVolume,
            rank: tag.rank,
            isActive: true,
            detectedAt: new Date(),
            expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
          },
          create: {
            platform: 'TIKTOK',
            category: 'HASHTAG',
            name: tag.name,
            description: tag.description,
            postVolume: tag.postVolume,
            rank: tag.rank,
            location: 'Global',
            expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
          },
        })
      }

      results.tiktokHashtags = hashtags.length

      await prisma.trendRefreshLog.create({
        data: { platform: 'TIKTOK', trendsFound: hashtags.length, success: true },
      })
    } catch (error: any) {
      await prisma.trendRefreshLog.create({
        data: { platform: 'TIKTOK', trendsFound: 0, success: false, error: error.message },
      })
    }

    // TikTok sounds
    try {
      const sounds = await tiktokService.getTrendingSounds()

      for (const sound of sounds) {
        await prisma.trend.upsert({
          where: {
            platform_name_location: {
              platform: 'TIKTOK',
              name: sound.name,
              location: 'Global',
            },
          },
          update: {
            postVolume: sound.postVolume,
            rank: sound.rank,
            isActive: true,
            detectedAt: new Date(),
            expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
          },
          create: {
            platform: 'TIKTOK',
            category: 'SOUND',
            name: sound.name,
            description: sound.description,
            postVolume: sound.postVolume,
            rank: sound.rank,
            location: 'Global',
            url: sound.url,
            expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
          },
        })
      }

      results.tiktokSounds = sounds.length
    } catch (error: any) {
      console.error('TikTok sounds refresh failed:', error.message)
    }

    return results
  }

  // ─── Get Trends ───────────────────────────────────────────────────

  async getHashtags(platform: TrendPlatform, location = 'Kenya', limit = 20) {
    const where: any = {
      platform,
      category: 'HASHTAG',
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    }

    if (location !== 'all') {
      where.OR = [
        { location },
        { location: 'Global' },
        { location: 'Kenya' },
      ]
    }

    const trends = await prisma.trend.findMany({
      where,
      orderBy: [{ rank: 'asc' }, { tweetVolume: 'desc' }, { postVolume: 'desc' }],
      take: limit,
    })

    return trends
  }

  async getSounds(platform: TrendPlatform, limit = 20) {
    const trends = await prisma.trend.findMany({
      where: {
        platform,
        category: 'SOUND',
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: [{ rank: 'asc' }, { postVolume: 'desc' }],
      take: limit,
    })

    return trends
  }

  async getTopics(location = 'Kenya', limit = 20) {
    const trends = await prisma.trend.findMany({
      where: {
        category: 'TOPIC',
        isActive: true,
        location: { contains: location, mode: 'insensitive' },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { rank: 'asc' },
      take: limit,
    })

    return trends
  }

  async getCountyTrends(county: string, limit = 10) {
    if (!KENYAN_COUNTIES.includes(county)) {
      throw new Error(`County not supported. Available: ${KENYAN_COUNTIES.join(', ')}`)
    }

    const trends = await prisma.trend.findMany({
      where: {
        county: { contains: county, mode: 'insensitive' },
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { rank: 'asc' },
      take: limit,
    })

    return trends
  }

  async getAllActiveTrends(limit = 50) {
    const trends = await prisma.trend.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: [{ rank: 'asc' }, { detectedAt: 'desc' }],
      take: limit,
    })

    // Group by platform and category
    const grouped: Record<string, any[]> = {}
    for (const trend of trends) {
      const key = `${trend.platform}_${trend.category}`
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(trend)
    }

    return grouped
  }

  // ─── AI Trend Suggestions ─────────────────────────────────────────

  async getTrendSuggestions(userId: string, input: TrendSuggestionRequest) {
    const { content, platform, count = 10 } = input

    // Get current active trends for context
    const currentTrends = await this.getHashtags(platform, 'Kenya', 20)
    const trendNames = currentTrends.map((t) => t.name).join(', ')

    const platformContext: Record<string, string> = {
      TWITTER: 'Twitter/X (280 character limit, use 1-2 hashtags max)',
      INSTAGRAM: 'Instagram (use 5-15 hashtags, mix popular and niche)',
      TIKTOK: 'TikTok (use 3-5 hashtags, shorter is better)',
      GENERAL: 'general social media (adapt per platform)',
    }

    const prompt = `You are a Kenyan social media trend expert. A user is creating content for ${platformContext[platform]}.

Their content is about: "${content}"

Currently trending in Kenya:
${trendNames || 'General Kenyan trends: #KOT #Nairobi #Kenya #254 #NairobiLife'}

Based on their content and current Kenyan trends, suggest ${count} relevant hashtags or trends they should use.

Requirements:
- Mix currently trending tags with evergreen Kenyan tags
- Include 2-3 Kenya-specific tags (#KOT, #Kenya, #Nairobi, #254, etc.) where relevant
- Include niche-specific tags relevant to their content
- Include 1-2 of the currently trending tags if they fit the content
- Consider Swahili hashtags where culturally appropriate
- Each suggestion should have: hashtag, reason (why it fits), estimatedReach (low/medium/high)

Return ONLY a valid JSON array like this:
[
  {
    "hashtag": "#example",
    "reason": "Why this fits the content",
    "estimatedReach": "high",
    "isTrending": true
  }
]`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    })

    const rawContent = response.choices[0]?.message?.content || '[]'
    const tokensUsed = response.usage?.total_tokens || 0

    let suggestions = []
    try {
      const cleaned = rawContent
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
      suggestions = JSON.parse(cleaned)
    } catch {
      suggestions = []
    }

    await prisma.trendSuggestion.create({
      data: {
        userId,
        platform,
        content,
        suggestions,
        tokensUsed,
      },
    })

    return { suggestions, tokensUsed, currentTrends: trendNames }
  }

  // ─── Refresh Logs ─────────────────────────────────────────────────

  async getRefreshLogs(limit = 20) {
    return prisma.trendRefreshLog.findMany({
      orderBy: { refreshedAt: 'desc' },
      take: limit,
    })
  }

  async getRefreshStats() {
    const [total, successful, failed, latest] = await Promise.all([
      prisma.trendRefreshLog.count(),
      prisma.trendRefreshLog.count({ where: { success: true } }),
      prisma.trendRefreshLog.count({ where: { success: false } }),
      prisma.trendRefreshLog.findFirst({ orderBy: { refreshedAt: 'desc' } }),
    ])

    return { total, successful, failed, lastRefresh: latest?.refreshedAt }
  }
}
