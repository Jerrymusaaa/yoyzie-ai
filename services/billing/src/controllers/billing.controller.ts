import { Request, Response } from 'express'
import { BillingService } from '../services/billing.service'
import { PlansService } from '../services/plans.service'
import { sendSuccess, sendError } from '../utils/response'

const billingService = new BillingService()
const plansService = new PlansService()

export class BillingController {

  async getPlans(req: Request, res: Response) {
    try {
      const accountCategory = req.query.category as string | undefined
      const plans = await plansService.getAllPlans(accountCategory)
      return sendSuccess(res, 'Plans fetched', plans)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async seedPlans(req: Request, res: Response) {
    try {
      const result = await plansService.seedPlans()
      return sendSuccess(res, result.message)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getSubscription(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const subscription = await billingService.getSubscription(userId)
      return sendSuccess(res, 'Subscription fetched', subscription)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async startTrial(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { planId } = req.body
      const accountCategory = req.user.accountCategory

      if (!planId) return sendError(res, 'planId is required')

      const subscription = await billingService.startTrial(userId, planId, accountCategory)
      return sendSuccess(res, 'Trial started successfully', subscription, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async subscribeMpesa(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { planId, billingCycle, mpesaNumber } = req.body

      if (!planId || !billingCycle || !mpesaNumber) {
        return sendError(res, 'planId, billingCycle, and mpesaNumber are required')
      }

      const result = await billingService.subscribeWithMpesa(
        userId,
        req.user.email,
        req.user.name || 'User',
        { planId, billingCycle, paymentMethod: 'MPESA', mpesaNumber }
      )

      return sendSuccess(res, result.message, result, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async subscribeStripe(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { planId, billingCycle, stripePaymentMethodId } = req.body

      if (!planId || !billingCycle || !stripePaymentMethodId) {
        return sendError(res, 'planId, billingCycle, and stripePaymentMethodId are required')
      }

      const result = await billingService.subscribeWithStripe(
        userId,
        req.user.email,
        req.user.name || 'User',
        { planId, billingCycle, paymentMethod: 'STRIPE', stripePaymentMethodId }
      )

      return sendSuccess(res, 'Subscription activated successfully', result, 201)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async upgradePlan(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { newPlanId, billingCycle, paymentMethod, mpesaNumber, stripePaymentMethodId } = req.body

      if (!newPlanId || !billingCycle || !paymentMethod) {
        return sendError(res, 'newPlanId, billingCycle, and paymentMethod are required')
      }

      const result = await billingService.upgradePlan(
        userId,
        req.user.email,
        req.user.name || 'User',
        { newPlanId, billingCycle, paymentMethod, mpesaNumber, stripePaymentMethodId }
      )

      return sendSuccess(res, 'Plan upgrade initiated', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async cancelSubscription(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const { reason } = req.body
      const result = await billingService.cancelSubscription(userId, reason)
      return sendSuccess(res, 'Subscription will cancel at end of period', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getInvoices(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const result = await billingService.getInvoices(userId, page, limit)
      return sendSuccess(res, 'Invoices fetched', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async checkFeatureAccess(req: Request, res: Response) {
    try {
      const userId = req.user.userId
      const feature = req.params.feature as string
      const hasAccess = await billingService.checkFeatureAccess(userId, feature)
      return sendSuccess(res, 'Feature access checked', { feature, hasAccess })
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async mpesaCallback(req: Request, res: Response) {
    try {
      await billingService.handleMpesaCallback(req.body)
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    } catch (error: any) {
      return res.json({ ResultCode: 1, ResultDesc: error.message })
    }
  }

  async checkTrialExpiry(req: Request, res: Response) {
    try {
      const result = await billingService.checkTrialExpiry()
      return sendSuccess(res, 'Trial expiry check complete', result)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }

  async getBillingOverview(req: Request, res: Response) {
    try {
      const overview = await billingService.getBillingOverview()
      return sendSuccess(res, 'Billing overview fetched', overview)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }
}
