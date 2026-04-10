'use client'
import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { contentApi } from '@/lib/api'
import { Sparkles, Copy, RefreshCw, Hash, FileText, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

const platforms = ['INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'TWITTER', 'FACEBOOK']
const tones = ['casual', 'professional', 'humorous', 'inspirational', 'promotional']
const languages = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Swahili' },
  { value: 'sheng', label: 'Sheng' },
]

const tabs = [
  { id: 'captions', label: 'Captions', icon: FileText },
  { id: 'hashtags', label: 'Hashtags', icon: Hash },
  { id: 'thread', label: 'Thread', icon: MessageSquare },
]

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState('captions')
  const [platform, setPlatform] = useState('INSTAGRAM')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('casual')
  const [language, setLanguage] = useState('en')
  const [count, setCount] = useState(3)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])

  const generate = async () => {
    if (!topic.trim()) return toast.error('Please enter a topic')
    setLoading(true)
    setResults([])
    try {
      if (activeTab === 'captions') {
        const res = await contentApi.post('/api/v1/content/captions', {
          platform, topic, tone, language, count,
          includeHashtags: true, includeEmojis: true,
        })
        setResults(res.data.data.captions)
      } else if (activeTab === 'hashtags') {
        const res = await contentApi.post('/api/v1/content/hashtags', {
          topic, platform, count: 20, includeKenyanTrends: true,
        })
        setResults(res.data.data.hashtags)
      } else if (activeTab === 'thread') {
        const res = await contentApi.post('/api/v1/content/thread', {
          topic, tone, pointCount: 6,
        })
        setResults(res.data.data.tweets)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <DashboardLayout title="Content Studio">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setResults([]) }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab.id ? 'bg-brand-blue text-white' : 'text-white/50 hover:text-white'
                  }`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Topic / Brief</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Launching a new coffee shop in Westlands Nairobi..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 placeholder:text-white/30 focus:outline-none focus:border-brand-blue resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Platform</label>
                <div className="flex flex-wrap gap-1.5">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        platform === p ? 'bg-brand-blue text-white' : 'bg-white/5 text-white/50 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab !== 'hashtags' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-white/70 mb-2 block">Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-brand-blue"
                    >
                      {tones.map((t) => (
                        <option key={t} value={t} className="bg-gray-900 capitalize">{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/70 mb-2 block">Language</label>
                    <div className="flex gap-1.5">
                      {languages.map((l) => (
                        <button
                          key={l.value}
                          onClick={() => setLanguage(l.value)}
                          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                            language === l.value ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30' : 'bg-white/5 text-white/50 hover:text-white'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeTab === 'captions' && (
                    <div>
                      <label className="text-sm font-medium text-white/70 mb-2 block">Count: {count}</label>
                      <input
                        type="range" min={1} max={5} value={count}
                        onChange={(e) => setCount(parseInt(e.target.value))}
                        className="w-full accent-brand-blue"
                      />
                    </div>
                  )}
                </>
              )}

              <Button onClick={generate} loading={loading} className="w-full">
                <Sparkles size={14} />
                Generate with AI
              </Button>
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <Card className="min-h-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white">
                {results.length > 0 ? `${results.length} Results` : 'Results'}
              </h3>
              {results.length > 0 && (
                <Button variant="ghost" size="sm" onClick={generate} loading={loading}>
                  <RefreshCw size={13} />
                  Regenerate
                </Button>
              )}
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-white/40 text-sm">Generating with AI...</p>
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <Sparkles size={32} className="text-white/10 mb-3" />
                <p className="text-white/30 text-sm">Your generated content will appear here</p>
              </div>
            )}

            {!loading && results.length > 0 && activeTab === 'hashtags' && (
              <div className="flex flex-wrap gap-2">
                {results.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(tag)}
                    className="px-3 py-1.5 rounded-lg bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue text-sm border border-brand-blue/20 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
                <button
                  onClick={() => copyToClipboard(results.join(' '))}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"
                >
                  Copy all
                </button>
              </div>
            )}

            {!loading && results.length > 0 && activeTab !== 'hashtags' && (
              <div className="space-y-4">
                {results.map((result, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/3 border border-white/5 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="gray">#{i + 1}</Badge>
                          <Badge variant="blue">{platform}</Badge>
                        </div>
                        <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{result}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(result)}
                        className="shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
