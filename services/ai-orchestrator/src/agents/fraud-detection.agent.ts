import { chat } from './base.agent'

interface TransactionData {
  userId: string
  amount: number
  method: string
  frequency: number
  previousWithdrawals: number[]
  accountAgeDays: number
  verifiedEmail: boolean
  hasCampaigns: boolean
}

export class FraudDetectionAgent {
  readonly name = 'FRAUD_DETECTION'
  readonly model = 'gpt-4o'

  async run(input: TransactionData) {
    const {
      amount,
      method,
      frequency,
      previousWithdrawals,
      accountAgeDays,
      verifiedEmail,
      hasCampaigns,
    } = input

    // Rule-based scoring first
    let ruleScore = 0
    const flags: string[] = []

    if (amount > 100000) { ruleScore += 30; flags.push('High value transaction') }
    if (frequency > 5) { ruleScore += 20; flags.push('High withdrawal frequency') }
    if (accountAgeDays < 7) { ruleScore += 25; flags.push('Very new account') }
    if (!verifiedEmail) { ruleScore += 15; flags.push('Unverified email') }
    if (!hasCampaigns) { ruleScore += 20; flags.push('No completed campaigns') }

    const avgPrevious = previousWithdrawals.length > 0
      ? previousWithdrawals.reduce((a, b) => a + b, 0) / previousWithdrawals.length
      : 0

    if (avgPrevious > 0 && amount > avgPrevious * 5) {
      ruleScore += 25
      flags.push('Amount significantly higher than average')
    }

    // If rule score is low, skip AI and approve
    if (ruleScore < 20) {
      return {
        riskScore: ruleScore,
        recommendation: 'APPROVE',
        flags: [],
        reasoning: 'Low risk transaction based on account history',
        tokensUsed: 0,
      }
    }

    // AI analysis for borderline cases
    const prompt = `You are a financial fraud detection system for a Kenyan influencer platform.
Analyze this withdrawal transaction and provide a risk assessment.

Transaction Details:
- Amount: KES ${amount.toLocaleString()}
- Method: ${method}
- Withdrawal frequency this month: ${frequency}
- Account age: ${accountAgeDays} days
- Email verified: ${verifiedEmail}
- Has completed campaigns: ${hasCampaigns}
- Previous withdrawals: ${previousWithdrawals.map((a) => `KES ${a.toLocaleString()}`).join(', ') || 'None'}
- Rule-based risk flags: ${flags.join(', ')}
- Rule-based risk score: ${ruleScore}/100

Provide fraud risk assessment.
Return ONLY valid JSON:
{
  "riskScore": 45,
  "recommendation": "APPROVE|REVIEW|BLOCK",
  "reasoning": "string",
  "additionalFlags": ["string"]
}`

    const { content, tokensUsed } = await chat(
      [{ role: 'user', content: prompt }],
      0.2,
      400
    )

    let assessment: any = {}
    try {
      const cleaned = content.replace(/```json|```/g, '').trim()
      assessment = JSON.parse(cleaned)
    } catch {
      assessment = {
        riskScore: ruleScore,
        recommendation: ruleScore > 60 ? 'REVIEW' : 'APPROVE',
        reasoning: 'Rule-based assessment',
        additionalFlags: [],
      }
    }

    return {
      riskScore: assessment.riskScore || ruleScore,
      recommendation: assessment.recommendation || 'REVIEW',
      flags: [...flags, ...(assessment.additionalFlags || [])],
      reasoning: assessment.reasoning,
      tokensUsed,
    }
  }
}
