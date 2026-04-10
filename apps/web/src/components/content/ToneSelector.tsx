'use client'
import { cn } from '@/lib/utils'

const TONES = [
  { id: 'professional', label: 'Professional', emoji: '💼', desc: 'Formal and authoritative' },
  { id: 'casual', label: 'Casual', emoji: '😊', desc: 'Friendly and conversational' },
  { id: 'humorous', label: 'Humorous', emoji: '😂', desc: 'Witty and entertaining' },
  { id: 'inspirational', label: 'Inspirational', emoji: '✨', desc: 'Motivating and uplifting' },
  { id: 'educational', label: 'Educational', emoji: '🎓', desc: 'Informative and clear' },
  { id: 'promotional', label: 'Promotional', emoji: '🚀', desc: 'Persuasive and action-driven' },
]

interface ToneSelectorProps { value: string; onChange: (tone: string) => void }

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium text-white/70 block mb-3">Tone of voice</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TONES.map(tone => (
          <button key={tone.id} onClick={() => onChange(tone.id)}
            className={cn('flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all', value === tone.id ? 'border-[#0066FF]/40 bg-[#0066FF]/10' : 'border-white/[0.06] bg-transparent hover:border-white/20 hover:bg-white/[0.04]')}>
            <span className="text-lg leading-none">{tone.emoji}</span>
            <div>
              <div className={cn('text-xs font-medium', value === tone.id ? 'text-[#0066FF]' : 'text-white/70')}>{tone.label}</div>
              <div className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{tone.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
