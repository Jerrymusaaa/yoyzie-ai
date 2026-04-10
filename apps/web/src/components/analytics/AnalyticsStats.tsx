'use client'
import { TrendingUp, TrendingDown, Users, Heart, Eye, MousePointerClick, Share2, MessageCircle } from 'lucide-react'

const STATS = [
  { label: 'Total followers', value: '29,431', change: '+2,847', pct: '+10.7%', trend: 'up', icon: Users, color: '#0066FF', sparkline: [40,55,45,60,58,72,68,80,75,90,85,100] },
  { label: 'Total impressions', value: '1.24M', change: '+184K', pct: '+17.4%', trend: 'up', icon: Eye, color: '#00D4AA', sparkline: [60,55,70,65,75,72,80,78,85,82,90,88] },
  { label: 'Engagements', value: '84,210', change: '+18,420', pct: '+28.0%', trend: 'up', icon: Heart, color: '#A855F7', sparkline: [30,42,38,55,52,65,70,68,82,78,88,95] },
  { label: 'Link clicks', value: '12,847', change: '-412', pct: '-3.1%', trend: 'down', icon: MousePointerClick, color: '#FF6B35', sparkline: [80,75,85,78,82,70,75,68,72,65,70,68] },
  { label: 'Shares & reposts', value: '3,291', change: '+962', pct: '+41.3%', trend: 'up', icon: Share2, color: '#F59E0B', sparkline: [20,30,25,40,38,55,52,65,70,80,85,95] },
  { label: 'Comments', value: '6,184', change: '+1,024', pct: '+19.8%', trend: 'up', icon: MessageCircle, color: '#EC4899', sparkline: [35,45,40,58,55,65,62,75,72,82,80,90] },
]

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1
  const w = 80, h = 28
  const points = data.map((v, i) => `${(i/(data.length-1))*w},${h-((v-min)/range)*(h-4)}`).join(' ')
  return <svg width={w} height={h}><polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" /></svg>
}

export function AnalyticsStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {STATS.map(s => (
        <div key={s.label} className="glass rounded-2xl p-4 border border-white/[0.06] feature-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}><s.icon className="w-4 h-4" /></div>
            <div className={`flex items-center gap-1 text-xs font-medium ${s.trend === 'up' ? 'text-[#00D4AA]' : 'text-red-400'}`}>
              {s.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{s.pct}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', color: s.color }} className="text-xl font-bold mb-0.5">{s.value}</div>
          <div className="text-xs text-white/40 mb-2">{s.label}</div>
          <Sparkline data={s.sparkline} color={s.color} />
          <div className="text-[10px] text-white/25 mt-1">{s.change} vs last month</div>
        </div>
      ))}
    </div>
  )
}
