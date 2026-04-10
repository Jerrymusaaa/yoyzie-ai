'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
const DATA = [
  { type: 'Reels/Video', engagement: 8.4, reach: 42000, posts: 18 },
  { type: 'Carousel', engagement: 6.2, reach: 28000, posts: 24 },
  { type: 'Static Image', engagement: 3.8, reach: 18000, posts: 45 },
  { type: 'Story', engagement: 4.1, reach: 22000, posts: 62 },
  { type: 'Text/Thread', engagement: 2.9, reach: 12000, posts: 38 },
]
export function ContentBreakdown() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/[0.06]">
      <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-bold text-white mb-1">Content type breakdown</h3>
      <p className="text-xs text-white/40 mb-5">Engagement rate by format</p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="type" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`${v}%`, 'Engagement']} />
            <Bar dataKey="engagement" fill="#0066FF" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
