'use client'
import { useState } from 'react'
import { Send, Sparkles } from 'lucide-react'

const DEMO_MESSAGES = [
  { role: 'user', text: 'Create a campaign for our Nairobi coffee shop targeting Gen Z on TikTok and Instagram.' },
  { role: 'ai', text: 'I\'ll set up a 2-week campaign with 14 posts across TikTok and Instagram. Awareness phase (Days 1-7): 3 TikTok Reels/day + 2 Instagram Stories. Conversion phase (Days 8-14): Retargeting posts with clear CTAs. Shall I generate the first batch of captions in Sheng?' },
  { role: 'user', text: 'Yes! Generate 5 TikTok captions in Sheng, keep them under 150 chars.' },
  { role: 'ai', text: '✅ Generated 5 TikTok captions with trending Kenyan hashtags. Ready to schedule?\n\nBest times to post: 6pm, 8pm, 10pm EAT based on your audience analytics.' },
]

const QUICK_PROMPTS = [
  'Analyze my best performing posts',
  'Schedule posts for next week',
  'Find trending hashtags in Kenya',
  'Generate Instagram captions in Swahili',
]

export function AIAssistantSection() {
  const [input, setInput] = useState('')
  return (
    <section id="ai-assistant" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] blur-[80px] opacity-10 rounded-full" style={{ background: 'radial-gradient(circle, #00D4AA, transparent)' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[#00D4AA]/20 mb-6">
              <Sparkles className="w-4 h-4 text-[#00D4AA]" />
              <span className="text-sm text-white/60">Conversational AI</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Just tell your AI<br /><span style={{ color: '#00D4AA' }}>what to do</span>
            </h2>
            <p className="text-white/50 text-lg mb-8 leading-relaxed">
              No complex dashboards to learn. Just describe what you want in English, Swahili, or Sheng — campaigns, content, scheduling, analytics — your AI social media manager handles the rest.
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => setInput(p)} className="px-3 py-1.5 rounded-full text-xs glass border border-white/10 text-white/50 hover:text-white hover:border-[#00D4AA]/30 transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Yoyzie AI Assistant</div>
                <div className="flex items-center gap-1.5 text-xs text-[#00D4AA]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] pulse-dot inline-block" />
                  Active — analyzing your accounts
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4 h-72 overflow-y-auto">
              {DEMO_MESSAGES.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#0066FF] text-white rounded-br-sm' : 'bg-white/[0.06] text-white/80 rounded-bl-sm border border-white/[0.06]'}`}>
                    {msg.text.split('\n').map((line, j) => <p key={j} className={j > 0 ? 'mt-1' : ''}>{line}</p>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 bg-white/[0.05] rounded-xl border border-white/10 px-4 py-3">
                <input type="text" placeholder="Tell your AI what to do..." value={input} onChange={e => setInput(e.target.value)} className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none" />
                <button className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center hover:bg-[#0052CC] transition-colors flex-shrink-0">
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
