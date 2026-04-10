import { chat } from './base.agent'

interface CampaignStrategyInput {
  campaignTitle: string
  budget: number
  currency?: string
  platforms: string[]
  targetAudience: string
  objectives: string[]
  timeline: number
  category: string
}

export class CampaignStrategyAgent {
  readonly name = 'CAMPAIGN_STRATEGY'
  readonly model = 'gpt-4o'

  async run(input: CampaignStrategyInput) {
    const {
      campaignTitle,
      budget,
      currency = 'KES',
      platforms,
      targetAudience,
      objectives,
      timeline,
      category,
    } = input

    const prompt = `You are a Kenyan influencer marketing strategist.
Create a detailed campaign strategy for a brand campaign in Kenya.

Campaign Details:
- Title: ${campaignTitle}
- Budget: ${currency} ${budget.toLocaleString()}
- Platforms: ${platforms.join(', ')}
- Target Audience: ${targetAudience}
- Objectives: ${objectives.join(', ')}
- Timeline: ${timeline} days
- Category: ${category}

Provide a comprehensive strategy including:
1. Recommended influencer tier mix (nano/micro/macro) and rationale
2. Content strategy per platform
3. Suggested posting schedule
4. KPIs to track
5. Budget allocation breakdown
6. Kenya-specific considerations and cultural tips
7. Risk factors to watch out for

Return ONLY valid JSON:
{
  "influencerMix": {"nano": "X%", "micro": "X%", "macro": "X%", "rationale": "string"},
  "contentStrategy": {"platform": "strategy"},
  "postingSchedule": "string",
  "kpis": ["string"],
  "budgetBreakdown": {"item": "amount"},
  "kenyaConsiderations": ["string"],
  "risks": ["string"],
  "expectedROI": "string"
}`

    const { content, tokensUsed } = await chat(
      [{ role: 'user', content: prompt }],
      0.75,
      1500
    )

    let strategy: any = {}
    try {
      const cleaned = content.replace(/```json|```/g, '').trim()
      strategy = JSON.parse(cleaned)
    } catch {
      strategy = { rawStrategy: content }
    }

    return { strategy, tokensUsed }
  }
}
