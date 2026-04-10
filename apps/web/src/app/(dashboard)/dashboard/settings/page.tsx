'use client'
import { Construction } from 'lucide-react'

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 rounded-2xl bg-[#0066FF]/10 border border-[#0066FF]/20 flex items-center justify-center mb-4">
        <Construction className="w-8 h-8 text-[#0066FF]" />
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-bold text-white mb-2 capitalize">settings</h2>
      <p className="text-white/40 text-sm">Coming in the next build step</p>
    </div>
  )
}
