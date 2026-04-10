'use client'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Play, TrendingUp, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'

const PLATFORMS = [
  { name: 'Instagram', color: '#E1306C', initial: 'IG' },
  { name: 'TikTok', color: '#FF0050', initial: 'TT' },
  { name: 'LinkedIn', color: '#0A66C2', initial: 'IN' },
  { name: 'X', color: '#1DA1F2', initial: 'X' },
  { name: 'YouTube', color: '#FF0000', initial: 'YT' },
  { name: 'Facebook', color: '#1877F2', initial: 'FB' },
  { name: 'Pinterest', color: '#E60023', initial: 'PT' },
  { name: 'Threads', color: '#000000', initial: 'TH' },
]

const METRICS = [
  { label: 'Posts Scheduled', value: '2.4M+', icon: <BarChart3 className="w-4 h-4" />, color: '#0066FF' },
  { label: 'Active Users', value: '18K+', icon: <Users className="w-4 h-4" />, color: '#00D4AA' },
  { label: 'Avg. Engagement Lift', value: '+340%', icon: <TrendingUp className="w-4 h-4" />, color: '#FF6B35' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 grid-pattern opacity-100" />
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: 'radial-gradient(circle, #0066FF, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-15" style={{ background: 'radial-gradient(circle, #00D4AA, transparent)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[#0066FF]/20 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4AA]" />
            </span>
            <span className="text-sm text-white/70">Now supporting 23+ social platforms</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-6 max-w-5xl mx-auto">
            Kenya&apos;s AI Social<br />
            <span className="text-gradient">Media Command</span><br />
            Center
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            One conversational AI that plans campaigns, creates content, schedules posts, and analyzes performance across every platform — built for the Kenyan market.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <Button size="xl" className="rounded-2xl px-8 gap-2 glow-blue">
                Start for free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <button className="group flex items-center gap-3 px-6 py-4 text-white/60 hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                <Play className="w-4 h-4 ml-0.5" />
              </div>
              <span className="text-sm font-medium">Watch 2 min demo</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-12">
            {PLATFORMS.map((p, i) => (
              <div key={p.name} className="platform-badge w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg"
                style={{ background: p.color === '#FF0050' || p.color === '#000000' ? 'rgba(255,255,255,0.1)' : `${p.color}20`, border: `1px solid ${p.color}30`, animationDelay: `${i * 0.05}s` }}
                title={p.name}>
                {p.initial}
              </div>
            ))}
            <span className="text-white/30 text-sm ml-1">+15 more</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
            {METRICS.map((m, i) => (
              <div key={m.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${m.color}20`, color: m.color }}>{m.icon}</div>
                <div className="text-left">
                  <div style={{ fontFamily: 'var(--font-display)', color: m.color }} className="text-xl font-bold">{m.value}</div>
                  <div className="text-xs text-white/40">{m.label}</div>
                </div>
                {i < METRICS.length - 1 && <div className="hidden sm:block w-px h-8 bg-white/10 ml-8" />}
              </div>
            ))}
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-30" style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.3), rgba(0,212,170,0.2))' }} />
          <div className="relative glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 bg-white/[0.06] rounded-md px-3 py-1 text-xs text-white/30 text-center">
                app.yoyzie.ai/dashboard
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[420px] lg:h-[520px] overflow-hidden bg-[#0A1020]">
              <DashboardPreview />
            </div>
          </div>
          <div className="absolute -left-6 top-1/3 glass rounded-xl p-3 border border-white/10 float hidden lg:block">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#00D4AA] pulse-dot" />
              <span className="text-xs text-white/60">AI generating...</span>
            </div>
            <p className="text-xs text-white font-medium w-32">&ldquo;Create 5 variations for Instagram Reels&rdquo;</p>
          </div>
          <div className="absolute -right-6 bottom-1/3 glass rounded-xl p-3 border border-[#0066FF]/20 float-delayed hidden lg:block">
            <div className="text-xs text-white/50 mb-1">Engagement rate</div>
            <div style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-bold text-[#00D4AA]">+127%</div>
            <div className="text-xs text-white/30">vs last month</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardPreview() {
  return (
    <div className="p-6 h-full flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Reach', value: '284K', color: '#0066FF' },
          { label: 'Engagement', value: '8.4%', color: '#00D4AA' },
          { label: 'Followers', value: '+2.1K', color: '#FF6B35' },
          { label: 'Posts', value: '47', color: '#A855F7' },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-xl p-3 border border-white/[0.06]">
            <div className="text-xs text-white/40 mb-1">{stat.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', color: stat.color }} className="text-xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 glass rounded-xl border border-white/[0.06] p-4">
        <div className="text-xs text-white/40 mb-3">Engagement over time</div>
        <div className="flex items-end gap-2 h-24">
          {[40, 65, 45, 80, 60, 90, 70, 85, 75, 95, 80, 100].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i === 11 ? '#0066FF' : 'rgba(0,102,255,0.3)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
