'use client'

const PLATFORMS = [
  { name: 'Instagram', initial: 'IG', color: '#E1306C', followers: '12,441', engagement: '4.8%', posts: 142, growth: '+18%' },
  { name: 'TikTok', initial: 'TT', color: '#FF0050', followers: '8,204', engagement: '7.2%', posts: 89, growth: '+24%' },
  { name: 'LinkedIn', initial: 'IN', color: '#0A66C2', followers: '3,109', engagement: '3.1%', posts: 56, growth: '+12%' },
  { name: 'X / Twitter', initial: 'X', color: '#1DA1F2', followers: '5,677', engagement: '2.4%', posts: 210, growth: '+6%' },
]

export function PlatformBreakdown() {
  const total = PLATFORMS.reduce((sum, p) => sum + parseInt(p.followers.replace(',', '')), 0)
  return (
    <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-bold text-white">Platform Breakdown</h3>
          <p className="text-xs text-white/40 mt-0.5">Performance by network</p>
        </div>
        <div className="text-right">
          <div style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-bold text-white">{total.toLocaleString()}</div>
          <div className="text-xs text-white/40">Total followers</div>
        </div>
      </div>
      <div className="px-5 py-3 border-b border-white/[0.04]">
        <div className="flex rounded-full overflow-hidden h-2 gap-px">
          {PLATFORMS.map(p => {
            const pct = (parseInt(p.followers.replace(',', '')) / total) * 100
            return <div key={p.name} style={{ width: `${pct}%`, background: p.color }} className="transition-all" title={`${p.name}: ${pct.toFixed(1)}%`} />
          })}
        </div>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {PLATFORMS.map(p => {
          const pct = (parseInt(p.followers.replace(',', '')) / total) * 100
          return (
            <div key={p.name} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: `${p.color}25`, border: `1px solid ${p.color}35` }}>{p.initial}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-white/80">{p.name}</span>
                  <span className="text-xs font-bold text-white">{p.followers}</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1">
                  <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: p.color }} />
                </div>
              </div>
              <div className="text-right flex-shrink-0 min-w-[60px]">
                <div className="text-xs font-medium text-[#00D4AA]">{p.growth}</div>
                <div className="text-[10px] text-white/30">{p.engagement} eng.</div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-5 py-3 border-t border-white/[0.06]">
        <button className="text-xs text-[#0066FF] hover:text-[#3385FF] font-medium transition-colors">+ Connect more platforms</button>
      </div>
    </div>
  )
}
