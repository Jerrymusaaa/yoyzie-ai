import { chat } from './base.agent'

interface ContentGenerationInput {
  platform: string
  topic: string
  tone?: string
  count?: number
  language?: string
  includeHashtags?: boolean
  includeEmojis?: boolean
}

export class ContentGenerationAgent {
  readonly name = 'CONTENT_GENERATION'
  readonly model = 'gpt-4o'

  async run(input: ContentGenerationInput) {
    const {
      platform,
      topic,
      tone = 'casual',
      count = 3,
      language = 'en',
      includeHashtags = true,
      includeEmojis = true,
    } = input

    const languageMap: Record<string, string> = {
      en: 'English with Kenyan cultural references where appropriate',
      sw: 'Swahili language',
      sheng: 'Sheng — Nairobi urban slang mixing Swahili and English',
    }

    const systemPrompt = `You are an expert Kenyan social media content creator.
You deeply understand Kenyan culture, trends, humor, and what resonates with Kenyan audiences.
${languageMap[language] || 'English'}.`

    const userPrompt = `Generate ${count} unique ${platform} captions about: "${topic}"
Tone: ${tone}
${includeHashtags ? 'Include relevant hashtags at the end.' : 'No hashtags.'}
${includeEmojis ? 'Use emojis naturally.' : 'No emojis.'}
Format as a numbered list. Each caption must be complete and ready to post.`

    const { content, tokensUsed } = await chat(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      0.85,
      1500
    )

    const captions = content
      .split(/\n\s*\n/)
      .map((c) => c.replace(/^\d+\.\s*/, '').trim())
      .filter((c) => c.length > 10)

    return { captions, rawContent: content, tokensUsed }
  }
}
