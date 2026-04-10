import { PrismaClient } from '@prisma/client'
import { postQueue } from '../queues/post.queue'
import { CreatePostInput, UpdatePostInput, CalendarQuery, Platform } from '../types'

const prisma = new PrismaClient()

// Best posting times by platform (Kenyan timezone — Africa/Nairobi)
const OPTIMAL_TIMES: Record<string, Array<{ day: number; hour: number; score: number }>> = {
  INSTAGRAM: [
    { day: 1, hour: 7, score: 0.85 },
    { day: 1, hour: 12, score: 0.90 },
    { day: 1, hour: 19, score: 0.95 },
    { day: 2, hour: 7, score: 0.80 },
    { day: 2, hour: 12, score: 0.88 },
    { day: 2, hour: 19, score: 0.92 },
    { day: 3, hour: 7, score: 0.82 },
    { day: 3, hour: 12, score: 0.89 },
    { day: 3, hour: 19, score: 0.94 },
    { day: 4, hour: 12, score: 0.87 },
    { day: 4, hour: 19, score: 0.91 },
    { day: 5, hour: 12, score: 0.86 },
    { day: 5, hour: 17, score: 0.90 },
    { day: 6, hour: 10, score: 0.88 },
    { day: 6, hour: 14, score: 0.85 },
    { day: 0, hour: 11, score: 0.83 },
    { day: 0, hour: 15, score: 0.82 },
  ],
  TIKTOK: [
    { day: 1, hour: 6, score: 0.88 },
    { day: 1, hour: 19, score: 0.95 },
    { day: 1, hour: 21, score: 0.92 },
    { day: 2, hour: 6, score: 0.85 },
    { day: 2, hour: 19, score: 0.93 },
    { day: 3, hour: 6, score: 0.86 },
    { day: 3, hour: 21, score: 0.94 },
    { day: 4, hour: 19, score: 0.91 },
    { day: 5, hour: 19, score: 0.90 },
    { day: 5, hour: 21, score: 0.93 },
    { day: 6, hour: 11, score: 0.89 },
    { day: 6, hour: 19, score: 0.92 },
    { day: 0, hour: 11, score: 0.87 },
    { day: 0, hour: 19, score: 0.90 },
  ],
  LINKEDIN: [
    { day: 1, hour: 7, score: 0.92 },
    { day: 1, hour: 8, score: 0.95 },
    { day: 1, hour: 12, score: 0.88 },
    { day: 2, hour: 7, score: 0.90 },
    { day: 2, hour: 8, score: 0.93 },
    { day: 3, hour: 7, score: 0.91 },
    { day: 3, hour: 8, score: 0.94 },
    { day: 4, hour: 7, score: 0.89 },
    { day: 4, hour: 8, score: 0.92 },
    { day: 5, hour: 7, score: 0.85 },
    { day: 5, hour: 8, score: 0.87 },
  ],
  TWITTER: [
    { day: 1, hour: 7, score: 0.88 },
    { day: 1, hour: 12, score: 0.90 },
    { day: 1, hour: 20, score: 0.92 },
    { day: 2, hour: 7, score: 0.86 },
    { day: 2, hour: 12, score: 0.89 },
    { day: 3, hour: 7, score: 0.87 },
    { day: 3, hour: 12, score: 0.91 },
    { day: 4, hour: 12, score: 0.88 },
    { day: 4, hour: 20, score: 0.90 },
    { day: 5, hour: 12, score: 0.85 },
    { day: 5, hour: 20, score: 0.89 },
    { day: 6, hour: 11, score: 0.84 },
    { day: 0, hour: 11, score: 0.83 },
  ],
  FACEBOOK: [
    { day: 1, hour: 8, score: 0.85 },
    { day: 1, hour: 13, score: 0.90 },
    { day: 2, hour: 8, score: 0.83 },
    { day: 2, hour: 13, score: 0.88 },
    { day: 3, hour: 8, score: 0.84 },
    { day: 3, hour: 13, score: 0.89 },
    { day: 4, hour: 13, score: 0.87 },
    { day: 5, hour: 13, score: 0.85 },
    { day: 6, hour: 10, score: 0.86 },
    { day: 6, hour: 14, score: 0.88 },
    { day: 0, hour: 12, score: 0.84 },
    { day: 0, hour: 15, score: 0.83 },
  ],
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export class SchedulingService {

  async createPost(userId: string, input: CreatePostInput) {
    const {
      platform,
      caption,
      hashtags = [],
      mediaUrls = [],
      scheduledAt,
      timezone = 'Africa/Nairobi',
    } = input

    const scheduledDate = new Date(scheduledAt)

    if (scheduledDate <= new Date()) {
      throw new Error('Scheduled time must be in the future')
    }

    const post = await prisma.scheduledPost.create({
      data: {
        userId,
        platform: platform as any,
        caption,
        hashtags,
        mediaUrls,
        scheduledAt: scheduledDate,
        timezone,
        status: 'SCHEDULED',
      },
    })

    // Calculate delay in milliseconds
    const delay = scheduledDate.getTime() - Date.now()

    const job = await postQueue.add(
      {
        postId: post.id,
        userId,
        platform,
        caption,
        hashtags,
        mediaUrls,
      },
      { delay }
    )

    await prisma.scheduledPost.update({
      where: { id: post.id },
      data: { bullJobId: String(job.id) },
    })

    return post
  }

  async updatePost(userId: string, postId: string, input: UpdatePostInput) {
    const post = await prisma.scheduledPost.findFirst({
      where: { id: postId, userId },
    })

    if (!post) throw new Error('Post not found')

    if (post.status === 'PUBLISHED' || post.status === 'PUBLISHING') {
      throw new Error('Cannot edit a post that is already published or being published')
    }

    // Cancel existing Bull job if rescheduling
    if (input.scheduledAt && post.bullJobId) {
      const existingJob = await postQueue.getJob(post.bullJobId)
      if (existingJob) await existingJob.remove()
    }

    const updatedPost = await prisma.scheduledPost.update({
      where: { id: postId },
      data: {
        ...(input.caption && { caption: input.caption }),
        ...(input.hashtags && { hashtags: input.hashtags }),
        ...(input.mediaUrls && { mediaUrls: input.mediaUrls }),
        ...(input.scheduledAt && { scheduledAt: new Date(input.scheduledAt) }),
        ...(input.status && { status: input.status as any }),
      },
    })

    // Re-queue if rescheduling
    if (input.scheduledAt) {
      const newScheduledDate = new Date(input.scheduledAt)
      const delay = newScheduledDate.getTime() - Date.now()

      const newJob = await postQueue.add(
        {
          postId: post.id,
          userId,
          platform: post.platform,
          caption: updatedPost.caption,
          hashtags: updatedPost.hashtags,
          mediaUrls: updatedPost.mediaUrls,
        },
        { delay }
      )

      await prisma.scheduledPost.update({
        where: { id: postId },
        data: { bullJobId: String(newJob.id) },
      })
    }

    return updatedPost
  }

  async deletePost(userId: string, postId: string) {
    const post = await prisma.scheduledPost.findFirst({
      where: { id: postId, userId },
    })

    if (!post) throw new Error('Post not found')

    if (post.status === 'PUBLISHED') {
      throw new Error('Cannot delete a published post')
    }

    // Remove from Bull queue
    if (post.bullJobId) {
      const job = await postQueue.getJob(post.bullJobId)
      if (job) await job.remove()
    }

    await prisma.scheduledPost.delete({ where: { id: postId } })
    return { message: 'Post deleted successfully' }
  }

  async getPost(userId: string, postId: string) {
    const post = await prisma.scheduledPost.findFirst({
      where: { id: postId, userId },
    })

    if (!post) throw new Error('Post not found')
    return post
  }

  async getPosts(userId: string, status?: string, platform?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where: any = { userId }

    if (status) where.status = status
    if (platform) where.platform = platform

    const [posts, total] = await Promise.all([
      prisma.scheduledPost.findMany({
        where,
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.scheduledPost.count({ where }),
    ])

    return {
      posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async getCalendar(userId: string, query: CalendarQuery) {
    const { startDate, endDate, platform } = query

    const where: any = {
      userId,
      scheduledAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }

    if (platform) where.platform = platform

    const posts = await prisma.scheduledPost.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
    })

    // Group by date for calendar view
    const grouped: Record<string, any[]> = {}

    for (const post of posts) {
      const dateKey = post.scheduledAt.toISOString().split('T')[0]
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(post)
    }

    return grouped
  }

  async getOptimalTimes(userId: string, platform: Platform) {
    const times = OPTIMAL_TIMES[platform] || []

    // Sort by score descending and take top 5
    const top5 = [...times]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((t) => ({
        dayOfWeek: t.day,
        dayName: DAY_NAMES[t.day],
        hour: t.hour,
        time: `${t.hour.toString().padStart(2, '0')}:00`,
        score: t.score,
        label: `${DAY_NAMES[t.day]} at ${t.hour.toString().padStart(2, '0')}:00 EAT`,
      }))

    return {
      platform,
      timezone: 'Africa/Nairobi',
      recommendations: top5,
    }
  }

  async getQueueStatus() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      postQueue.getWaitingCount(),
      postQueue.getActiveCount(),
      postQueue.getCompletedCount(),
      postQueue.getFailedCount(),
      postQueue.getDelayedCount(),
    ])

    return { waiting, active, completed, failed, delayed }
  }

  async getUpcomingPosts(userId: string, limit = 5) {
    const posts = await prisma.scheduledPost.findMany({
      where: {
        userId,
        status: 'SCHEDULED',
        scheduledAt: { gt: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    })

    return posts
  }

  async cancelPost(userId: string, postId: string) {
    const post = await prisma.scheduledPost.findFirst({
      where: { id: postId, userId },
    })

    if (!post) throw new Error('Post not found')
    if (post.status !== 'SCHEDULED') throw new Error('Only scheduled posts can be cancelled')

    if (post.bullJobId) {
      const job = await postQueue.getJob(post.bullJobId)
      if (job) await job.remove()
    }

    const updated = await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: 'CANCELLED' },
    })

    return updated
  }
}
