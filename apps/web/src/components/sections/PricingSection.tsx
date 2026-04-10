'use client'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'For individuals getting started',
    color: '#888888',
    features: ['2 social platforms', '30 scheduled posts/month', 'Basic analytics', 'AI captions (50/month)', 'Email support'],
    cta: 'Start free',
    variant: 'outline' as const,
  },
  {
    name: 'Individual Pro',
    price: { monthly: 1999, annual: 1499 },
    description: 'For solo creators & bloggers',
    color: '#0066FF',
    popular: true,
    features: ['5 social platforms', 'Unlimited scheduled posts', 'Full analytics suite', 'AI captions (unlimited)', 'Kenyan trend detection', 'Priority support'],
    cta: 'Start Pro trial',
    variant: 'primary' as const,
  },
  {
    name: 'Creator Mode',
    price: { monthly: 9999, annual: 7499 },
    description: 'For power influencers',
    color: '#00D4AA',
    features: ['All platforms', 'Influencer marketplace', 'Bot detection reports', '10% commission rate', 'Instant M-Pesa payouts', 'Verified badge', 'Dedicated support'],
    cta: 'Start Creator trial',
    variant: 'secondary' as const,
  },
  {
    name: 'Enterprise',
    price: { monthly: null, annual: null },
    description: 'For large organizations',
    color: '#A855F7',
    features: ['Unlimited everything', 'Custom integrations', 'Unlimited team seats', 'White-label option', 'Custom AI training', 'SLA guarantee', 'Dedicated infrastructure'],
    cta: 'Contact sales',
    variant: 'outline' as const,
  },
]

export function PricingSection() {
  const [annual, setAnnual] = useState(true)
  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, transparent<br /><span className="text-gradient">pricing in KES</span>
          </h2>
          <p className="text-white/40 text-lg mb-8">Start free, scale as you grow. No hidden fees.</p>
          <div className="inline-flex items-center gap-4 glass rounded-full px-2 py-2 border border-white/10">
            <button onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? 'bg-white/10 text-white' : 'text-white/40'}`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${annual ? 'bg-white/10 text-white' : 'text-white/40'}`}>
              Annual
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#00D4AA]/20 text-[#00D4AA]">Save 25%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map(plan => (
            <div key={plan.name} className={`relative glass rounded-2xl p-6 border feature-card flex flex-col ${plan.popular ? 'border-[#0066FF]/40 shadow-lg shadow-blue-500/10' : 'border-white/[0.06]'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#0066FF] text-white text-xs font-medium">Most popular</div>
              )}
              <div className="mb-5">
                <div className="text-sm font-medium mb-1" style={{ color: plan.color }}>{plan.name}</div>
                <div className="text-xs text-white/40 mb-4">{plan.description}</div>
                <div style={{ fontFamily: 'var(--font-display)' }} className="text-4xl font-bold text-white">
                  {plan.price.monthly === null ? <span className="text-2xl">Custom</span>
                    : plan.price.monthly === 0 ? 'Free'
                    : <>KES {(annual ? plan.price.annual : plan.price.monthly)?.toLocaleString()}<span className="text-base font-normal text-white/40">/mo</span></>}
                </div>
                {annual && plan.price.monthly !== null && plan.price.monthly > 0 && (
                  <div className="text-xs text-white/30 mt-1">billed annually</div>
                )}
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button variant={plan.variant} size="md" className="w-full rounded-xl">{plan.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
