import { chat } from './base.agent'

interface AnalyticsInsightInput {
  period: 'weekly' | 'monthly'
  metrics: {
    totalImpressions?: number
    totalReach?: number
    totalLikes?: number
    totalComments?: number
    totalShares?: number
    totalClicks?: number
    avgEngagementRate?: number
    totalPosts?: number
    platformBreakdown?: Record<string, any>
    followerGrowth?: Record<string, any>
  }
}

export class AnalyticsInsightAgent {
  readonly name = 'ANALYTICS_INSIGHT'
  readonly model = 'gpt-4o'

  async run(input: AnalyticsInsightInput) {
    const { period, metrics } = input

    const prompt = `You are a Kenyan social media analytics expert providing a ${period} performance report.

Performance Data:
- Total Impressions: ${metrics.totalImpressions?.toLocaleString() || 0}
- Total Reach: ${metrics.totalReach?.toLocaleString() || 0}
- Total Likes: ${metrics.totalLikes?.toLocaleString() || 0}
- Total Comments: ${metrics.totalComments?.toLocaleString() || 0}
- Total Shares: ${metrics.totalShares?.toLocaleString() || 0}
- Total Clicks: ${metrics.totalClicks?.toLocaleString() || 0}
- Avg Engagement Rate: ${metrics.avgEngagementRate?.toFixed(2) || 0}%
- Total Posts: ${metrics.totalPosts || 0}
${metrics.platformBreakdown ? `- Platform Breakdown: ${JSON.stringify(metrics.platformBreakdown)}` : ''}

Generate a structured performance summary with:
1. Overall performance assessment (2-3 sentences)
2. Top 3 insights from the data
3. Top 3 actionable recommendations for the Kenyan market
4. One key focus metric for next ${period === 'weekly' ? 'week' : 'month'}
5. Performance rating: excellent/good/average/needs_improvement

Return ONLY valid JSON:
{
  "assessment": "string",
  "insights": ["string","string","string"],
  "recommendations": ["string","string","string"],
  "focusMetric": "string",
  "rating": "string"
}`

    const { content, tokensUsed } = await chat(
      [{ role: 'user', content: prompt }],
      0.7,
      800
    )

    let analysis: any = {}
    try {
      const cleaned = content.replace(/```json|```/g, '').trim()
      analysis = JSON.parse(cleaned)
    } catch {
      analysis = {
        assessment: content,
        insights: [],
        recommendations: [],
        focusMetric: 'engagement rate',
        rating: 'good',
      }
    }

    return { analysis, period, tokensUsed }
  }
}
