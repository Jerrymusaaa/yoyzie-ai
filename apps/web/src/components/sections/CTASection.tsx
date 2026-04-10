'use client'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[400px] rounded-full blur-[120px] opacity-15" style={{ background: 'radial-gradient(circle, #0066FF, #00D4AA)' }} />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Ready to transform<br />your social media?
        </h2>
        <p className="text-white/40 text-xl mb-10 max-w-lg mx-auto">
          Join 18,000+ teams using Yoyzie AI to grow their audience on autopilot.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="xl" className="rounded-2xl glow-blue gap-2">
              Start for free — no card needed <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Button size="xl" variant="outline" className="rounded-2xl">Book a demo</Button>
        </div>
        <p className="text-white/25 text-sm mt-6">Free plan includes 2 platforms · No credit card required · M-Pesa payments supported</p>
      </div>
    </section>
  )
}
