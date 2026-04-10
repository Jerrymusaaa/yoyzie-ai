'use client'
export function AudienceDemographics() {
  const ages = [{ label: '18-24', pct: 32, color: '#0066FF' }, { label: '25-34', pct: 41, color: '#00D4AA' }, { label: '35-44', pct: 18, color: '#A855F7' }, { label: '45+', pct: 9, color: '#FF6B35' }]
  const locations = [{ city: 'Nairobi', pct: 48 }, { city: 'Mombasa', pct: 12 }, { city: 'Kisumu', pct: 8 }, { city: 'Nakuru', pct: 7 }, { city: 'Other Kenya', pct: 25 }]
  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5">
      <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-bold text-white mb-4">Audience demographics</h3>
      <div className="mb-5">
        <p className="text-xs text-white/40 mb-3">Age distribution</p>
        <div className="flex rounded-full overflow-hidden h-3 gap-px mb-3">
          {ages.map(a => <div key={a.label} style={{ width: `${a.pct}%`, background: a.color }} title={`${a.label}: ${a.pct}%`} />)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ages.map(a => (
            <div key={a.label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
              <span className="text-xs text-white/50">{a.label}</span>
              <span className="text-xs font-medium text-white ml-auto">{a.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-white/40 mb-3">Top locations</p>
        <div className="space-y-2">
          {locations.map(l => (
            <div key={l.city}>
              <div className="flex justify-between mb-1"><span className="text-xs text-white/60">{l.city}</span><span className="text-xs font-medium text-white">{l.pct}%</span></div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5"><div className="h-1.5 rounded-full bg-[#0066FF]" style={{ width: `${l.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
