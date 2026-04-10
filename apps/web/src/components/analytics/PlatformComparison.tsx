'use client'
import { useState } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', initial: 'IG', followers: 12441, impressions: 480000, engagement: 4.8, clicks: 5200, growth: 18, posts: 142 },
  { id: 'tiktok', label: 'TikTok', color: '#FF0050', initial: 'TT', followers: 8204, impressions: 620000, engagement: 7.2, clicks: 3800, growth: 24, posts: 89 },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', initial: 'IN', followers: 3109, impressions: 94000, engagement: 3.1, clicks: 2100, growth: 12, posts: 56 },
  { id: 'twitter', label: 'X / Twitter', color: '#1DA1F2', initial: 'X', followers: 5677, impressions: 210000, engagement: 2.4, clicks: 1748, growth: 6, posts: 210 },
]
const RADAR_DATA = [
  { metric: 'Reach', instagram: 85, tiktok: 92, linkedin: 45, twitter: 68 },
  { metric: 'Engagement', instagram: 72, tiktok: 94, linkedin: 58, twitter: 42 },
  { metric: 'Growth', instagram: 78, tiktok: 88, linkedin: 52, twitter: 34 },
  { metric: 'Clicks', instagram: 65, tiktok: 48, linkedin: 74, twitter: 56 },
  { metric: 'Consistency', instagram: 82, tiktok: 70, linkedin: 88, twitter: 76 },
  { metric: 'Virality', instagram: 68, tiktok: 96, linkedin: 32, twitter: 58 },
]
const METRICS = ['followers', 'impressions', 'engagement', 'clicks', 'growth', 'posts'] as const
const METRIC_LABELS: Record<string, string> = { followers: 'Followers', impressions: 'Impressions', engagement: 'Eng. rate', clicks: 'Link clicks', growth: 'Growth %', posts: 'Posts' }

export function PlatformComparison() {
  const [metric, setMetric] = useState<typeof METRICS[number]>('followers')
  const [activeRadar, setActiveRadar] = useState(['instagram', 'tiktok'])
  const sorted = [...PLATFORMS].sort((a, b) => (b[metric] as number) - (a[metric] as number))
  const max = Math.max(...PLATFORMS.map(p => p[metric] as number))
  return (
    <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-bold text-white">Platform comparison</h3>
          <p className="text-xs text-white/40 mt-0.5">Performance breakdown by network</p>
        </div>
      </div>
      <div className="flex overflow-x-auto border-b border-white/[0.06] px-3 gap-0">
        {METRICS.map(m => (
          <button key={m} onClick={() => setMetric(m)}
            className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${metric === m ? 'border-[#0066FF] text-[#0066FF]' : 'border-transparent text-white/40 hover:text-white/70'}`}>
            {METRIC_LABELS[m]}
          </button>
        ))}
      </div>
      <div className="p-5 space-y-3">
        {sorted.map((p, i) => {
          const val = p[metric] as number
          const pct = (val / max) * 100
          const formatted = metric === 'engagement' ? `${val}%` : metric === 'growth' ? `+${val}%` : val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(1)}K` : val.toString()
          return (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white" style={{ background: `${p.color}25`, border: `1px solid ${p.color}35` }}>{p.initial}</div>
                  <span className="text-sm text-white/70">{p.label}</span>
                  {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00D4AA]/15 text-[#00D4AA]">Top</span>}
                </div>
                <span className="text-sm font-bold text-white">{formatted}</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-2">
                <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: p.color }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-5 pb-5 border-t border-white/[0.06] pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-white/50">Radar comparison</p>
          <div className="flex gap-1.5">
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setActiveRadar(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white transition-all"
                style={{ background: activeRadar.includes(p.id) ? `${p.color}30` : 'rgba(255,255,255,0.05)', border: `1px solid ${activeRadar.includes(p.id) ? p.color : 'rgba(255,255,255,0.1)'}`, opacity: activeRadar.includes(p.id) ? 1 : 0.4 }}>
                {p.initial}
              </button>
            ))}
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
              {PLATFORMS.filter(p => activeRadar.includes(p.id)).map(p => (
                <Radar key={p.id} name={p.label} dataKey={p.id} stroke={p.color} fill={p.color} fillOpacity={0.12} strokeWidth={1.5} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
