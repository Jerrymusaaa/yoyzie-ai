import { chat } from './base.agent'

interface InfluencerProfile {
  id: string
  name: string
  niche: string[]
  followerCount: number
  engagementRate: number
  botScore: number
  platforms: string[]
  location: string
  avgRate: number
}

interface InfluencerMatchingInput {
  campaignBrief: {
    title: string
    category: string
    targetAudience: string
    budget: number
    platforms: string[]
    minFollowers: number
  }
  availableInfluencers: InfluencerProfile[]
}

export class InfluencerMatchingAgent {
  readonly name = 'INFLUENCER_MATCHING'
  readonly model = 'gpt-4o'

  async run(input: InfluencerMatchingInput) {
    const { campaignBrief, availableInfluencers } = input

    if (availableInfluencers.length === 0) {
      return { matches: [], reasoning: 'No influencers available to match', tokensUsed: 0 }
    }

    const influencerSummary = availableInfluencers.slice(0, 20).map((inf) => ({
      id: inf.id,
      name: inf.name,
      niches: inf.niche.join(', '),
      followers: inf.followerCount,
      engagementRate: inf.engagementRate,
      botScore: inf.botScore,
      platforms: inf.platforms.join(', '),
      avgRate: inf.avgRate,
    }))

    const prompt = `You are a Kenyan influencer marketing expert.
Match the best influencers for this campaign based on fit, authenticity, and value.

Campaign:
- Title: ${campaignBrief.title}
- Category: ${campaignBrief.category}
- Target Audience: ${campaignBrief.targetAudience}
- Budget: KES ${campaignBrief.budget.toLocaleString()}
- Platforms: ${campaignBrief.platforms.join(', ')}
- Min Followers: ${campaignBrief.minFollowers.toLocaleString()}

Available Influencers:
${JSON.stringify(influencerSummary, null, 2)}

Score and rank the top 5 influencers. Consider:
- Niche relevance to campaign category
- Audience authenticity (lower botScore is better)
- Engagement rate vs follower count
- Budget fit
- Platform match

Return ONLY valid JSON:
{
  "matches": [
    {
      "influencerId": "string",
      "matchScore": 95,
      "reasoning": "string",
      "estimatedReach": 50000,
      "recommendedRate": 15000
    }
  ],
  "reasoning": "Overall matching strategy explanation"
}`

    const { content, tokensUsed } = await chat(
      [{ role: 'user', content: prompt }],
      0.6,
      1000
    )

    let result: any = { matches: [], reasoning: '' }
    try {
      const cleaned = content.replace(/```json|```/g, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      result = { matches: [], reasoning: content }
    }

    return { ...result, tokensUsed }
  }
}
