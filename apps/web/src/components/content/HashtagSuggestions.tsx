'use client'
import { cn } from '@/lib/utils'
interface HashtagGroup { label: string; color: string; tags: { tag: string; volume: string; trending: boolean }[] }
interface HashtagSuggestionsProps { selected: string[]; onChange: (tags: string[]) => void; groups: HashtagGroup[] }
export function HashtagSuggestions({ selected, onChange, groups }: HashtagSuggestionsProps) {
  const toggle = (tag: string) => onChange(selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag])
  return (
    <div>
      <label className="text-sm font-medium text-white/70 block mb-3">Hashtag suggestions</label>
      <div className="space-y-4">
        {groups.map(group => (
          <div key={group.label}>
            <p className="text-xs font-medium mb-2" style={{ color: group.color }}>{group.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.tags.map(({ tag, volume, trending }) => (
                <button key={tag} onClick={() => toggle(tag)}
                  className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all border', selected.includes(tag) ? 'text-white' : 'border-white/[0.08] text-white/40 hover:border-white/20')}
                  style={selected.includes(tag) ? { background: `${group.color}15`, borderColor: `${group.color}30`, color: group.color } : {}}>
                  {trending && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />}
                  {tag}
                  <span className="text-[10px] opacity-60">{volume}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected.length > 0 && <p className="text-xs text-white/30 mt-3">{selected.length} hashtags selected</p>}
    </div>
  )
}
