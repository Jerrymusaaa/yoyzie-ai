export interface TokenPayload {
  userId: string
  email: string
  accountCategory: string
  accountType: string
}

export type AgentName =
  | 'CONTENT_GENERATION'
  | 'KENYAN_TREND'
  | 'ANALYTICS_INSIGHT'
  | 'BOT_DETECTION'
  | 'CAMPAIGN_STRATEGY'
  | 'INFLUENCER_MATCHING'
  | 'AI_CHAT_ASSISTANT'
  | 'PROPOSAL_WRITING'
  | 'FRAUD_DETECTION'

export interface AgentRequest {
  agentName: AgentName
  userId: string
  input: Record<string, any>
  userToken?: string
}

export interface AgentResponse {
  jobId: string
  agentName: AgentName
  output: any
  tokensUsed: number
  durationMs: number
  model: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface FunctionCallResult {
  name: string
  result: any
}

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
