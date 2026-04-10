import axios from 'axios'
import { chat } from './base.agent'
import { env } from '../config/env'

interface TrendAgentInput {
  platform: string
  contentContext?: string
  count?: number
}

export class KenyanTrendAgent {
  readonly name = 'KENYAN_TREND'
  readonly model = 'gpt-4o'

  async run(input: TrendAgentInput) {
    const { platform, contentContext, count = 10 } = input

    // Fetch current trends from trend service
    let currentTrends: string[] = []
    try {
      const response = await axios.get(
        `${env.TREND_SERVICE_URL}/api/v1/trends/hashtags?platform=${platform}&limit=20`,
        { timeout: 5000 }
      )
      currentTrends = response.data?.data?.trends?.map((t: any) => t.name) || []
    } catch {
      currentTrends = ['#KOT', '#Kenya', '#Nairobi', '#254', '#NairobiLife']
    }

    const prompt = `You are a Kenyan social media trend analyst.

Currently trending in Kenya on ${platform}:
${currentTrends.join(', ')}

${contentContext ? `Content context: "${contentContext}"` : ''}

Provide ${count} trending hashtag recommendations for Kenyan creators.
For each, include: hashtag, trendScore (1-10), category, and why it's relevant now.

Return ONLY valid JSON array:
[{"hashtag":"#example","trendScore":8,"category":"lifestyle","relevance":"explanation"}]`

    const { content, tokensUsed } = await chat(
      [{ role: 'user', content: prompt }],
      0.6,
      800
    )

    let recommendations = []
    try {
      const cleaned = content.replace(/```json|```/g, '').trim()
      recommendations = JSON.parse(cleaned)
    } catch {
      recommendations = currentTrends.slice(0, count).map((t, i) => ({
        hashtag: t,
        trendScore: 10 - i,
        category: 'general',
        relevance: 'Currently trending in Kenya',
      }))
    }

    return { recommendations, currentTrends, tokensUsed }
  }
}
