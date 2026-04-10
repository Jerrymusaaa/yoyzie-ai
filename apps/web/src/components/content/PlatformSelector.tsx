'use client'
import { cn } from '@/lib/utils'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', initial: 'IG', maxChars: 2200 },
  { id: 'tiktok', label: 'TikTok', color: '#FF0050', initial: 'TT', maxChars: 300 },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', initial: 'IN', maxChars: 3000 },
  { id: 'twitter', label: 'X / Twitter', color: '#1DA1F2', initial: 'X', maxChars: 280 },
  { id: 'facebook', label: 'Facebook', color: '#1877F2', initial: 'FB', maxChars: 63206 },
  { id: 'threads', label: 'Threads', color: '#6364FF', initial: 'TH', maxChars: 500 },
  { id: 'youtube', label: 'YouTube', color: '#FF0000', initial: 'YT', maxChars: 5000 },
  { id: 'pinterest', label: 'Pinterest', color: '#E60023', initial: 'PT', maxChars: 500 },
]

interface PlatformSelectorProps {
  selected: string[]
  onChange: (platforms: string[]) => void
}

export function PlatformSelector({ selected, onChange }: PlatformSelectorProps) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(p => p !== id) : [...selected, id])
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-white/70">Target platforms</label>
        <div className="flex items-center gap-3">
          <button onClick={() => onChange(PLATFORMS.map(p => p.id))} className="text-xs text-[#0066FF] hover:text-[#3385FF] transition-colors">Select all</button>
          <span className="text-white/20">·</span>
          <button onClick={() => onChange([])} className="text-xs text-white/30 hover:text-white/60 transition-colors">Clear</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map(p => {
          const active = selected.includes(p.id)
          return (
            <button key={p.id} onClick={() => toggle(p.id)}
              className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border', active ? 'text-white' : 'border-white/[0.08] bg-transparent text-white/40 hover:text-white/70 hover:border-white/20')}
              style={active ? { background: `${p.color}18`, borderColor: `${p.color}40`, color: p.color } : {}}>
              <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: active ? `${p.color}30` : 'rgba(255,255,255,0.08)' }}>{p.initial}</div>
              {p.label}
              {active && <span className="text-[10px] opacity-60">{p.maxChars >= 1000 ? `${(p.maxChars/1000).toFixed(0)}K` : p.maxChars}</span>}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && <p className="text-xs text-white/30 mt-2">{selected.length} platform{selected.length > 1 ? 's' : ''} selected · AI will optimize each caption separately</p>}
    </div>
  )
}

export { PLATFORMS }
