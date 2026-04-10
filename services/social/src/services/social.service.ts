import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { encrypt, decrypt } from '../utils/encryption'
import { env } from '../config/env'
import { OAuthTokens, SocialProfileData } from '../types'

const prisma = new PrismaClient()

export class SocialService {

  // ─── OAuth URL Builders ───────────────────────────────────────────

  getInstagramAuthUrl(userId: string): string {
    const state = Buffer.from(JSON.stringify({ userId, platform: 'instagram' })).toString('base64')
    const params = new URLSearchParams({
      client_id: env.INSTAGRAM_CLIENT_ID,
      redirect_uri: env.INSTAGRAM_REDIRECT_URI,
      scope: 'user_profile,user_media',
      response_type: 'code',
      state,
    })
    return `https://api.instagram.com/oauth/authorize?${params}`
  }

  getFacebookAuthUrl(userId: string): string {
    const state = Buffer.from(JSON.stringify({ userId, platform: 'facebook' })).toString('base64')
    const params = new URLSearchParams({
      client_id: env.FACEBOOK_CLIENT_ID,
      redirect_uri: env.FACEBOOK_REDIRECT_URI,
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish',
      response_type: 'code',
      state,
    })
    return `https://www.facebook.com/v19.0/dialog/oauth?${params}`
  }

