import OpenAI from 'openai'
import { env } from '../config/env'

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const chatCompletion = async (
  messages: ChatMessage[],
  temperature = 0.8,
  maxTokens = 1000
): Promise<{ content: string; tokensUsed: number }> => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature,
    max_tokens: maxTokens,
  })

  const content = response.choices[0]?.message?.content || ''
  const tokensUsed = response.usage?.total_tokens || 0

  return { content, tokensUsed }
}
