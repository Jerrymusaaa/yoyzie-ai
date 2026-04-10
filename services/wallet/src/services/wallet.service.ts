import { PrismaClient } from '@prisma/client'
import { MpesaService } from './mpesa.service'
import { PaypalService } from './paypal.service'
import { env } from '../config/env'
import {
  WithdrawMpesaInput,
  WithdrawPaypalInput,
  WithdrawBankInput,
  CreditWalletInput,
  UpdateWalletSettingsInput,
} from '../types'

const prisma = new PrismaClient()
const mpesaService = new MpesaService()
const paypalService = new PaypalService()

export class WalletService {

  // ─── Get or Create Wallet ─────────────────────────────────────────

  async getOrCreateWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({ where: { userId } })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId },
      })
    }

    return wallet
  }

  async getWallet(userId: string) {
    return this.getOrCreateWallet(userId)
  }

  // ─── Commission Rate by Plan ──────────────────────────────────────

  getCommissionRate(accountType: string): number {
    const rates: Record<string, number> = {
      INFLUENCER_FREE: env.COMMISSION_FREE,
      INFLUENCER_STARTER: env.COMMISSION_STARTER,
      INFLUENCER_PRO: env.COMMISSION_PRO,
      CREATOR_MODE: env.COMMISSION_CREATOR_MODE,
    }
    return rates[accountType] ?? env.COMMISSION_FREE
  }

  // ─── Credit Wallet (after campaign payment) ───────────────────────

  async creditWallet(input: CreditWalletInput) {
    const { userId, amount, campaignId, description, accountType } = input

    const wallet = await this.getOrCreateWallet(userId)

    const commissionRate = this.getCommissionRate(accountType || 'INFLUENCER_FREE')
    const commissionAmount = (amount * commissionRate) / 100
    const netAmount = amount - commissionAmount

    // Record commission deduction
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'COMMISSION',
        amount: commissionAmount,
        fee: 0,
        netAmount: -commissionAmount,
        status: 'COMPLETED',
        description: `Platform commission (${commissionRate}%)`,
        campaignId,
        processedAt: new Date(),
      },
    })

    // Credit net earnings
    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'CREDIT',
        amount,
        fee: commissionAmount,
        netAmount,
        status: 'COMPLETED',
        description: description || 'Campaign earnings',
        campaignId,
        processedAt: new Date(),
      },
    })

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: netAmount },
        totalEarned: { increment: netAmount },
      },
    })

    return { transaction, netAmount, commissionAmount, commissionRate }
  }

  // ─── M-Pesa Withdrawal ────────────────────────────────────────────

  async withdrawMpesa(userId: string, input: WithdrawMpesaInput) {
    const { amount, mpesaNumber } = input

    const wallet = await this.getOrCreateWallet(userId)

    if (wallet.balance < amount) {
      throw new Error(`Insufficient balance. Available: KES ${wallet.balance.toLocaleString()}`)
    }

    if (amount < 100) throw new Error('Minimum withdrawal amount is KES 100')
    if (amount > 150000) throw new Error('Maximum single withdrawal is KES 150,000')

    const requiresReview = amount >= env.FINANCE_REVIEW_THRESHOLD

    // Deduct from balance immediately (hold while processing)
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amount },
        pendingBalance: { increment: amount },
      },
    })

    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'WITHDRAWAL',
        amount,
        fee: 0,
        netAmount: amount,
        status: requiresReview ? 'PENDING' : 'PROCESSING',
        description: `M-Pesa withdrawal to ${mpesaNumber}`,
        withdrawalMethod: 'MPESA',
        mpesaNumber,
        requiresReview,
      },
    })

    if (!requiresReview) {
      try {
        const mpesaResult = await mpesaService.initiateB2C(
          mpesaNumber,
          amount,
          `Yoyzie AI earnings payout - ${transaction.id}`,
          'Influencer earnings'
        )

        await prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: {
            status: 'PROCESSING',
            externalRef: mpesaResult.ConversationID,
          },
        })

        return {
          transaction,
          mpesaResult,
          message: 'M-Pesa transfer initiated. You will receive funds shortly.',
        }
      } catch (error: any) {
        // Reverse the balance deduction on failure
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: amount },
            pendingBalance: { decrement: amount },
          },
        })

        await prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            failureReason: error.message,
          },
        })

        throw new Error(`M-Pesa transfer failed: ${error.message}`)
      }
    }

    return {
      transaction,
      message: 'Withdrawal request submitted for finance review. Processing within 24 hours.',
    }
  }

  // ─── M-Pesa B2C Result Webhook ────────────────────────────────────

  async handleMpesaB2CResult(resultData: any) {
    const { Result } = resultData

    if (!Result) return

    const conversationId = Result.ConversationID
    const resultCode = Result.ResultCode
    const resultDesc = Result.ResultDesc

    const transaction = await prisma.walletTransaction.findFirst({
      where: { externalRef: conversationId },
    })

    if (!transaction) return

    if (resultCode === 0) {
      // Success
      const receiptNumber = Result.ResultParameters?.ResultParameter?.find(
        (p: any) => p.Key === 'TransactionReceipt'
      )?.Value

      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          mpesaReceiptNo: receiptNumber,
          processedAt: new Date(),
        },
      })

      await prisma.wallet.update({
        where: { id: transaction.walletId },
        data: {
          pendingBalance: { decrement: transaction.amount },
          totalWithdrawn: { increment: transaction.amount },
        },
      })
    } else {
      // Failed — reverse the balance
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          failureReason: resultDesc,
        },
      })

      await prisma.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: { increment: transaction.amount },
          pendingBalance: { decrement: transaction.amount },
        },
      })
    }
  }

  // ─── PayPal Withdrawal ────────────────────────────────────────────

  async withdrawPaypal(userId: string, input: WithdrawPaypalInput) {
    const { amount, paypalEmail } = input

    const wallet = await this.getOrCreateWallet(userId)

    if (wallet.balance < amount) {
      throw new Error(`Insufficient balance. Available: KES ${wallet.balance.toLocaleString()}`)
    }

    if (amount < 500) throw new Error('Minimum PayPal withdrawal is KES 500')

    const requiresReview = amount >= env.FINANCE_REVIEW_THRESHOLD

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amount },
        pendingBalance: { increment: amount },
      },
    })

    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'WITHDRAWAL',
        amount,
        fee: 0,
        netAmount: amount,
        status: requiresReview ? 'PENDING' : 'PROCESSING',
        description: `PayPal withdrawal to ${paypalEmail}`,
        withdrawalMethod: 'PAYPAL',
        paypalEmail,
        requiresReview,
      },
    })

    if (!requiresReview) {
      try {
        const paypalResult = await paypalService.sendPayout(
          paypalEmail,
          amount,
          'KES',
          'Yoyzie AI influencer earnings payout',
          transaction.id
        )

        await prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: {
            status: 'PROCESSING',
            paypalOrderId: paypalResult.batch_header?.payout_batch_id,
            processedAt: new Date(),
          },
        })

        return {
          transaction,
          message: 'PayPal transfer initiated. Funds arrive within 1-2 business days.',
        }
      } catch (error: any) {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: amount },
            pendingBalance: { decrement: amount },
          },
        })

        await prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED', failureReason: error.message },
        })

        throw new Error(`PayPal transfer failed: ${error.message}`)
      }
    }

    return {
      transaction,
      message: 'PayPal withdrawal submitted for finance review. Processing within 24 hours.',
    }
  }

  // ─── Bank Withdrawal ──────────────────────────────────────────────

  async withdrawBank(userId: string, input: WithdrawBankInput) {
    const { amount, bankName, accountNumber, accountName } = input

    const wallet = await this.getOrCreateWallet(userId)

    if (wallet.balance < amount) {
      throw new Error(`Insufficient balance. Available: KES ${wallet.balance.toLocaleString()}`)
    }

    if (amount < 1000) throw new Error('Minimum bank withdrawal is KES 1,000')

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amount },
        pendingBalance: { increment: amount },
      },
    })

    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'WITHDRAWAL',
        amount,
        fee: 0,
        netAmount: amount,
        status: 'PENDING',
        description: `Bank transfer to ${bankName} - ${accountNumber}`,
        withdrawalMethod: 'BANK',
        requiresReview: true,
        externalRef: `${bankName}|${accountNumber}|${accountName}`,
      },
    })

    return {
      transaction,
      message: 'Bank transfer request submitted. Processing within 2-3 business days.',
    }
  }

  // ─── Escrow ───────────────────────────────────────────────────────

  async holdEscrow(
    companyUserId: string,
    influencerId: string,
    campaignId: string,
    amount: number
  ) {
    const existing = await prisma.escrow.findUnique({ where: { campaignId } })
    if (existing) throw new Error('Escrow already exists for this campaign')

    const escrow = await prisma.escrow.create({
      data: {
        campaignId,
        companyUserId,
        influencerId,
        amount,
        status: 'HELD',
        transactionRef: `ESC_${campaignId}_${Date.now()}`,
      },
    })

    return escrow
  }

  async releaseEscrow(companyUserId: string, campaignId: string) {
    const escrow = await prisma.escrow.findUnique({ where: { campaignId } })

    if (!escrow) throw new Error('Escrow not found')
    if (escrow.companyUserId !== companyUserId) throw new Error('Unauthorized')
    if (escrow.status !== 'HELD') throw new Error('Escrow is not in held state')
    if (!escrow.influencerId) throw new Error('No influencer assigned to this escrow')

    await prisma.escrow.update({
      where: { campaignId },
      data: { status: 'RELEASED', releasedAt: new Date() },
    })

    // Credit influencer wallet
    const result = await this.creditWallet({
      userId: escrow.influencerId,
      amount: escrow.amount,
      campaignId,
      description: 'Campaign payment released from escrow',
    })

    return { escrow, result }
  }

  async refundEscrow(companyUserId: string, campaignId: string) {
    const escrow = await prisma.escrow.findUnique({ where: { campaignId } })

    if (!escrow) throw new Error('Escrow not found')
    if (escrow.companyUserId !== companyUserId) throw new Error('Unauthorized')
    if (escrow.status !== 'HELD') throw new Error('Escrow is not in held state')

    await prisma.escrow.update({
      where: { campaignId },
      data: { status: 'REFUNDED', refundedAt: new Date() },
    })

    return { message: 'Escrow refunded to company account', amount: escrow.amount }
  }

  // ─── Transaction History ──────────────────────────────────────────

  async getTransactions(userId: string, type?: string, page = 1, limit = 20) {
    const wallet = await this.getOrCreateWallet(userId)
    const skip = (page - 1) * limit
    const where: any = { walletId: wallet.id }
    if (type) where.type = type

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({ where }),
    ])

    return {
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async getEarningsStatement(userId: string, year: number, month?: number) {
    const wallet = await this.getOrCreateWallet(userId)

    const startDate = month
      ? new Date(year, month - 1, 1)
      : new Date(year, 0, 1)

    const endDate = month
      ? new Date(year, month, 0, 23, 59, 59)
      : new Date(year, 11, 31, 23, 59, 59)

    const transactions = await prisma.walletTransaction.findMany({
      where: {
        walletId: wallet.id,
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: 'asc' },
    })

    const totalEarned = transactions
      .filter((t) => t.type === 'CREDIT')
      .reduce((s, t) => s + t.netAmount, 0)

    const totalCommission = transactions
      .filter((t) => t.type === 'COMMISSION')
      .reduce((s, t) => s + t.amount, 0)

    const totalWithdrawn = transactions
      .filter((t) => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED')
      .reduce((s, t) => s + t.amount, 0)

    return {
      period: month ? `${year}-${String(month).padStart(2, '0')}` : String(year),
      summary: {
        totalEarned,
        totalCommission,
        totalWithdrawn,
        netEarnings: totalEarned - totalWithdrawn,
      },
      transactions,
    }
  }

  // ─── Wallet Settings ──────────────────────────────────────────────

  async updateSettings(userId: string, input: UpdateWalletSettingsInput) {
    const wallet = await this.getOrCreateWallet(userId)

    return prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        ...(input.mpesaNumber !== undefined && { mpesaNumber: input.mpesaNumber }),
        ...(input.paypalEmail !== undefined && { paypalEmail: input.paypalEmail }),
        ...(input.bankName !== undefined && { bankName: input.bankName }),
        ...(input.bankAccount !== undefined && { bankAccount: input.bankAccount }),
      },
    })
  }

  async getPendingWithdrawals(page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: {
          type: 'WITHDRAWAL',
          status: 'PENDING',
          requiresReview: true,
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({
        where: { type: 'WITHDRAWAL', status: 'PENDING', requiresReview: true },
      }),
    ])

    return {
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }
}
