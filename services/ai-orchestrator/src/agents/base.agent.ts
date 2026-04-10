import OpenAI from 'openai'
import { env } from '../config/env'
import { ChatMessage } from '../types'

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

export const DEFAULT_MODEL = 'gpt-4o'

export const chat = async (
  messages: ChatMessage[],
  temperature = 0.7,
  maxTokens = 1000,
  model = DEFAULT_MODEL
): Promise<{ content: string; tokensUsed: number }> => {
  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  })

  return {
    content: response.choices[0]?.message?.content || '',
    tokensUsed: response.usage?.total_tokens || 0,
  }
}

export const chatWithFunctions = async (
  messages: ChatMessage[],
  tools: OpenAI.Chat.ChatCompletionTool[],
  temperature = 0.7,
  model = DEFAULT_MODEL
): Promise<{
  content: string
  toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[]
  tokensUsed: number
}> => {
  const response = await openai.chat.completions.create({
    model,
    messages,
    tools,
    tool_choice: 'auto',
    temperature,
  })

  const message = response.choices[0]?.message

  return {
    content: message?.content || '',
    toolCalls: message?.tool_calls || [],
    tokensUsed: response.usage?.total_tokens || 0,
  }
}
