export interface TokenPayload {
  userId: string
  email: string
  accountCategory: string
  accountType: string
}

export type AccountType =
  | 'INFLUENCER_FREE'
  | 'INFLUENCER_STARTER'
  | 'INFLUENCER_PRO'
  | 'CREATOR_MODE'

export interface WithdrawMpesaInput {
  amount: number
  mpesaNumber: string
}

export interface WithdrawPaypalInput {
  amount: number
  paypalEmail: string
}

export interface WithdrawBankInput {
  amount: number
  bankName: string
  accountNumber: string
  accountName: string
}

export interface CreditWalletInput {
  userId: string
  amount: number
  campaignId?: string
  description?: string
  accountType?: string
}

export interface UpdateWalletSettingsInput {
  mpesaNumber?: string
  paypalEmail?: string
  bankName?: string
  bankAccount?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
