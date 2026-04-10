'use client'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { EngagementChart } from '@/components/dashboard/EngagementChart'
import { AIChatPanel } from '@/components/dashboard/AIChatPanel'
import { ScheduledPosts } from '@/components/dashboard/ScheduledPosts'
import { PlatformBreakdown } from '@/components/dashboard/PlatformBreakdown'
import { Sparkles, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuthStore()
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl sm:text-3xl font-bold text-white">
            Good morning, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">Here&apos;s what&apos;s happening across your social platforms today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl glass border border-[#00D4AA]/20">
            <TrendingUp className="w-4 h-4 text-[#00D4AA]" />
            <span className="text-xs text-white/60"><span className="text-[#00D4AA] font-medium">+28%</span> engagement this week</span>
          </div>
          <Link href="/dashboard/ai-chat">
            <Button size="sm" className="rounded-xl gap-2"><Sparkles className="w-4 h-4" />AI Insights</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-[#0066FF]/20 p-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.08), rgba(0,212,170,0.05))' }}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium">AI recommendation</p>
          <p className="text-xs text-white/50 mt-0.5 truncate">Your TikTok engagement peaks at 8PM EAT. You have no posts scheduled tonight — want me to create one?</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="text-xs text-white/40 hover:text-white transition-colors px-3 py-1.5">Dismiss</button>
          <Link href="/dashboard/content"><Button size="sm" className="rounded-xl text-xs">Create post</Button></Link>
        </div>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2"><EngagementChart /></div>
        <div className="xl:col-span-1"><PlatformBreakdown /></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 order-2 xl:order-1"><AIChatPanel /></div>
        <div className="xl:col-span-2 order-1 xl:order-2"><ScheduledPosts /></div>
      </div>
    </div>
  )
}
