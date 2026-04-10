'use client'
import { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { aiApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { Sparkles, Send, Bot, User } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const STARTERS = [
  'Write 3 Instagram captions for my Nairobi restaurant',
  'What are the best posting times on TikTok in Kenya?',
  'Help me plan a social media campaign for KES 50,000',
  'What hashtags should I use for a fashion brand?',
]

export default function AIChatPage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = text || input.trim()
    if (!content) return

    const userMessage: Message = { role: 'user', content, timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await aiApi.post('/api/v1/ai/chat', { messages: history })
      const reply = res.data.data.output.reply

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, timestamp: new Date() },
      ])
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to get response')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="AI Assistant">
      <div className="max-w-3xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-blue/20 flex items-center justify-center mb-4">
              <Sparkles className="text-brand-blue" size={28} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Yoyzie AI Assistant</h2>
            <p className="text-white/50 text-sm mb-8 text-center max-w-sm">
              Your intelligent social media expert for the Kenyan market. Ask me anything.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  onClick={() => sendMessage(starter)}
                  className="p-3 rounded-xl glass text-left text-sm text-white/70 hover:text-white hover:border-brand-blue/30 transition-all"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={14} className="text-brand-blue" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-brand-blue text-white rounded-tr-sm'
                      : 'glass text-white/90 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <p className="text-xs text-white/30 mt-1 px-1">
                    {formatRelativeTime(msg.timestamp)}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-1 text-sm font-bold text-white">
                    {user?.name?.[0]}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-brand-blue" />
                </div>
                <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="pt-4 border-t border-white/5">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask anything about social media in Kenya..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-blue"
            />
            <Button onClick={() => sendMessage()} loading={loading} disabled={!input.trim()} size="lg">
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
