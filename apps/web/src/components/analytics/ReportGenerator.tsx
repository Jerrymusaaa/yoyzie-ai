'use client'
import { useState } from 'react'
import { Sparkles, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
export function ReportGenerator() {
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const generate = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 2000))
    setGenerating(false)
    setGenerated(true)
  }
  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 flex flex-col">
      <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-bold text-white mb-1">AI Report Generator</h3>
      <p className="text-xs text-white/40 mb-5">Generate a comprehensive performance report</p>
      <div className="space-y-3 mb-5 flex-1">
        {['Executive summary', 'Platform breakdown', 'Content analysis', 'Competitor benchmarks', 'AI recommendations'].map(item => (
          <div key={item} className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full border border-[#0066FF]/40 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-[#0066FF]" />
            </div>
            <span className="text-sm text-white/60">{item}</span>
          </div>
        ))}
      </div>
      {generated ? (
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#00D4AA]/30 text-[#00D4AA] text-sm font-medium hover:bg-[#00D4AA]/10 transition-colors">
          <Download className="w-4 h-4" /> Download PDF Report
        </button>
      ) : (
        <Button onClick={generate} loading={generating} className="w-full rounded-xl gap-2">
          <Sparkles className="w-4 h-4" /> Generate Report
        </Button>
      )}
    </div>
  )
}
