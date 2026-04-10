import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import { MpesaBillingService } from './mpesa-billing.service'
import { PlansService } from './plans.service'
import { sendSubscriptionConfirmation, sendTrialExpiryWarning } from '../utils/email'
import { env } from '../config/env'
import { CreateSubscriptionInput, UpgradePlanInput, MpesaSTKCallbackBody } from '../types'

const prisma = new PrismaClient()
const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-03-25.dahlia' })
const mpesaService = new MpesaBillingService()
const plansService = new PlansService()

const TRIAL_DAYS_INDIVIDUAL = 7
const TRIAL_DAYS_BUSINESS = 10

export class BillingService {

  // ─── Get Current Subscription ─────────────────────────────────────

  async getSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    })

    return subscription
  }

  // ─── Start Free Trial ─────────────────────────────────────────────

  async startTrial(userId: string, planId: string, accountCategory: string) {
    const existing = await prisma.subscription.findUnique({ where: { userId } })
    if (existing) throw new Error('User already has a subscription')

    const plan = await plansService.getPlan(planId)

    const trialDays = accountCategory === 'BUSINESS'
      ? TRIAL_DAYS_BUSINESS
      : TRIAL_DAYS_INDIVIDUAL

    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        billingCycle: 'MONTHLY',
        status: 'TRIALING',
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndsAt,
        trialEndsAt,
        amount: plan.monthlyPrice,
      },
      include: { plan: true },
    })

    return subscription
  }

  // ─── Subscribe with M-Pesa ────────────────────────────────────────

  async subscribeWithMpesa(
    userId: string,
    userEmail: string,
    userName: string,
    input: CreateSubscriptionInput
  ) {
    const { planId, billingCycle, mpesaNumber } = input

    if (!mpesaNumber) throw new Error('M-Pesa number is required')

    const plan = await plansService.getPlan(planId)
    const amount = plansService.getPriceForCycle(plan, billingCycle)

    if (amount === 0) throw new Error('Cannot pay for a free plan')

    // Create pending invoice
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        amount,
        currency: 'KES',
        status: 'OPEN',
        paymentMethod: 'MPESA',
        description: `${plan.displayName} - ${billingCycle} subscription`,
      },
    })

    // Initiate STK Push
    const stkResult = await mpesaService.initiateSTKPush(
      mpesaNumber,
      amount,
      `YOYZIE-${invoice.id.slice(0, 8).toUpperCase()}`,
      `Yoyzie AI ${plan.displayName} Plan`
    )

    // Save checkout request ID for webhook matching
    await prisma.mpesaSTKCallback.create({
      data: {
        merchantRequestId: stkResult.MerchantRequestID,
        checkoutRequestId: stkResult.CheckoutRequestID,
        resultCode: -1, // Pending
        resultDesc: 'Pending',
        invoiceId: invoice.id,
      },
    })

    return {
      invoice,
      checkoutRequestId: stkResult.CheckoutRequestID,
      merchantRequestId: stkResult.MerchantRequestID,
      message: 'M-Pesa payment prompt sent. Enter your PIN to complete.',
    }
  }

  // ─── Handle M-Pesa STK Callback ───────────────────────────────────

  async handleMpesaCallback(body: MpesaSTKCallbackBody, userId?: string) {
    const { stkCallback } = body.Body
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback

    const existingCallback = await prisma.mpesaSTKCallback.findUnique({
      where: { checkoutRequestId: CheckoutRequestID },
    })

    const amount = CallbackMetadata?.Item?.find((i) => i.Name === 'Amount')?.Value as number
    const receiptNumber = CallbackMetadata?.Item?.find((i) => i.Name === 'MpesaReceiptNumber')?.Value as string
    const phone = CallbackMetadata?.Item?.find((i) => i.Name === 'PhoneNumber')?.Value as string

    await prisma.mpesaSTKCallback.upsert({
      where: { checkoutRequestId: CheckoutRequestID },
      update: {
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        amount,
        mpesaReceiptNumber: receiptNumber,
        phoneNumber: String(phone || ''),
      },
      create: {
        merchantRequestId: MerchantRequestID,
        checkoutRequestId: CheckoutRequestID,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        amount,
        mpesaReceiptNumber: receiptNumber,
        phoneNumber: String(phone || ''),
        invoiceId: existingCallback?.invoiceId,
      },
    })

    if (ResultCode === 0 && existingCallback?.invoiceId) {
      await prisma.invoice.update({
        where: { id: existingCallback.invoiceId },
        data: {
          status: 'PAID',
          mpesaReceiptNo: receiptNumber,
          paidAt: new Date(),
        },
      })
    }

    return { received: true }
  }

  // ─── Subscribe with Stripe ────────────────────────────────────────

  async subscribeWithStripe(
    userId: string,
    userEmail: string,
    userName: string,
    input: CreateSubscriptionInput
  ) {
    const { planId, billingCycle, stripePaymentMethodId } = input

    if (!stripePaymentMethodId) throw new Error('Stripe payment method ID is required')

    const plan = await plansService.getPlan(planId)
    const amount = plansService.getPriceForCycle(plan, billingCycle)

    if (amount === 0) throw new Error('Cannot pay for a free plan with Stripe')

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({ where: { userId } })
    let stripeCustomerId = subscription?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        name: userName,
        metadata: { userId },
      })
      stripeCustomerId = customer.id
    }

    // Attach payment method
    await stripe.paymentMethods.attach(stripePaymentMethodId, {
      customer: stripeCustomerId,
    })

    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: stripePaymentMethodId },
    })

    // Create payment intent for the subscription amount (KES)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'kes',
      customer: stripeCustomerId,
      payment_method: stripePaymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      metadata: { userId, planId, billingCycle },
    })

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment failed. Please try a different card.')
    }

    const cycleDays = plansService.getCycleDays(billingCycle)
    const periodEnd = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000)

    // Create or update subscription
    const updatedSubscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        planId,
        billingCycle: billingCycle as any,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        stripeCustomerId,
        amount,
      },
      create: {
        userId,
        planId,
        billingCycle: billingCycle as any,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        stripeCustomerId,
        amount,
      },
      include: { plan: true },
    })

    // Create invoice record
    await prisma.invoice.create({
      data: {
        userId,
        subscriptionId: updatedSubscription.id,
        amount,
        currency: 'KES',
        status: 'PAID',
        paymentMethod: 'STRIPE',
        paidAt: new Date(),
        periodStart: new Date(),
        periodEnd,
        description: `${plan.displayName} - ${billingCycle}`,
      },
    })

    await sendSubscriptionConfirmation(
      userEmail,
      userName,
      plan.displayName,
      amount,
      periodEnd
    )

    return { subscription: updatedSubscription }
  }

  // ─── Upgrade Plan ─────────────────────────────────────────────────

  async upgradePlan(
    userId: string,
    userEmail: string,
    userName: string,
    input: UpgradePlanInput
  ) {
    const existing = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    })

    if (!existing) throw new Error('No active subscription found')

    if (input.paymentMethod === 'MPESA') {
      return this.subscribeWithMpesa(userId, userEmail, userName, {
        planId: input.newPlanId,
        billingCycle: input.billingCycle,
        paymentMethod: 'MPESA',
        mpesaNumber: input.mpesaNumber,
      })
    }

    return this.subscribeWithStripe(userId, userEmail, userName, {
      planId: input.newPlanId,
      billingCycle: input.billingCycle,
      paymentMethod: 'STRIPE',
      stripePaymentMethodId: input.stripePaymentMethodId,
    })
  }

  // ─── Cancel Subscription ──────────────────────────────────────────

  async cancelSubscription(userId: string, reason?: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription) throw new Error('No subscription found')
    if (subscription.status === 'CANCELLED') throw new Error('Subscription already cancelled')

    const updated = await prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
        cancelReason: reason,
      },
      include: { plan: true },
    })

    return updated
  }

  // ─── Check Feature Access ─────────────────────────────────────────

  async checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    })

    if (!subscription || subscription.status === 'EXPIRED') return false

    const features = subscription.plan.features as Record<string, any>
    return !!features[feature]
  }

  // ─── Invoice History ──────────────────────────────────────────────

  async getInvoices(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where: { userId } }),
    ])

    return {
      invoices,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  // ─── Trial Expiry Check ───────────────────────────────────────────

  async checkTrialExpiry() {
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    const oneDayFromNow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)

    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: 'TRIALING',
        trialEndsAt: { lte: threeDaysFromNow, gte: new Date() },
      },
      include: { plan: true },
    })

    for (const sub of expiringSoon) {
      const daysLeft = Math.ceil(
        (sub.trialEndsAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      const user = await (prisma as any).user.findUnique({
        where: { id: sub.userId },
        select: { email: true, name: true },
      })

      if (user) {
        await sendTrialExpiryWarning(user.email, user.name, daysLeft, sub.plan.displayName)
      }
    }

    // Expire trials that have ended
    await prisma.subscription.updateMany({
      where: {
        status: 'TRIALING',
        trialEndsAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    })

    return { checked: expiringSoon.length }
  }

  // ─── Billing Overview (Admin) ─────────────────────────────────────

  async getBillingOverview() {
    const [
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      totalInvoices,
      paidInvoices,
    ] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'TRIALING' } }),
      prisma.invoice.count(),
      prisma.invoice.findMany({ where: { status: 'PAID' } }),
    ])

    const totalRevenue = paidInvoices.reduce((s, inv) => s + inv.amount, 0)

    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const mrr = paidInvoices
      .filter((inv) => inv.paidAt && inv.paidAt >= currentMonth)
      .reduce((s, inv) => s + inv.amount, 0)

    return {
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        trialing: trialSubscriptions,
      },
      revenue: {
        total: totalRevenue,
        mrr,
        arr: mrr * 12,
        totalInvoices,
        paidInvoices: paidInvoices.length,
      },
    }
  }
}
