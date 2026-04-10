import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: '#070D1A' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: '#050A14' }}>
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(0,102,255,0.15) 0%, transparent 60%)' }} />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)' }} className="text-white font-bold text-xl">
              Yoyzie <span className="text-[#0066FF]">AI.</span>
            </span>
          </Link>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl font-bold text-white mb-4 leading-tight">
              Kenya&apos;s #1 AI Social Media Platform
            </h2>
            <p className="text-white/40 text-lg mb-8">Manage all your social accounts, create content, and grow your audience with AI — built for the Kenyan market.</p>
            <div className="space-y-3">
              {[
                { icon: '📊', text: 'Real-time analytics across all platforms' },
                { icon: '🤖', text: 'AI content generation in English, Swahili & Sheng' },
                { icon: '💰', text: 'M-Pesa payments & instant influencer payouts' },
                { icon: '🎯', text: 'Kenyan influencer marketplace with bot detection' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-white/60 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {[
              { value: '18K+', label: 'Active users' },
              { value: '2.4M+', label: 'Posts scheduled' },
              { value: '+340%', label: 'Avg engagement lift' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontFamily: 'var(--font-display)', color: '#0066FF' }} className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-white/30">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)' }} className="text-white font-bold text-lg">
              Yoyzie <span className="text-[#0066FF]">AI.</span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
