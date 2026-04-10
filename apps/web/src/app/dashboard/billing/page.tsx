'use client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { billingApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, Check, Zap } from 'lucide-react'
import Link from 'next/link'

export default function BillingPage() {
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => billingApi.get('/api/v1/billing/subscription').then(r => r.data.data),
  })

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: () => billingApi.get('/api/v1/billing/plans').then(r => r.data.data),
  })

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => billingApi.get('/api/v1/billing/invoices').then(r => r.data.data),
  })

  const getStatusBadge = (status: string) => {
    const map: Record<string, any> = {
      ACTIVE: 'teal', TRIALING: 'blue', EXPIRED: 'red',
      CANCELLED: 'gray', PAST_DUE: 'orange',
    }
    return map[status] || 'gray'
  }

  const highlightPlans = plansData?.filter((p: any) =>
    ['individual_pro', 'creator', 'power_user', 'influencer_pro', 'creator_mode'].includes(p.name)
  ) || []

  return (
    <DashboardLayout title="Billing">
      <div className="space-y-6">
        {/* Current Plan */}
        {subscription && (
          <Card glow="blue">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <Badge variant={getStatusBadge(subscription.status)}>{subscription.status}</Badge>
            </CardHeader>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Plan</p>
                <p className="text-sm font-medium text-white">{subscription.plan?.displayName}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Amount</p>
                <p className="text-sm font-medium text-white">{formatCurrency(subscription.amount)}/mo</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Period End</p>
                <p className="text-sm font-medium text-white">{formatDate(subscription.currentPeriodEnd)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Billing</p>
                <p className="text-sm font-medium text-white">{subscription.billingCycle?.replace('_', ' ')}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Plans */}
        <div>
          <h2 className="font-display text-lg font-semibold text-white mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlightPlans.map((plan: any) => {
              const isCurrentPlan = subscription?.planId === plan.id
              const features = plan.features as Record<string, any>

              return (
                <Card key={plan.id} className={isCurrentPlan ? 'border-brand-blue/40' : ''}>
                  {isCurrentPlan && (
                    <div className="mb-3">
                      <Badge variant="blue">Current Plan</Badge>
                    </div>
                  )}
                  <h3 className="font-display font-bold text-white mb-1">{plan.displayName}</h3>
                  <p className="text-2xl font-bold text-brand-blue mb-1">
                    {formatCurrency(plan.monthlyPrice)}
                    <span className="text-sm text-white/40 font-normal">/mo</span>
                  </p>
                  <p className="text-xs text-brand-teal mb-4">
                    Save 25% with annual billing
                  </p>
                  <div className="space-y-2 mb-4">
                    {Object.entries(features).slice(0, 5).map(([key, val]) => (
                      val && (
                        <div key={key} className="flex items-center gap-2 text-sm text-white/70">
                          <Check size={13} className="text-brand-teal shrink-0" />
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      )
                    ))}
                  </div>
                  {!isCurrentPlan && (
                    <Button variant="secondary" size="sm" className="w-full">
                      <Zap size={13} />
                      Upgrade
                    </Button>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* Invoices */}
        {invoices?.invoices?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {invoices.invoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/3">
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-white/40" />
                    <div>
                      <p className="text-sm text-white/80">{inv.description || 'Subscription'}</p>
                      <p className="text-xs text-white/40">{formatDate(inv.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">{formatCurrency(inv.amount)}</span>
                    <Badge variant={inv.status === 'PAID' ? 'teal' : 'orange'}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
