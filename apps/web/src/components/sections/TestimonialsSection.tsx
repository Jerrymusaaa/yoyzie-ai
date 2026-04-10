'use client'

const TESTIMONIALS = [
  { name: 'Amina Wanjiru', role: 'Head of Growth, Nairobi Fintech', avatar: 'AW', color: '#0066FF', quote: 'Yoyzie AI saved our 3-person marketing team 40 hours a week. The AI campaign manager is like having a senior strategist on call 24/7 who understands the Kenyan market.', metric: '340% engagement increase' },
  { name: 'Brian Otieno', role: 'Content Creator, Nairobi', avatar: 'BO', color: '#00D4AA', quote: 'I went from spending 3 hours a day on social media to 20 minutes. The AI generates Sheng captions better than I do, and it knows exactly when Kenyans are online.', metric: '2.1M new followers in 6 months' },
  { name: 'Priya Sharma', role: 'Digital Marketing Director, Agency', avatar: 'PS', color: '#FF6B35', quote: 'Managing 47 client accounts used to require a full team. The M-Pesa integration and influencer marketplace are game changers for our Kenyan clients.', metric: '5x client retention rate' },
  { name: 'Alex Kamau', role: 'E-commerce Brand Owner, Kenya', avatar: 'AK', color: '#A855F7', quote: 'The influencer marketplace with bot detection alone paid for our annual subscription in the first campaign. The ROI tracking and M-Pesa payouts make everything seamless.', metric: '6.8x ROAS on influencer campaigns' },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Loved by Kenyan marketers<br /><span className="text-gradient">everywhere</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="glass rounded-2xl p-7 border border-white/[0.06] feature-card">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: `${t.color}20`, border: `1px solid ${t.color}30` }}>{t.avatar}</div>
                <div>
                  <div className="text-sm font-medium text-white">{t.name}</div>
                  <div className="text-xs text-white/40">{t.role}</div>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg w-fit" style={{ background: `${t.color}10`, color: t.color, border: `1px solid ${t.color}20` }}>
                ↑ {t.metric}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
