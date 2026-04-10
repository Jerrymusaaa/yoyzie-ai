import axios from 'axios'
import { env } from '../config/env'
import { TrendItem } from '../types'

// WOEID for Kenya locations
const KENYA_WOEID = 23424863
const NAIROBI_WOEID = 1528335

export class TwitterTrendsService {

  async getKenyaTrends(): Promise<TrendItem[]> {
    if (!env.TWITTER_BEARER_TOKEN) {
      return this.getFallbackTrends()
    }

    try {
      const { data } = await axios.get(
        `https://api.twitter.com/1.1/trends/place.json?id=${KENYA_WOEID}`,
        {
          headers: {
            Authorization: `Bearer ${env.TWITTER_BEARER_TOKEN}`,
          },
        }
      )

      const trends = data[0]?.trends || []

      return trends.map((t: any, index: number) => ({
        name: t.name,
        tweetVolume: t.tweet_volume || null,
        rank: index + 1,
        url: t.url,
      }))
    } catch (error) {
      console.error('Twitter trends fetch failed, using fallback:', error)
      return this.getFallbackTrends()
    }
  }

  async getNairobiTrends(): Promise<TrendItem[]> {
    if (!env.TWITTER_BEARER_TOKEN) {
      return this.getFallbackTrends('Nairobi')
    }

    try {
      const { data } = await axios.get(
        `https://api.twitter.com/1.1/trends/place.json?id=${NAIROBI_WOEID}`,
        {
          headers: {
            Authorization: `Bearer ${env.TWITTER_BEARER_TOKEN}`,
          },
        }
      )

      const trends = data[0]?.trends || []

      return trends.map((t: any, index: number) => ({
        name: t.name,
        tweetVolume: t.tweet_volume || null,
        rank: index + 1,
        url: t.url,
        county: 'Nairobi',
      }))
    } catch (error) {
      console.error('Nairobi trends fetch failed, using fallback')
      return this.getFallbackTrends('Nairobi')
    }
  }

  // Curated Kenyan trends fallback when API not available
  private getFallbackTrends(county?: string): TrendItem[] {
    const trends = [
      { name: '#KOT', description: 'Kenyans on Twitter', rank: 1 },
      { name: '#Nairobi', description: 'Nairobi trending topics', rank: 2 },
      { name: '#Kenya', description: 'Kenyan conversations', rank: 3 },
      { name: '#254', description: 'Kenyan country code tag', rank: 4 },
      { name: '#NairobiLife', description: 'Life in Nairobi', rank: 5 },
      { name: '#KenyanTwitter', description: 'Kenyan Twitter community', rank: 6 },
      { name: '#Hustler', description: 'Kenyan hustle culture', rank: 7 },
      { name: '#MamboKenyan', description: 'Kenyan affairs', rank: 8 },
      { name: '#NairobiNights', description: 'Nairobi nightlife', rank: 9 },
      { name: '#KenyaDecides', description: 'Kenya political discourse', rank: 10 },
    ]

    return trends.map((t) => ({ ...t, county }))
  }
}
