'use client'
import { TrendingUp, TrendingDown, Users, Heart, Eye, MousePointerClick, Share2, BarChart3 } from 'lucide-react'

const STATS = [
  { label: 'Total Followers', value: '29,431', change: '+12.5%', trend: 'up', period: 'vs last month', icon: Users, color: '#0066FF', sparkline: [40,55,45,60,58,72,68,80,75,90,85,100] },
  { label: 'Total Engagement', value: '84,210', change: '+28.4%', trend: 'up', period: 'vs last month', icon: Heart, color: '#00D4AA', sparkline: [30,42,38,55,52,65,70,68,82,78,88,95] },
  { label: 'Impressions', value: '1.24M', change: '+8.2%', trend: 'up', period: 'vs last month', icon: Eye, color: '#A855F7', sparkline: [60,55,70,65,75,72,80,78,85,82,90,88] },
  { label: 'Link Clicks', value: '12,847', change: '-3.1%', trend: 'down', period: 'vs last month', icon: MousePointerClick, color: '#FF6B35', sparkline: [80,75,85,78,82,70,75,68,72,65,70,68] },
  { label: 'Shares', value: '3,291', change: '+41.2%', trend: 'up', period: 'vs last month', icon: Share2, color: '#F59E0B', sparkline: [20,30,25,40,38,55,52,65,70,80,85,95] },
  { label: 'Avg. Reach', value: '18,420', change: '+19.7%', trend: 'up', period: 'vs last month', icon: BarChart3, color: '#EC4899', sparkline: [35,45,40,58,55,65,62,75,72,82,80,90] },
]

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1
  const w = 80, h = 32
  const points = data.map((v, i) => `${(i/(data.length-1))*w},${h-((v-min)/range)*(h-4)}`).join(' ')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  )
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {STATS.map(stat => (
        <div key={stat.label} className="glass rounded-2xl p-4 border border-white/[0.06] feature-card cursor-default">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${stat.color}18`, color: stat.color }}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-[#00D4AA]' : 'text-red-400'}`}>
              {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {stat.change}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', color: stat.color }} className="text-xl font-bold mb-0.5">{stat.value}</div>
          <div className="text-xs text-white/40 mb-3">{stat.label}</div>
          <MiniSparkline data={stat.sparkline} color={stat.color} />
        </div>
      ))}
    </div>
  )
}
