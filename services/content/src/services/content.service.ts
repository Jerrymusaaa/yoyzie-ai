import { PrismaClient } from '@prisma/client'
import { chatCompletion } from './openai.service'
import {
  GenerateCaptionInput,
  GenerateHashtagsInput,
  AdaptContentInput,
  GenerateThreadInput,
  GenerateArticleInput,
  BrandVoiceInput,
} from '../types'

const prisma = new PrismaClient()

export class ContentService {

  // ─── Platform-specific guidelines ────────────────────────────────

  private getPlatformGuidelines(platform: string): string {
    const guidelines: Record<string, string> = {
      INSTAGRAM: 'Instagram captions can be up to 2200 characters. Use line breaks for readability. Include relevant emojis. End with a call to action. Add hashtags at the end or in a comment.',
      TIKTOK: 'TikTok captions are short — ideally under 150 characters. Use trending sounds references if relevant. Casual, punchy, and energetic tone works best. Include 3-5 hashtags.',
      LINKEDIN: 'LinkedIn posts are professional. Use short paragraphs. Start with a hook. Share insights or lessons. Keep it under 1300 characters for best reach. Minimal hashtags (3-5 max).',
      TWITTER: 'Twitter/X posts must be under 280 characters. Be punchy and direct. Use 1-2 hashtags max. Spark conversation or share a strong opinion.',
      FACEBOOK: 'Facebook posts can be longer. Conversational and community-focused. Ask questions to drive comments. Use 2-3 hashtags.',
      YOUTUBE: 'YouTube descriptions should be detailed, include keywords naturally, and have timestamps if relevant. First 2 lines are most important as they show before "more".',
    }
    return guidelines[platform] || 'Write engaging social media content.'
  }

  private getLanguageInstruction(language?: string): string {
    if (language === 'sw') return 'Write in Swahili language.'
    if (language === 'sheng') return 'Write in Sheng — the Kenyan urban slang mix of Swahili and English spoken by Nairobi youth. Be authentic and natural.'
    return 'Write in English. You may include a few Swahili or Kenyan cultural references where relevant.'
  }

  private getBrandVoiceInstruction(brandVoice?: BrandVoiceInput): string {
    if (!brandVoice) return ''

    let instruction = '\n\nBrand Voice Guidelines:'
    if (brandVoice.tone) instruction += `\n- Tone: ${brandVoice.tone}`
    if (brandVoice.style) instruction += `\n- Style: ${brandVoice.style}`
    if (brandVoice.keywords?.length) instruction += `\n- Include these keywords where natural: ${brandVoice.keywords.join(', ')}`
    if (brandVoice.avoidWords?.length) instruction += `\n- Avoid these words: ${brandVoice.avoidWords.join(', ')}`
    if (brandVoice.examples?.length) instruction += `\n- Match the style of these examples:\n${brandVoice.examples.join('\n')}`

    return instruction
  }

  // ─── Caption Generation ───────────────────────────────────────────

  async generateCaptions(userId: string, input: GenerateCaptionInput) {
    const {
      platform,
      topic,
      tone = 'casual',
      includeHashtags = true,
      includeEmojis = true,
      language = 'en',
      count = 3,
      brandVoice,
    } = input

    const platformGuide = this.getPlatformGuidelines(platform)
    const languageInstruction = this.getLanguageInstruction(language)
    const brandVoiceInstruction = this.getBrandVoiceInstruction(brandVoice)

    const systemPrompt = `You are an expert social media content creator specialising in the Kenyan market. You understand Kenyan culture, trends, and what resonates with Kenyan audiences on social media.

${languageInstruction}
${brandVoiceInstruction}`

    const userPrompt = `Generate ${count} unique ${platform} caption${count > 1 ? 's' : ''} about: "${topic}"

Platform guidelines: ${platformGuide}
Tone: ${tone}
${includeHashtags ? 'Include relevant hashtags at the end of each caption.' : 'Do not include hashtags.'}
${includeEmojis ? 'Use relevant emojis naturally throughout.' : 'Do not use emojis.'}

Format your response as a numbered list. Each caption should be complete and ready to post.
Separate each caption with a blank line.`

    const { content, tokensUsed } = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      0.85,
      1500
    )

