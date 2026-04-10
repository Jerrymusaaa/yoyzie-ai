export type AccountCategory = 'INDIVIDUAL' | 'INFLUENCER' | 'BUSINESS'

export type AccountType =
  | 'INDIVIDUAL_PRO'
  | 'CREATOR'
  | 'POWER_USER'
  | 'INFLUENCER_FREE'
  | 'INFLUENCER_STARTER'
  | 'INFLUENCER_PRO'
  | 'CREATOR_MODE'
  | 'SME'
  | 'GROWING_BUSINESS'
  | 'ENTERPRISE'

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DELETED'

export interface User {
  id: string
  email: string
  name: string
  accountCategory: AccountCategory
  accountType: AccountType
  status: UserStatus
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PublicUser {
  id: string
  name: string
  email: string
  accountCategory: AccountCategory
  accountType: AccountType
  emailVerified: boolean
}
