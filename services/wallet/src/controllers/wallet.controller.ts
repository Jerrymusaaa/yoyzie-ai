import { Request, Response } from 'express'
import { WalletService } from '../services/wallet.service'
import { sendSuccess, sendError } from '../utils/response'

const walletService = new WalletService()

export class WalletController {

  async getWallet(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const wallet = await walletService.getWallet(userId)
      return sendSuccess(res, 'Wallet fetched', wallet)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const type = req.query.type as string | undefined
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const result = await walletService.getTransactions(userId, type, page, limit)
      return sendSuccess(res, 'Transactions fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async withdrawMpesa(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { amount, mpesaNumber } = req.body

      if (!amount || !mpesaNumber) {
        return sendError(res, 'amount and mpesaNumber are required')
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return sendError(res, 'amount must be a positive number')
      }

      const result = await walletService.withdrawMpesa(userId, { amount, mpesaNumber })
      return sendSuccess(res, result.message, result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async withdrawPaypal(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { amount, paypalEmail } = req.body

      if (!amount || !paypalEmail) {
        return sendError(res, 'amount and paypalEmail are required')
      }

      const result = await walletService.withdrawPaypal(userId, { amount, paypalEmail })
      return sendSuccess(res, result.message, result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async withdrawBank(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { amount, bankName, accountNumber, accountName } = req.body

      if (!amount || !bankName || !accountNumber || !accountName) {
        return sendError(res, 'amount, bankName, accountNumber, and accountName are required')
      }

      const result = await walletService.withdrawBank(userId, {
        amount, bankName, accountNumber, accountName,
      })

      return sendSuccess(res, result.message, result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async creditWallet(req: Request, res: Response) {
    try {
      const { userId, amount, campaignId, description, accountType } = req.body

      if (!userId || !amount) {
        return sendError(res, 'userId and amount are required')
      }

      const result = await walletService.creditWallet({
        userId, amount, campaignId, description, accountType,
      })

      return sendSuccess(res, 'Wallet credited successfully', result, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async holdEscrow(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { influencerId, campaignId, amount } = req.body

      if (!influencerId || !campaignId || !amount) {
        return sendError(res, 'influencerId, campaignId, and amount are required')
      }

      const escrow = await walletService.holdEscrow(userId, influencerId, campaignId, amount)
      return sendSuccess(res, 'Escrow held successfully', escrow, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async releaseEscrow(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const campaignId = req.params.campaignId as string
      const result = await walletService.releaseEscrow(userId, campaignId)
      return sendSuccess(res, 'Escrow released and influencer paid', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async refundEscrow(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const campaignId = req.params.campaignId as string
      const result = await walletService.refundEscrow(userId, campaignId)
      return sendSuccess(res, result.message, result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getEarningsStatement(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const year = parseInt(req.query.year as string) || new Date().getFullYear()
      const month = req.query.month ? parseInt(req.query.month as string) : undefined

      const statement = await walletService.getEarningsStatement(userId, year, month)
      return sendSuccess(res, 'Earnings statement fetched', statement)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const wallet = await walletService.updateSettings(userId, req.body)
      return sendSuccess(res, 'Wallet settings updated', wallet)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async mpesaB2CResult(req: Request, res: Response) {
    try {
      await walletService.handleMpesaB2CResult(req.body)
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    } catch (error: any) {
      return res.json({ ResultCode: 1, ResultDesc: error.message })
    }
  }

  async mpesaB2CTimeout(req: Request, res: Response) {
    console.log('M-Pesa B2C timeout received:', req.body)
    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }

  async getPendingWithdrawals(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const result = await walletService.getPendingWithdrawals(page, limit)
      return sendSuccess(res, 'Pending withdrawals fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }
}