    await prisma.generatedContent.create({
      data: {
        userId,
        type: 'CAPTION',
        platform: platform as any,
        prompt: topic,
        result: content,
        tone,
        language,
        tokensUsed,
      },
    })

    const captions = content
      .split(/\n\s*\n/)
      .map((c) => c.replace(/^\d+\.\s*/, '').trim())
      .filter((c) => c.length > 0)

    return { captions, tokensUsed }
  }

  // ─── Hashtag Generation ───────────────────────────────────────────

  async generateHashtags(userId: string, input: GenerateHashtagsInput) {
    const { topic, platform, count = 20, includeKenyanTrends = true } = input

    const userPrompt = `Generate ${count} relevant hashtags for a ${platform} post about: "${topic}"

Requirements:
- Mix of popular and niche hashtags
- ${includeKenyanTrends ? 'Include some Kenya-specific hashtags where relevant (e.g. #Kenya #Nairobi #KenyaTwitter #KOT)' : ''}
- Include hashtags of varying popularity (some with millions of posts, some with thousands)
- All hashtags must start with #
- Return ONLY the hashtags separated by spaces, nothing else`

    const { content, tokensUsed } = await chatCompletion(
      [{ role: 'user', content: userPrompt }],
      0.7,
      500
    )

    await prisma.generatedContent.create({
      data: {
        userId,
        type: 'HASHTAGS',
        platform: platform as any,
        prompt: topic,
        result: content,
        tokensUsed,
      },
    })

    const hashtags = content
      .split(/\s+/)
      .filter((h) => h.startsWith('#'))
      .slice(0, count)

    return { hashtags, tokensUsed }
  }

  // ─── Content Adaptation ───────────────────────────────────────────

  async adaptContent(userId: string, input: AdaptContentInput) {
    const { originalContent, fromPlatform, toPlatforms, tone } = input

    const adaptations: Record<string, string> = {}
    let totalTokens = 0

    for (const platform of toPlatforms) {
      const platformGuide = this.getPlatformGuidelines(platform)

      const userPrompt = `Adapt the following ${fromPlatform} content for ${platform}:

Original content:
"${originalContent}"

${platformGuide}
${tone ? `Maintain a ${tone} tone.` : 'Maintain the original tone.'}

Return only the adapted content, ready to post. No explanations.`

      const { content, tokensUsed } = await chatCompletion(
        [{ role: 'user', content: userPrompt }],
        0.75,
        800
      )

      adaptations[platform] = content.trim()
      totalTokens += tokensUsed
    }

    await prisma.generatedContent.create({
      data: {
        userId,
        type: 'CAPTION',
        platform: fromPlatform as any,
        prompt: `Adapt from ${fromPlatform} to ${toPlatforms.join(', ')}`,
        result: JSON.stringify(adaptations),
        tokensUsed: totalTokens,
      },
    })

    return { adaptations, tokensUsed: totalTokens }
  }

  // ─── Twitter Thread Generation ────────────────────────────────────

  async generateThread(userId: string, input: GenerateThreadInput) {
    const { topic, pointCount = 5, tone = 'educational' } = input

    const userPrompt = `Write a Twitter/X thread about: "${topic}"

Requirements:
- ${pointCount} tweets in the thread
- Each tweet must be under 280 characters
- Start with a hook tweet that makes people want to read more
- End with a call to action or summary tweet
- Number each tweet like: 1/ 2/ 3/ etc.
- ${tone} tone
- Kenyan perspective where relevant

Return only the numbered tweets, each on a new line.`

    const { content, tokensUsed } = await chatCompletion(
      [{ role: 'user', content: userPrompt }],
      0.8,
      1000
    )

    await prisma.generatedContent.create({
      data: {
        userId,
        type: 'THREAD',
        platform: 'TWITTER',
        prompt: topic,
        result: content,
        tone,
        tokensUsed,
      },
    })

    const tweets = content
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && /^\d+\//.test(t))

    return { tweets, tokensUsed }
  }

  // ─── LinkedIn Article ─────────────────────────────────────────────

  async generateArticle(userId: string, input: GenerateArticleInput) {
    const { topic, tone = 'professional', wordCount = 500, includeHeadings = true } = input

    const userPrompt = `Write a LinkedIn article about: "${topic}"

Requirements:
- Approximately ${wordCount} words
- ${tone} tone
- ${includeHeadings ? 'Use clear headings and subheadings' : 'No headings, flowing prose'}
- Start with a compelling hook
- Include actionable insights
- End with a question to drive engagement
- Kenyan business/professional context where relevant`

    const { content, tokensUsed } = await chatCompletion(
      [{ role: 'user', content: userPrompt }],
      0.75,
      2000
    )

    await prisma.generatedContent.create({
      data: {
        userId,
        type: 'ARTICLE',
        platform: 'LINKEDIN',
        prompt: topic,
        result: content,
        tone,
        tokensUsed,
      },
    })

    return { article: content, tokensUsed }
  }

  // ─── AI Chat Assistant ────────────────────────────────────────────

  async chat(userId: string, messages: Array<{ role: string; content: string }>) {
    const systemPrompt = `You are Yoyzie AI Assistant — a smart, friendly social media expert built specifically for the Kenyan market. You help users with:
- Creating social media content (captions, hashtags, threads, articles)
- Social media strategy and growth tips
- Understanding Kenyan social media trends
- Campaign planning and influencer marketing advice
- Analytics interpretation

You understand Kenyan culture, Swahili, Sheng, and the local social media landscape. Be conversational, practical, and helpful. When generating content, always ask about the platform, topic, and tone if not specified.`

    const formattedMessages = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const { content, tokensUsed } = await chatCompletion(
      [{ role: 'system', content: systemPrompt }, ...formattedMessages],
      0.8,
      1000
    )

    return { reply: content, tokensUsed }
  }

  // ─── Brand Voice ──────────────────────────────────────────────────

  async saveBrandVoice(userId: string, input: BrandVoiceInput) {
    const brandVoice = await prisma.brandVoice.upsert({
      where: { userId },
      update: {
        tone: input.tone || 'casual',
        style: input.style,
        keywords: input.keywords || [],
        avoidWords: input.avoidWords || [],
        examples: input.examples || [],
      },
      create: {
        userId,
        tone: input.tone || 'casual',
        style: input.style,
        keywords: input.keywords || [],
        avoidWords: input.avoidWords || [],
        examples: input.examples || [],
      },
    })

    return brandVoice
  }

  async getBrandVoice(userId: string) {
    const brandVoice = await prisma.brandVoice.findUnique({ where: { userId } })
    return brandVoice
  }

  // ─── Content History ──────────────────────────────────────────────

  async getHistory(userId: string, page = 1, limit = 20, type?: string) {
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (type) where.type = type

    const [items, total] = await Promise.all([
      prisma.generatedContent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.generatedContent.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async saveContent(userId: string, contentId: string) {
    const content = await prisma.generatedContent.findFirst({
      where: { id: contentId, userId },
    })

    if (!content) throw new Error('Content not found')

    const updated = await prisma.generatedContent.update({
      where: { id: contentId },
      data: { isSaved: true },
    })

    return updated
  }

  async deleteContent(userId: string, contentId: string) {
    const content = await prisma.generatedContent.findFirst({
      where: { id: contentId, userId },
    })

    if (!content) throw new Error('Content not found')

    await prisma.generatedContent.delete({ where: { id: contentId } })
    return { message: 'Content deleted successfully' }
  }
}
