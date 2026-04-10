'use client'
import { useState } from 'react'
import { Copy, Check, RefreshCw, ThumbsUp, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Variant {
  id: string; platform: string; platformColor: string; platformInitial: string
  caption: string; hashtags: string[]; tone: string; charCount: number; score: number
}

interface CaptionVariantsProps {
  variants: Variant[]; loading: boolean
  onRegenerate: (id: string) => void; onSchedule: (variant: Variant) => void
}

function VariantCard({ variant, onRegenerate, onSchedule }: { variant: Variant; onRegenerate: (id: string) => void; onSchedule: (v: Variant) => void }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [liked, setLiked] = useState(false)
  const copy = () => { navigator.clipboard.writeText(`${variant.caption}\n\n${variant.hashtags.join(' ')}`); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className={cn('glass rounded-2xl border transition-all', liked ? 'border-[#00D4AA]/30' : 'border-white/[0.06]')}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04]">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: `${variant.platformColor}25`, border: `1px solid ${variant.platformColor}35` }}>{variant.platformInitial}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/80">{variant.platform}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">{variant.tone}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: `${variant.score >= 80 ? '#00D4AA' : variant.score >= 60 ? '#F59E0B' : '#EF4444'}15` }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: variant.score >= 80 ? '#00D4AA' : variant.score >= 60 ? '#F59E0B' : '#EF4444' }} />
          <span className="text-[11px] font-medium" style={{ color: variant.score >= 80 ? '#00D4AA' : variant.score >= 60 ? '#F59E0B' : '#EF4444' }}>{variant.score}%</span>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1 text-white/30 hover:text-white/60 transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {expanded && (
        <>
          <div className="px-4 py-3">
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{variant.caption}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {variant.hashtags.map(tag => (<span key={tag} className="text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors hover:opacity-80" style={{ background: `${variant.platformColor}15`, color: variant.platformColor }}>{tag}</span>))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-white/30">{variant.charCount} characters</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.04]">
            <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/[0.06] transition-all">
              {copied ? <Check className="w-3.5 h-3.5 text-[#00D4AA]" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={() => onRegenerate(variant.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/[0.06] transition-all">
              <RefreshCw className="w-3.5 h-3.5" />Regenerate
            </button>
            <button onClick={() => setLiked(!liked)} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all', liked ? 'text-[#00D4AA] bg-[#00D4AA]/10' : 'text-white/50 hover:text-white hover:bg-white/[0.06]')}>
              <ThumbsUp className="w-3.5 h-3.5" />{liked ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => onSchedule(variant)} className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium bg-[#0066FF] text-white hover:bg-[#0052CC] transition-all shadow-lg shadow-blue-500/20">Schedule →</button>
          </div>
        </>
      )}
    </div>
  )
}

export function CaptionVariants({ variants, loading, onRegenerate, onSchedule }: CaptionVariantsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="glass rounded-2xl border border-white/[0.06] p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-4"><div className="w-7 h-7 rounded-lg bg-white/[0.08]" /><div className="h-4 bg-white/[0.08] rounded-lg w-24" /><div className="ml-auto h-4 bg-white/[0.08] rounded-full w-12" /></div>
            <div className="space-y-2"><div className="h-3 bg-white/[0.06] rounded w-full" /><div className="h-3 bg-white/[0.06] rounded w-4/5" /><div className="h-3 bg-white/[0.06] rounded w-3/5" /></div>
          </div>
        ))}
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-white/40">
          <Sparkles className="w-4 h-4 text-[#0066FF] animate-pulse" />AI is crafting your captions...
        </div>
      </div>
    )
  }
  if (variants.length === 0) {
    return (
      <div className="glass rounded-2xl border border-white/[0.06] p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#0066FF]/10 border border-[#0066FF]/20 flex items-center justify-center mx-auto mb-4"><Sparkles className="w-6 h-6 text-[#0066FF]" /></div>
        <p className="text-white/50 text-sm mb-2">No captions yet</p>
        <p className="text-white/25 text-xs">Describe your content above and click Generate to create AI-optimized captions for each platform.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {variants.map(variant => <VariantCard key={variant.id} variant={variant} onRegenerate={onRegenerate} onSchedule={onSchedule} />)}
    </div>
  )
}
