'use client'
import { useState } from 'react'
import { Calendar, Download, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AnalyticsStats } from '@/components/analytics/AnalyticsStats'
import { EngagementOverTime } from '@/components/analytics/EngagementOverTime'
import { PlatformComparison } from '@/components/analytics/PlatformComparison'
import { TopPosts } from '@/components/analytics/TopPosts'
import { AudienceDemographics } from '@/components/analytics/AudienceDemographics'
import { ContentBreakdown } from '@/components/analytics/ContentBreakdown'
import { ReportGenerator } from '@/components/analytics/ReportGenerator'

const DATE_RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 6 months', 'Last year']

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('Last 30 days')
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl sm:text-3xl font-bold text-white">Analytics</h1>
          <p className="text-white/40 text-sm mt-1">Performance insights across all your connected platforms</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/[0.06]">
            <Calendar className="w-4 h-4 text-white/40" />
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="bg-transparent text-sm text-white/70 outline-none cursor-pointer">
              {DATE_RANGES.map(r => <option key={r} value={r} className="bg-[#0D1525]">{r}</option>)}
            </select>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/[0.06] text-xs text-white/50 hover:text-white transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <Button size="sm" className="rounded-xl gap-2"><Sparkles className="w-4 h-4" /> AI Summary</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#A855F7]/20 p-4 flex items-start gap-4" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(0,102,255,0.06))' }}>
        <div className="w-9 h-9 rounded-xl bg-[#A855F7]/20 border border-[#A855F7]/30 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#A855F7]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white mb-1">AI monthly summary</p>
          <p className="text-xs text-white/50 leading-relaxed">
            Your best month yet — overall engagement is up <span className="text-white font-medium">28%</span> vs March. TikTok drove the most growth with <span className="text-white font-medium">+24% followers</span>. Your top content format is short-form video at <span className="text-white font-medium">8.4% engagement rate</span>.
          </p>
        </div>
        <button className="text-xs text-white/30 hover:text-white transition-colors flex-shrink-0">Full report →</button>
      </div>

      <AnalyticsStats />
      <EngagementOverTime />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PlatformComparison />
        <AudienceDemographics />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2"><ContentBreakdown /></div>
        <div className="xl:col-span-1"><ReportGenerator /></div>
      </div>

      <TopPosts />
    </div>
  )
}
