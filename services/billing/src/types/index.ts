export interface TokenPayload {
  userId: string
  email: string
  accountCategory: string
  accountType: string
}

export type BillingCycle = 'MONTHLY' | 'THREE_MONTH' | 'SIX_MONTH' | 'ANNUAL'

export interface CreateSubscriptionInput {
  planId: string
  billingCycle: BillingCycle
  paymentMethod: 'MPESA' | 'STRIPE'
  mpesaNumber?: string
  stripePaymentMethodId?: string
}

export interface UpgradePlanInput {
  newPlanId: string
  billingCycle: BillingCycle
  paymentMethod: 'MPESA' | 'STRIPE'
  mpesaNumber?: string
  stripePaymentMethodId?: string
}

export interface MpesaSTKCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value?: string | number }>
      }
    }
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}
