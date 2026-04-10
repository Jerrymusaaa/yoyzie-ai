import { chat } from './base.agent'

interface ProposalWritingInput {
  campaignTitle: string
  campaignDescription: string
  budget: number
  deliverables: string[]
  timeline: number
  targetAudience: string
  influencerBio: string
  followerCount: number
  engagementRate: number
  niche: string
  previousWork?: string
}

export class ProposalWritingAgent {
  readonly name = 'PROPOSAL_WRITING'
  readonly model = 'gpt-4o'

  async run(input: ProposalWritingInput) {
    const {
      campaignTitle,
      campaignDescription,
      budget,
      deliverables,
      timeline,
      targetAudience,
      influencerBio,
      followerCount,
      engagementRate,
      niche,
      previousWork,
    } = input

    const prompt = `You are helping a Kenyan influencer write a compelling campaign proposal.

Campaign:
- Title: ${campaignTitle}
- Description: ${campaignDescription}
- Budget: KES ${budget.toLocaleString()}
- Deliverables: ${deliverables.join(', ')}
- Timeline: ${timeline} days
- Target Audience: ${targetAudience}

Influencer Profile:
- Bio: ${influencerBio}
- Followers: ${followerCount.toLocaleString()}
- Engagement Rate: ${engagementRate}%
- Niche: ${niche}
${previousWork ? `- Previous Work: ${previousWork}` : ''}

Write a professional, persuasive proposal (200-300 words) that:
1. Opens with a compelling hook about why they are the perfect fit
2. Highlights their relevant Kenyan audience demographics
3. Outlines their specific content approach for each deliverable
4. Includes a brief performance expectation (estimated reach, engagement)
5. Ends with a confident, professional closing

Keep it authentic, specific to the Kenyan market, and avoid generic language.
Return the proposal as plain text, no JSON.`

    const { content, tokensUsed } = await chat(
      [{ role: 'user', content: prompt }],
      0.8,
      600
    )

    return { proposal: content, tokensUsed }
  }
}
