import axios from 'axios'
import { env } from '../config/env'
import { TrendItem } from '../types'

export class TikTokTrendsService {

  async getTrendingHashtags(): Promise<TrendItem[]> {
    if (!env.RAPIDAPI_KEY) {
      return this.getFallbackHashtags()
    }

    try {
      const { data } = await axios.get(
        'https://tiktok-api23.p.rapidapi.com/api/trending/hashtags',
        {
          headers: {
            'X-RapidAPI-Key': env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'tiktok-api23.p.rapidapi.com',
          },
        }
      )

      const hashtags = data?.data || []

      return hashtags.slice(0, 20).map((h: any, index: number) => ({
        name: `#${h.hashtag_name || h.title}`,
        postVolume: h.video_count || h.viewCount,
        rank: index + 1,
      }))
    } catch (error) {
      console.error('TikTok hashtag fetch failed, using fallback')
      return this.getFallbackHashtags()
    }
  }

  async getTrendingSounds(): Promise<TrendItem[]> {
    if (!env.RAPIDAPI_KEY) {
      return this.getFallbackSounds()
    }

    try {
      const { data } = await axios.get(
        'https://tiktok-api23.p.rapidapi.com/api/trending/music',
        {
          headers: {
            'X-RapidAPI-Key': env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'tiktok-api23.p.rapidapi.com',
          },
        }
      )

      const sounds = data?.data || []

      return sounds.slice(0, 20).map((s: any, index: number) => ({
        name: s.music_info?.title || s.title,
        description: s.music_info?.author || s.author,
        postVolume: s.use_count || s.video_count,
        rank: index + 1,
        url: s.play_url,
      }))
    } catch (error) {
      console.error('TikTok sounds fetch failed, using fallback')
      return this.getFallbackSounds()
    }
  }

  private getFallbackHashtags(): TrendItem[] {
    return [
      { name: '#fyp', description: 'For You Page', rank: 1 },
      { name: '#foryou', description: 'For You', rank: 2 },
      { name: '#trending', description: 'Trending content', rank: 3 },
      { name: '#viral', description: 'Viral content', rank: 4 },
      { name: '#nairobi', description: 'Nairobi TikTok', rank: 5 },
      { name: '#kenya', description: 'Kenya TikTok', rank: 6 },
      { name: '#kenyatiktok', description: 'Kenyan TikTok community', rank: 7 },
      { name: '#nairobicity', description: 'Nairobi city life', rank: 8 },
      { name: '#eastafrica', description: 'East Africa content', rank: 9 },
      { name: '#africantiktok', description: 'African TikTok community', rank: 10 },
    ]
  }

  private getFallbackSounds(): TrendItem[] {
    return [
      { name: 'Wamlambez', description: 'Sailors Gang', rank: 1 },
      { name: 'Lewa', description: 'Kenyan viral sound', rank: 2 },
      { name: 'Tetema', description: 'Rayvanny', rank: 3 },
      { name: 'Bado', description: 'Kenyan trending audio', rank: 4 },
      { name: 'Sugua', description: 'Diamond Platnumz', rank: 5 },
    ]
  }
}
