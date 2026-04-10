'use client'
import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const DATA = [
  { date: 'Mar 1', instagram: 4200, tiktok: 2800, linkedin: 1200, twitter: 900 },
  { date: 'Mar 5', instagram: 5100, tiktok: 3400, linkedin: 1450, twitter: 1100 },
  { date: 'Mar 10', instagram: 4800, tiktok: 5200, linkedin: 1300, twitter: 980 },
  { date: 'Mar 15', instagram: 6200, tiktok: 4800, linkedin: 1800, twitter: 1400 },
  { date: 'Mar 20', instagram: 7100, tiktok: 6300, linkedin: 2100, twitter: 1650 },
  { date: 'Mar 25', instagram: 6800, tiktok: 7200, linkedin: 1950, twitter: 1800 },
  { date: 'Apr 1', instagram: 8400, tiktok: 7800, linkedin: 2400, twitter: 2100 },
  { date: 'Apr 5', instagram: 9200, tiktok: 8100, linkedin: 2650, twitter: 2300 },
  { date: 'Apr 10', instagram: 8800, tiktok: 9400, linkedin: 2500, twitter: 2150 },
  { date: 'Apr 15', instagram: 10400, tiktok: 9800, linkedin: 3100, twitter: 2600 },
  { date: 'Apr 18', instagram: 11200, tiktok: 10500, linkedin: 3400, twitter: 2900 },
]

const RANGES = ['7D', '30D', '90D', '1Y']
const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', color: '#E1306C' },
  { key: 'tiktok', label: 'TikTok', color: '#FF0050' },
  { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { key: 'twitter', label: 'X / Twitter', color: '#1DA1F2' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 p-3 shadow-xl text-xs" style={{ background: '#0D1525' }}>
      <p className="text-white/50 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60">{p.name}:</span>
          <span className="text-white font-medium">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export function EngagementChart() {
  const [range, setRange] = useState('30D')
  const [activePlatforms, setActivePlatforms] = useState(PLATFORMS.map(p => p.key))

  const togglePlatform = (key: string) =>
    setActivePlatforms(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  return (
    <div className="glass rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-bold text-white">Engagement Overview</h3>
          <p className="text-xs text-white/40 mt-0.5">Likes, comments & shares across platforms</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            {PLATFORMS.map(p => (
              <button key={p.key} onClick={() => togglePlatform(p.key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border"
                style={activePlatforms.includes(p.key)
                  ? { background: `${p.color}25`, borderColor: `${p.color}40`, color: p.color }
                  : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: activePlatforms.includes(p.key) ? p.color : '#ffffff30' }} />
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-white/[0.04] rounded-xl border border-white/[0.06] p-1 gap-0.5">
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${range === r ? 'bg-[#0066FF] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="h-52 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              {PLATFORMS.map(p => (
                <linearGradient key={p.key} id={`grad-${p.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={p.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={p.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
            <Tooltip content={<CustomTooltip />} />
            {PLATFORMS.map(p => activePlatforms.includes(p.key) && (
              <Area key={p.key} type="monotone" dataKey={p.key} name={p.label}
                stroke={p.color} strokeWidth={2} fill={`url(#grad-${p.key})`}
                dot={false} activeDot={{ r: 4, fill: p.color, strokeWidth: 0 }} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
