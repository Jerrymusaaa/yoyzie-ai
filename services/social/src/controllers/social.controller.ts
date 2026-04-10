import { Request, Response } from 'express'
import { SocialService } from '../services/social.service'
import { sendSuccess, sendError } from '../utils/response'
import { env } from '../config/env'

const socialService = new SocialService()

export class SocialController {

  connectInstagram(req: Request, res: Response) {
    try {
      const url = socialService.getInstagramAuthUrl(req.user.userId)
      return sendSuccess(res, 'Instagram auth URL generated', { url })
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  connectFacebook(req: Request, res: Response) {
    try {
      const url = socialService.getFacebookAuthUrl(req.user.userId)
      return sendSuccess(res, 'Facebook auth URL generated', { url })
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  connectTikTok(req: Request, res: Response) {
    try {
      const url = socialService.getTikTokAuthUrl(req.user.userId)
      return sendSuccess(res, 'TikTok auth URL generated', { url })
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  connectLinkedIn(req: Request, res: Response) {
    try {
      const url = socialService.getLinkedInAuthUrl(req.user.userId)
      return sendSuccess(res, 'LinkedIn auth URL generated', { url })
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  connectTwitter(req: Request, res: Response) {
    try {
      const url = socialService.getTwitterAuthUrl(req.user.userId)
      return sendSuccess(res, 'Twitter auth URL generated', { url })
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async instagramCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query as { code: string; state: string }
      const { userId } = socialService.parseState(state)
      const tokens = await socialService.exchangeInstagramCode(code)
      const profile = await socialService.fetchInstagramProfile(tokens.accessToken)
      await socialService.saveConnection(userId, 'INSTAGRAM', tokens, profile)
      return res.redirect(`${env.CLIENT_URL}/dashboard/settings/social?connected=instagram`)
    } catch (error: any) {
      return res.redirect(`${env.CLIENT_URL}/dashboard/settings/social?error=${encodeURIComponent(error.message)}`)
    }
  }

  async facebookCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query as { code: string; state: string }
      const { userId } = socialService.parseState(state)
      const tokens = await socialService.exchangeFacebookCode(code)
      const profile = await socialService.fetchFacebookProfile(tokens.accessToken)
      await socialService.saveConnection(userId, 'FACEBOOK', tokens, profile)
      return res.redirect(`${env.CLIENT_URL}/dashboard/settings/social?connected=facebook`)
    } catch (error: any) {
      return res.redirect(`${env.CLIENT_URL}/dashboard/settings/social?error=${encodeURIComponent(error.message)}`)
    }
  }

  async tiktokCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query as { code: string; state: string }
      const { userId } = socialService.parseState(state)
      const tokens = await socialService.exchangeTikTokCode(code)
      const profile = await socialService.fetchTikTokProfile(tokens.accessToken)
      await socialService.saveConnection(userId, 'TIKTOK', tokens, profile)
      return res.redirect(`${env.CLIENT_URL}/dashboard/settings/social?connected=tiktok`)
    } catch (error: any) {
      return res.redirect(`${env.CLIENT_URL}/dashboard/settings/social?error=${encodeURIComponent(error.message)}`)
    }
  }

  async linkedinCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query as { code: string; state: string }
      const { userId } = socialService.parseState(state)
      const tokens = await socialService.exchangeLinkedInCode(code)
      const profile = await socialService.fetchLinkedInProfile(tokens.accessToken)
      await socialService.saveConnection(userId, 'LINKEDIN', tokens, profile)
      return res.redirect(`${env.CLIENT_URL}/dashboard/settings/social?connected=linkedin`)
    } catch (error: any) {
      return res.redirect(`${env.CLIENT_URL}/dashboard/settings/social?error=${encodeURIComponent(error.message)}`)
    }
  }

  async twitterCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query as { code: string; state: string }
      const { userId } = socialService.parseState(state)
      const tokens = await socialService.exchangeTwitterCode(code)
      const profile = await socialService.fetchTwitterProfile(tokens.accessToken)
      await socialService.saveConnection(userId, 'TWITTER', tokens, profile)
      return res.redirect(`${env.CLIENT_URL}/dashboard/settings/social?connected=twitter`)
    } catch (error: any) {
      return res.redirect(`${env.CLIENT_URL}/dashboard/settings/social?error=${encodeURIComponent(error.message)}`)
    }
  }

  async getConnectedAccounts(req: Request, res: Response) {
    try {
      const accounts = await socialService.getConnectedAccounts(req.user.userId)
      return sendSuccess(res, 'Connected accounts fetched', accounts)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async disconnectAccount(req: Request, res: Response) {
    try {
      const platform = (req.params.platform as string).toUpperCase()
      const result = await socialService.disconnectAccount(req.user.userId, platform)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const platform = (req.params.platform as string).toUpperCase()
      const result = await socialService.refreshSocialToken(req.user.userId, platform)
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }
}
