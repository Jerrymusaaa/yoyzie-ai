import { chatWithFunctions, openai } from './base.agent'
import axios from 'axios'
import { env } from '../config/env'
import { ChatMessage } from '../types'
import OpenAI from 'openai'

interface ChatAssistantInput {
  messages: ChatMessage[]
  userId: string
  userToken?: string
  accountType?: string
}

type StandardToolCall = {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'generate_captions',
      description: 'Generate social media captions for a given topic and platform',
      parameters: {
        type: 'object',
        properties: {
          platform: { type: 'string', enum: ['INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'TWITTER', 'FACEBOOK'] },
          topic: { type: 'string', description: 'The topic or theme for the captions' },
          tone: { type: 'string', enum: ['casual', 'professional', 'humorous', 'inspirational', 'promotional'] },
          count: { type: 'number', description: 'Number of captions to generate (1-5)' },
          includeHashtags: { type: 'boolean' },
          language: { type: 'string', enum: ['en', 'sw', 'sheng'] },
        },
        required: ['platform', 'topic'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_trending_hashtags',
      description: 'Get currently trending hashtags in Kenya for a platform',
      parameters: {
        type: 'object',
        properties: {
          platform: { type: 'string', enum: ['TWITTER', 'INSTAGRAM', 'TIKTOK'] },
          limit: { type: 'number', description: 'Number of hashtags to return' },
        },
        required: ['platform'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_optimal_posting_times',
      description: 'Get the best posting times for a platform in Kenya (East Africa Time)',
      parameters: {
        type: 'object',
        properties: {
          platform: { type: 'string', enum: ['INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'TWITTER', 'FACEBOOK'] },
        },
        required: ['platform'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_platform_tips',
      description: 'Get platform-specific content tips and best practices for Kenyan creators',
      parameters: {
        type: 'object',
        properties: {
          platform: { type: 'string', enum: ['INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'TWITTER', 'FACEBOOK'] },
          contentType: { type: 'string', description: 'Type of content (e.g., reels, stories, posts)' },
        },
        required: ['platform'],
      },
    },
  },
]

const executeTool = async (name: string, args: any, userToken?: string): Promise<any> => {
  const authHeaders = userToken ? { Authorization: `Bearer ${userToken}` } : {}

  switch (name) {
    case 'generate_captions': {
      try {
        const { data } = await axios.post(
          `${env.CONTENT_SERVICE_URL}/api/v1/content/captions`,
          args,
          { headers: authHeaders }
        )
        return data.data
      } catch {
        return { captions: [`Here are some captions about ${args.topic} for ${args.platform}`] }
      }
    }

    case 'get_trending_hashtags': {
      try {
        const { data } = await axios.get(
          `${env.TREND_SERVICE_URL}/api/v1/trends/hashtags`,
          { params: { platform: args.platform, limit: args.limit || 10 } }
        )
        return data.data?.trends || []
      } catch {
        return [{ name: '#Kenya' }, { name: '#Nairobi' }, { name: '#KOT' }]
      }
    }

    case 'get_optimal_posting_times': {
      const times: Record<string, string[]> = {
        INSTAGRAM: ['7:00 AM EAT', '12:00 PM EAT', '7:00 PM EAT'],
        TIKTOK: ['6:00 AM EAT', '7:00 PM EAT', '9:00 PM EAT'],
        LINKEDIN: ['7:00 AM EAT', '8:00 AM EAT', '12:00 PM EAT'],
        TWITTER: ['7:00 AM EAT', '12:00 PM EAT', '8:00 PM EAT'],
        FACEBOOK: ['8:00 AM EAT', '1:00 PM EAT', '3:00 PM EAT'],
      }
      return {
        platform: args.platform,
        timezone: 'East Africa Time (EAT/UTC+3)',
        bestTimes: times[args.platform] || ['12:00 PM EAT'],
      }
    }

    case 'get_platform_tips': {
      const tips: Record<string, string[]> = {
        INSTAGRAM: [
          'Use 8-12 hashtags for best reach on Kenyan audiences',
          'Post Reels between 6-9 PM EAT for maximum views',
          'Stories with polls and questions drive 40% more engagement',
          'Use Swahili captions to connect with local audiences',
        ],
        TIKTOK: [
          'First 3 seconds must hook the viewer — no slow intros',
          'Use trending Kenyan sounds for 3x more reach',
          'Post 3-5 times per week consistently',
          'Duets and stitches with popular KOT content boost visibility',
        ],
        LINKEDIN: [
          'Posts between 700-1300 characters perform best',
          'Start with a strong hook',
          'Tag relevant Kenyan companies and professionals',
          'Share local business insights and lessons',
        ],
        TWITTER: [
          'Engage with #KOT trending topics',
          'Threads perform 3x better than single tweets',
          'Reply to popular KOT accounts to boost visibility',
          'Use 1-2 hashtags maximum',
        ],
        FACEBOOK: [
          'Facebook Groups drive more engagement than pages',
          'Video content gets 6x more engagement than photos',
          'Post between 1-4 PM EAT on weekdays',
          'Ask questions to drive comments',
        ],
      }
      return {
        platform: args.platform,
        contentType: args.contentType || 'general',
        tips: tips[args.platform] || ['Create authentic, engaging content'],
      }
    }

    default:
      return { error: 'Unknown tool' }
  }
}

export class AIChatAssistantAgent {
  readonly name = 'AI_CHAT_ASSISTANT'
  readonly model = 'gpt-4o'

  async run(input: ChatAssistantInput) {
    const { messages, userId, userToken, accountType } = input

    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are Yoyzie AI Assistant — a smart, friendly social media expert built specifically for the Kenyan market.

You help users with:
- Creating social media content (captions, hashtags, threads, articles)
- Social media strategy and growth tips for Kenya
- Understanding Kenyan social media trends (#KOT, TikTok Kenya, etc.)
- Campaign planning and influencer marketing advice
- Analytics interpretation and performance improvement

You understand Kenyan culture, Swahili, Sheng, and the local social media landscape.
Be conversational, practical, and helpful. Use your tools to provide real data when possible.

Current user plan: ${accountType || 'standard'}
Always mention Yoyzie AI features that could help the user with their specific needs.`,
    }

    const allMessages = [systemMessage, ...messages]
    let totalTokens = 0

    const { content, toolCalls, tokensUsed } = await chatWithFunctions(
      allMessages,
      TOOLS,
      0.8
    )
    totalTokens += tokensUsed

    if (toolCalls.length === 0) {
      return { reply: content, toolsUsed: [], tokensUsed: totalTokens }
    }

    // Cast to standard tool call type to safely access .function
    const standardToolCalls = toolCalls as unknown as StandardToolCall[]

    const toolResults = []
    for (const toolCall of standardToolCalls) {
      const args = JSON.parse(toolCall.function.arguments)
      const result = await executeTool(toolCall.function.name, args, userToken)
      toolResults.push({
        toolCallId: toolCall.id,
        name: toolCall.function.name,
        result,
      })
    }

    const messagesWithResults = [
      ...allMessages,
      {
        role: 'assistant' as const,
        content: content,
        tool_calls: toolCalls,
      },
      ...toolResults.map((tr) => ({
        role: 'tool' as const,
        tool_call_id: tr.toolCallId,
        content: JSON.stringify(tr.result),
      })),
    ]

    const finalResponse = await openai.chat.completions.create({
      model: this.model,
      messages: messagesWithResults as any,
      temperature: 0.8,
      max_tokens: 1000,
    })

    const finalContent = finalResponse.choices[0]?.message?.content || ''
    totalTokens += finalResponse.usage?.total_tokens || 0

    return {
      reply: finalContent,
      toolsUsed: toolResults.map((tr) => tr.name),
      toolResults,
      tokensUsed: totalTokens,
    }
  }
}