  getTikTokAuthUrl(userId: string): string {
    const state = Buffer.from(JSON.stringify({ userId, platform: 'tiktok' })).toString('base64')
    const params = new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_ID,
      redirect_uri: env.TIKTOK_REDIRECT_URI,
      scope: 'user.info.basic,video.list',
      response_type: 'code',
      state,
    })
    return `https://www.tiktok.com/v2/auth/authorize?${params}`
  }

  getLinkedInAuthUrl(userId: string): string {
    const state = Buffer.from(JSON.stringify({ userId, platform: 'linkedin' })).toString('base64')
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: env.LINKEDIN_CLIENT_ID,
      redirect_uri: env.LINKEDIN_REDIRECT_URI,
      scope: 'openid profile email w_member_social',
      state,
    })
    return `https://www.linkedin.com/oauth/v2/authorization?${params}`
  }

  getTwitterAuthUrl(userId: string): string {
    const state = Buffer.from(JSON.stringify({ userId, platform: 'twitter' })).toString('base64')
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: env.TWITTER_CLIENT_ID,
      redirect_uri: env.TWITTER_REDIRECT_URI,
      scope: 'tweet.read tweet.write users.read offline.access',
      state,
      code_challenge: 'challenge',
      code_challenge_method: 'plain',
    })
    return `https://twitter.com/i/oauth2/authorize?${params}`
  }

  // ─── Token Exchange ───────────────────────────────────────────────

  async exchangeInstagramCode(code: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      client_id: env.INSTAGRAM_CLIENT_ID,
      client_secret: env.INSTAGRAM_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: env.INSTAGRAM_REDIRECT_URI,
      code,
    })

    const { data } = await axios.post('https://api.instagram.com/oauth/access_token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return { accessToken: data.access_token, scopes: ['user_profile', 'user_media'] }
  }

  async exchangeFacebookCode(code: string): Promise<OAuthTokens> {
    const { data } = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: env.FACEBOOK_CLIENT_ID,
        client_secret: env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: env.FACEBOOK_REDIRECT_URI,
        code,
      },
    })

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }
  }

  async exchangeTikTokCode(code: string): Promise<OAuthTokens> {
    const { data } = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      client_key: env.TIKTOK_CLIENT_ID,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: env.TIKTOK_REDIRECT_URI,
      code,
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scopes: data.scope?.split(','),
    }
  }

  async exchangeLinkedInCode(code: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.LINKEDIN_REDIRECT_URI,
      client_id: env.LINKEDIN_CLIENT_ID,
      client_secret: env.LINKEDIN_CLIENT_SECRET,
    })

    const { data } = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      scopes: data.scope?.split(' '),
    }
  }

  async exchangeTwitterCode(code: string): Promise<OAuthTokens> {
    const credentials = Buffer.from(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`).toString('base64')

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.TWITTER_REDIRECT_URI,
      code_verifier: 'challenge',
    })

    const { data } = await axios.post('https://api.twitter.com/2/oauth2/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
    })

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scopes: data.scope?.split(' '),
    }
  }

  // ─── Profile Fetchers ─────────────────────────────────────────────

  async fetchInstagramProfile(accessToken: string): Promise<SocialProfileData> {
    const { data } = await axios.get('https://graph.instagram.com/me', {
      params: {
        fields: 'id,username,account_type,media_count,followers_count',
        access_token: accessToken,
      },
    })

    return {
      platformAccountId: data.id,
      platformUsername: data.username,
      platformDisplayName: data.username,
      followerCount: data.followers_count,
      postCount: data.media_count,
    }
  }

  async fetchFacebookProfile(accessToken: string): Promise<SocialProfileData> {
    const { data } = await axios.get('https://graph.facebook.com/v19.0/me', {
      params: {
        fields: 'id,name,picture',
        access_token: accessToken,
      },
    })

    return {
      platformAccountId: data.id,
      platformDisplayName: data.name,
      profileImageUrl: data.picture?.data?.url,
    }
  }

  async fetchTikTokProfile(accessToken: string): Promise<SocialProfileData> {
    const { data } = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      params: { fields: 'open_id,display_name,avatar_url,follower_count,following_count,video_count' },
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const user = data.data?.user
    return {
      platformAccountId: user.open_id,
      platformDisplayName: user.display_name,
      profileImageUrl: user.avatar_url,
      followerCount: user.follower_count,
      followingCount: user.following_count,
      postCount: user.video_count,
    }
  }

  async fetchLinkedInProfile(accessToken: string): Promise<SocialProfileData> {
    const { data } = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    return {
      platformAccountId: data.sub,
      platformUsername: data.email,
      platformDisplayName: data.name,
      profileImageUrl: data.picture,
    }
  }

  async fetchTwitterProfile(accessToken: string): Promise<SocialProfileData> {
    const { data } = await axios.get('https://api.twitter.com/2/users/me', {
      params: { 'user.fields': 'public_metrics,profile_image_url,username' },
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const user = data.data
    return {
      platformAccountId: user.id,
      platformUsername: user.username,
      platformDisplayName: user.name,
      profileImageUrl: user.profile_image_url,
      followerCount: user.public_metrics?.followers_count,
      followingCount: user.public_metrics?.following_count,
      postCount: user.public_metrics?.tweet_count,
    }
  }

  // ─── Save / Update Connected Account ─────────────────────────────

  async saveConnection(
    userId: string,
    platform: string,
    tokens: OAuthTokens,
    profile: SocialProfileData
  ) {
    const encryptedAccess = encrypt(tokens.accessToken)
    const encryptedRefresh = tokens.refreshToken ? encrypt(tokens.refreshToken) : null

    const tokenExpiresAt = tokens.expiresIn
      ? new Date(Date.now() + tokens.expiresIn * 1000)
      : null

    const account = await prisma.socialAccount.upsert({
      where: { userId_platform: { userId, platform: platform as any } },
      update: {
        platformAccountId: profile.platformAccountId,
        platformUsername: profile.platformUsername,
        platformDisplayName: profile.platformDisplayName,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        tokenExpiresAt,
        scopes: tokens.scopes || [],
        followerCount: profile.followerCount,
        followingCount: profile.followingCount,
        postCount: profile.postCount,
        profileImageUrl: profile.profileImageUrl,
        isActive: true,
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        platform: platform as any,
        platformAccountId: profile.platformAccountId,
        platformUsername: profile.platformUsername,
        platformDisplayName: profile.platformDisplayName,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        tokenExpiresAt,
        scopes: tokens.scopes || [],
        followerCount: profile.followerCount,
        followingCount: profile.followingCount,
        postCount: profile.postCount,
        profileImageUrl: profile.profileImageUrl,
        lastSyncedAt: new Date(),
      },
    })

    return {
      id: account.id,
      platform: account.platform,
      platformUsername: account.platformUsername,
      platformDisplayName: account.platformDisplayName,
      followerCount: account.followerCount,
      isActive: account.isActive,
      lastSyncedAt: account.lastSyncedAt,
    }
  }

  // ─── Get Connected Accounts ───────────────────────────────────────

  async getConnectedAccounts(userId: string) {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        platform: true,
        platformUsername: true,
        platformDisplayName: true,
        followerCount: true,
        followingCount: true,
        postCount: true,
        profileImageUrl: true,
        scopes: true,
        lastSyncedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return accounts
  }

  // ─── Disconnect Account ───────────────────────────────────────────

  async disconnectAccount(userId: string, platform: string) {
    const account = await prisma.socialAccount.findUnique({
      where: { userId_platform: { userId, platform: platform as any } },
    })

    if (!account) throw new Error(`No ${platform} account connected`)

    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { isActive: false, accessToken: '', refreshToken: null },
    })

    return { message: `${platform} account disconnected successfully` }
  }

  // ─── Refresh Token ────────────────────────────────────────────────

  async refreshSocialToken(userId: string, platform: string) {
    const account = await prisma.socialAccount.findUnique({
      where: { userId_platform: { userId, platform: platform as any } },
    })

    if (!account || !account.refreshToken) {
      throw new Error('No refresh token available for this account')
    }

    const decryptedRefresh = decrypt(account.refreshToken)
    let newAccessToken: string
    let newExpiresAt: Date | null = null

    if (platform === 'TIKTOK') {
      const { data } = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
        client_key: env.TIKTOK_CLIENT_ID,
        client_secret: env.TIKTOK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: decryptedRefresh,
      })
      newAccessToken = data.access_token
      newExpiresAt = new Date(Date.now() + data.expires_in * 1000)
    } else if (platform === 'TWITTER') {
      const credentials = Buffer.from(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`).toString('base64')
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: decryptedRefresh,
      })
      const { data } = await axios.post('https://api.twitter.com/2/oauth2/token', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
      })
      newAccessToken = data.access_token
      newExpiresAt = new Date(Date.now() + data.expires_in * 1000)
    } else {
      throw new Error(`Token refresh not supported for ${platform}`)
    }

    await prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        accessToken: encrypt(newAccessToken),
        tokenExpiresAt: newExpiresAt,
        lastSyncedAt: new Date(),
      },
    })

    return { message: 'Token refreshed successfully' }
  }

  // ─── Parse OAuth State ────────────────────────────────────────────

  parseState(state: string): { userId: string; platform: string } {
    try {
      return JSON.parse(Buffer.from(state, 'base64').toString())
    } catch {
      throw new Error('Invalid OAuth state parameter')
    }
  }
}
