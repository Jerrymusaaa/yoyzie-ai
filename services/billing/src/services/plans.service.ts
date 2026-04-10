import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PLANS = [
  {
    name: 'free',
    displayName: 'Free',
    accountType: 'INDIVIDUAL_PRO',
    monthlyPrice: 0,
    threeMonthPrice: 0,
    sixMonthPrice: 0,
    annualPrice: 0,
    maxSocialAccounts: 2,
    maxTeamMembers: 1,
    maxBrandProfiles: 1,
    aiRequestsPerDay: 5,
    features: {
      aiCaptions: true,
      scheduling: true,
      analytics: false,
      influencerMarketplace: false,
      botDetection: false,
      teamManagement: false,
      apiAccess: false,
    },
  },
  {
    name: 'individual_pro',
    displayName: 'Individual Pro',
    accountType: 'INDIVIDUAL_PRO',
    monthlyPrice: 1999,
    threeMonthPrice: 5397,
    sixMonthPrice: 10194,
    annualPrice: 17991,
    maxSocialAccounts: 3,
    maxTeamMembers: 1,
    maxBrandProfiles: 1,
    aiRequestsPerDay: 50,
    features: {
      aiCaptions: true,
      scheduling: true,
      analytics: true,
      influencerMarketplace: false,
      botDetection: false,
      teamManagement: false,
      apiAccess: false,
    },
  },
  {
    name: 'creator',
    displayName: 'Creator',
    accountType: 'CREATOR',
    monthlyPrice: 4999,
    threeMonthPrice: 13497,
    sixMonthPrice: 25494,
    annualPrice: 44991,
    maxSocialAccounts: 5,
    maxTeamMembers: 1,
    maxBrandProfiles: 3,
    aiRequestsPerDay: 100,
    features: {
      aiCaptions: true,
      scheduling: true,
      analytics: true,
      competitorBenchmarking: true,
      influencerMarketplace: true,
      botDetection: false,
      teamManagement: false,
      apiAccess: false,
    },
  },
  {
    name: 'power_user',
    displayName: 'Power User',
    accountType: 'POWER_USER',
    monthlyPrice: 9999,
    threeMonthPrice: 26997,
    sixMonthPrice: 50994,
    annualPrice: 89991,
    maxSocialAccounts: 10,
    maxTeamMembers: 1,
    maxBrandProfiles: 5,
    aiRequestsPerDay: 200,
    features: {
      aiCaptions: true,
      scheduling: true,
      analytics: true,
      competitorBenchmarking: true,
      influencerMarketplace: true,
      botDetection: true,
      campaignMarketplace: true,
      teamManagement: false,
      apiAccess: false,
    },
  },
  {
    name: 'influencer_free',
    displayName: 'Influencer Free',
    accountType: 'INFLUENCER_FREE',
    monthlyPrice: 0,
    threeMonthPrice: 0,
    sixMonthPrice: 0,
    annualPrice: 0,
    maxSocialAccounts: 2,
    maxTeamMembers: 1,
    maxBrandProfiles: 1,
    aiRequestsPerDay: 10,
    features: {
      aiCaptions: true,
      scheduling: true,
      analytics: true,
      campaignMarketplace: true,
      wallet: true,
      commissionRate: 25,
    },
  },
  {
    name: 'influencer_starter',
    displayName: 'Influencer Starter',
    accountType: 'INFLUENCER_STARTER',
    monthlyPrice: 1999,
    threeMonthPrice: 5397,
    sixMonthPrice: 10194,
    annualPrice: 17991,
    maxSocialAccounts: 3,
    maxTeamMembers: 1,
    maxBrandProfiles: 1,
    aiRequestsPerDay: 30,
    features: {
      aiCaptions: true,
      scheduling: true,
      analytics: true,
      campaignMarketplace: true,
      wallet: true,
      commissionRate: 20,
      priorityListing: true,
    },
  },
  {
    name: 'influencer_pro',
    displayName: 'Influencer Pro',
    accountType: 'INFLUENCER_PRO',
    monthlyPrice: 4999,
    threeMonthPrice: 13497,
    sixMonthPrice: 25494,
    annualPrice: 44991,
    maxSocialAccounts: 5,
    maxTeamMembers: 1,
    maxBrandProfiles: 2,
    aiRequestsPerDay: 100,
    features: {
      aiCaptions: true,
      scheduling: true,
      analytics: true,
      campaignMarketplace: true,
      wallet: true,
      commissionRate: 15,
      priorityListing: true,
      verifiedBadge: true,
      botDetectionReport: true,
    },
  },
  {
    name: 'creator_mode',
    displayName: 'Creator Mode',
    accountType: 'CREATOR_MODE',
    monthlyPrice: 9999,
    threeMonthPrice: 26997,
    sixMonthPrice: 50994,
    annualPrice: 89991,
    maxSocialAccounts: 10,
    maxTeamMembers: 1,
    maxBrandProfiles: 3,
    aiRequestsPerDay: 200,
    features: {
      aiCaptions: true,
      scheduling: true,
      analytics: true,
      campaignMarketplace: true,
      wallet: true,
      commissionRate: 10,
      priorityListing: true,
      verifiedBadge: true,
      botDetectionReport: true,
      instantPayout: true,
      dedicatedSupport: true,
    },
  },
  {
    name: 'sme',
    displayName: 'SME / Small Business',
    accountType: 'SME',
    monthlyPrice: 9999,
    threeMonthPrice: 26997,
    sixMonthPrice: 50994,
    annualPrice: 89991,
    maxSocialAccounts: 5,
    maxTeamMembers: 3,
    maxBrandProfiles: 3,
    aiRequestsPerDay: 200,
    features: {
      aiCaptions: true,
      scheduling: true,
      analytics: true,
      influencerMarketplace: true,
      botDetection: true,
      campaignMarketplace: true,
      teamManagement: true,
      apiAccess: false,
    },
  },
  {
    name: 'growing_business_base',
    displayName: 'Growing Business (Base)',
    accountType: 'GROWING_BUSINESS',
    monthlyPrice: 29000,
    threeMonthPrice: 78300,
    sixMonthPrice: 147900,
    annualPrice: 261000,
    maxSocialAccounts: 15,
    maxTeamMembers: 10,
    maxBrandProfiles: 15,
    aiRequestsPerDay: 500,
    features: {
      aiCaptions: true,
      scheduling: true,
      analytics: true,
      influencerMarketplace: true,
      botDetection: true,
      campaignMarketplace: true,
      teamManagement: true,
      multiBrand: true,
      apiAccess: true,
    },
  },
  {
    name: 'enterprise_base',
    displayName: 'Enterprise (Base)',
    accountType: 'ENTERPRISE',
    monthlyPrice: 80000,
    threeMonthPrice: 216000,
    sixMonthPrice: 408000,
    annualPrice: 720000,
    maxSocialAccounts: 50,
    maxTeamMembers: 50,
    maxBrandProfiles: 50,
    aiRequestsPerDay: 2000,
    features: {
      aiCaptions: true,
      scheduling: true,
      analytics: true,
      influencerMarketplace: true,
      botDetection: true,
      campaignMarketplace: true,
      teamManagement: true,
      multiBrand: true,
      apiAccess: true,
      whiteLabel: true,
      customAITraining: true,
      dedicatedInfrastructure: true,
      quarterlyStrategy: true,
    },
  },
]

export class PlansService {

  async seedPlans() {
    for (const plan of PLANS) {
      await prisma.plan.upsert({
        where: { name: plan.name },
        update: plan,
        create: plan,
      })
    }
    return { message: `${PLANS.length} plans seeded successfully` }
  }

  async getAllPlans(accountCategory?: string) {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: 'asc' },
    })

    return plans
  }

  async getPlan(planId: string) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan) throw new Error('Plan not found')
    return plan
  }

  async getPlanByName(name: string) {
    const plan = await prisma.plan.findUnique({ where: { name } })
    if (!plan) throw new Error('Plan not found')
    return plan
  }

  getPriceForCycle(plan: any, cycle: string): number {
    const prices: Record<string, number> = {
      MONTHLY: plan.monthlyPrice,
      THREE_MONTH: plan.threeMonthPrice,
      SIX_MONTH: plan.sixMonthPrice,
      ANNUAL: plan.annualPrice,
    }
    return prices[cycle] ?? plan.monthlyPrice
  }

  getCycleDays(cycle: string): number {
    const days: Record<string, number> = {
      MONTHLY: 30,
      THREE_MONTH: 90,
      SIX_MONTH: 180,
      ANNUAL: 365,
    }
    return days[cycle] ?? 30
  }
}
