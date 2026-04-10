'use client'
import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const RANGES = ['7D', '30D', '90D', '6M', '1Y']
const DATA = [
  { date: 'Mar 1', followers: 26584, impressions: 84000, engagements: 5200 },
  { date: 'Mar 5', followers: 26900, impressions: 92000, engagements: 6100 },
  { date: 'Mar 10', followers: 27200, impressions: 88000, engagements: 5800 },
  { date: 'Mar 15', followers: 27800, impressions: 110000, engagements: 7400 },
  { date: 'Mar 20', followers: 28200, impressions: 124000, engagements: 8200 },
  { date: 'Mar 25', followers: 28700, impressions: 118000, engagements: 7800 },
  { date: 'Apr 1', followers: 29100, impressions: 142000, engagements: 9400 },
  { date: 'Apr 5', followers: 29280, impressions: 138000, engagements: 9100 },
  { date: 'Apr 10', followers: 29350, impressions: 151000, engagements: 9800 },
  { date: 'Apr 15', followers: 29400, impressions: 168000, engagements: 10400 },
  { date: 'Apr 18', followers: 29431, impressions: 174000, engagements: 11200 },
]
const METRICS = [
  { key: 'followers', label: 'Followers', color: '#0066FF' },
  { key: 'impressions', label: 'Impressions', color: '#00D4AA' },
  { key: 'engagements', label: 'Engagements', color: '#A855F7' },
]
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 p-3 shadow-xl text-xs" style={{ background: '#0D1525' }}>
      <p className="text-white/50 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.stroke }} />
          <span className="text-white/60 capitalize">{p.name}:</span>
          <span className="text-white font-medium">{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
export function EngagementOverTime() {
  const [range, setRange] = useState('30D')
  const [active, setActive] = useState(METRICS.map(m => m.key))
  const toggle = (key: string) => setActive(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  return (
    <div className="glass rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-bold text-white">Growth over time</h3>
          <p className="text-xs text-white/40 mt-0.5">Followers, impressions and engagements</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {METRICS.map(m => (
              <button key={m.key} onClick={() => toggle(m.key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border"
                style={active.includes(m.key) ? { background: `${m.color}20`, borderColor: `${m.color}40`, color: m.color } : { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: active.includes(m.key) ? m.color : 'rgba(255,255,255,0.2)' }} />{m.label}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-white/[0.04] rounded-xl border border-white/[0.06] p-1">
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${range === r ? 'bg-[#0066FF] text-white' : 'text-white/40 hover:text-white'}`}>{r}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>{METRICS.map(m => (<linearGradient key={m.key} id={`ag-${m.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={m.color} stopOpacity={0.2} /><stop offset="95%" stopColor={m.color} stopOpacity={0} /></linearGradient>))}</defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
            <Tooltip content={<CustomTooltip />} />
            {METRICS.map(m => active.includes(m.key) && (<Area key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={m.color} strokeWidth={2} fill={`url(#ag-${m.key})`} dot={false} activeDot={{ r: 4, fill: m.color, strokeWidth: 0 }} />))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
