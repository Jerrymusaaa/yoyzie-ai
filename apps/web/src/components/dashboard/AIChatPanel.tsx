'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Wand2, BarChart3, CalendarDays, Megaphone, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'

const QUICK_ACTIONS = [
  { label: 'Generate captions', icon: Wand2, color: '#0066FF', prompt: 'Generate 5 Instagram captions for my latest product update' },
  { label: 'Analyze performance', icon: BarChart3, color: '#00D4AA', prompt: 'Analyze my top performing posts from last 30 days' },
  { label: 'Schedule week', icon: CalendarDays, color: '#A855F7', prompt: 'Create a posting schedule for this week across all platforms' },
  { label: 'New campaign', icon: Megaphone, color: '#FF6B35', prompt: 'Help me create a new marketing campaign' },
]

const INITIAL_MESSAGES = [
  { id: 1, role: 'ai', text: "Hi! I'm your Yoyzie AI social media manager. I can create content, analyze your performance, schedule posts, and run campaigns across all your connected platforms. What would you like to do today?", time: 'Just now' },
]

type Message = { id: number; role: 'user' | 'ai'; text: string; time: string }

const AI_RESPONSES: Record<string, string> = {
  default: "I'll get that done for you right away. Based on your account analytics and audience behavior, here's what I recommend:\n\n• Best posting time: 6PM–8PM EAT\n• Top performing format: Carousel posts\n• Suggested hashtag count: 8–12 per post\n\nWould you like me to proceed with generating the content?",
  captions: "Here are 5 high-performing Instagram captions optimized for your Kenyan audience:\n\n1. 🚀 Elevating every touchpoint. Our new update is live — and it's changing the game.\n\n2. The results speak for themselves. 340% engagement increase. Real teams. Real growth.\n\n3. What if managing social media felt effortless? That's exactly what we built. ✨\n\n4. Your audience is waiting. Your content shouldn't. Meet your new AI marketing team.\n\n5. Stop posting. Start connecting. The difference is strategy — and we've got yours covered.\n\nShall I schedule these or create Swahili/Sheng variations?",
  analyze: "📊 Performance Analysis — Last 30 Days\n\nTop performing content:\n• Carousel posts: +42% above average reach\n• Video content: 3.2x more engagement than static images\n• Posts at 7PM EAT: 28% higher click-through rate\n\nGrowth highlights:\n• Instagram: +1,240 followers (+18%)\n• TikTok: +890 followers (+24%)\n• LinkedIn: +310 followers (+12%)\n\nRecommendation: Double down on video carousels posted between 6–8PM EAT.",
}

export function AIChatPanel() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text, time: 'Just now' }])
    setInput('')
    setIsTyping(true)
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
    const key = text.toLowerCase().includes('caption') ? 'captions'
      : text.toLowerCase().includes('analyz') || text.toLowerCase().includes('performance') ? 'analyze'
      : 'default'
    setIsTyping(false)
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: AI_RESPONSES[key], time: 'Just now' }])
  }

  return (
    <div className="glass rounded-2xl border border-white/[0.06] flex flex-col h-[600px] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-sm font-bold text-white">AI Assistant</h3>
          <div className="flex items-center gap-1.5 text-xs text-[#00D4AA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] inline-block pulse-dot" />
            Online · 4 platforms connected
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {['GPT-4o', 'Claude'].map((m, i) => (
            <div key={m} className={`px-2 py-1 rounded-lg text-[10px] font-medium cursor-pointer ${i === 0 ? 'bg-[#0066FF]/20 text-[#0066FF] border border-[#0066FF]/20' : 'text-white/30 hover:text-white/60'}`}>{m}</div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/[0.04] flex gap-2 overflow-x-auto flex-shrink-0">
        {QUICK_ACTIONS.map(action => (
          <button key={action.label} onClick={() => sendMessage(action.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border hover:opacity-90 flex-shrink-0"
            style={{ background: `${action.color}12`, borderColor: `${action.color}25`, color: action.color }}>
            <action.icon className="w-3.5 h-3.5" />{action.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className="max-w-[85%] space-y-1">
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'bg-[#0066FF] text-white rounded-br-sm' : 'bg-white/[0.06] text-white/80 rounded-bl-sm border border-white/[0.06]'}`}>
                {msg.text}
              </div>
              {msg.role === 'ai' && (
                <div className="flex items-center gap-2 px-1">
                  <button className="p-1 rounded text-white/20 hover:text-white/50 transition-colors"><Copy className="w-3 h-3" /></button>
                  <button className="p-1 rounded text-white/20 hover:text-[#00D4AA] transition-colors"><ThumbsUp className="w-3 h-3" /></button>
                  <button className="p-1 rounded text-white/20 hover:text-red-400 transition-colors"><ThumbsDown className="w-3 h-3" /></button>
                  <span className="text-[10px] text-white/20">{msg.time}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white/[0.06] border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40" style={{ animation: `pulse-dot 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-white/[0.04]">
        <div className="flex items-end gap-2 bg-white/[0.05] rounded-2xl border border-white/10 px-4 py-3 focus-within:border-[#0066FF]/40 transition-colors">
          <textarea placeholder="Ask your AI anything — create content, analyze data, schedule posts..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            rows={1} className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none resize-none leading-relaxed max-h-28" />
          <button onClick={() => sendMessage(input)} disabled={!input.trim()}
            className="w-8 h-8 rounded-xl bg-[#0066FF] flex items-center justify-center hover:bg-[#0052CC] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-blue-500/20">
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <p className="text-[10px] text-white/20 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
