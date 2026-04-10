'use client'

const TICKER_ITEMS = [
  '🚀 AI Caption Generator', '📊 Real-time Analytics', '📅 Smart Scheduling',
  '🎯 Campaign Manager', '🤝 Influencer Marketplace', '🔥 Trend Detection',
  '⚡ 23+ Platforms', '🤖 AI Chat Control', '📈 Performance Reports',
  '🎨 Content Studio', '🌍 Social Listening', '💡 Hashtag Intelligence',
]

export function TickerSection() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="relative py-5 border-y border-white/[0.06] overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050A14] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050A14] to-transparent z-10" />
      <div className="ticker-inner">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-6 px-8 whitespace-nowrap">
            <span className="text-sm text-white/40 font-medium">{item}</span>
            <span className="text-white/20 text-lg">·</span>
          </div>
        ))}
      </div>
    </div>
  )
}
