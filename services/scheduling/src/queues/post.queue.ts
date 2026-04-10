import Bull from 'bull'
import { env } from '../config/env'

export interface PostJobData {
  postId: string
  userId: string
  platform: string
  caption: string
  hashtags: string[]
  mediaUrls: string[]
}

export const postQueue = new Bull<PostJobData>('scheduled-posts', {
  redis: env.REDIS_URL,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
})

// Process jobs
postQueue.process(async (job) => {
  const { postId, userId, platform, caption, hashtags } = job.data

  console.log(`📤 Publishing post ${postId} to ${platform} for user ${userId}`)

  // In production this calls the Social Service to publish
  // For now we simulate the publish
  await new Promise((resolve) => setTimeout(resolve, 1000))

  console.log(`✅ Post ${postId} published successfully`)

  return { success: true, postId }
})

postQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed for post ${result.postId}`)
})

postQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message)
})

postQueue.on('error', (err) => {
  console.error('Queue error:', err)
})
