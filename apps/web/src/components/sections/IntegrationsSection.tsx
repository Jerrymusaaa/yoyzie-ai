'use client'

const INTEGRATIONS = [
  { name: 'Instagram', color: '#E1306C', category: 'Social' },
  { name: 'TikTok', color: '#FF0050', category: 'Video' },
  { name: 'LinkedIn', color: '#0A66C2', category: 'Professional' },
  { name: 'X / Twitter', color: '#1DA1F2', category: 'Social' },
  { name: 'YouTube', color: '#FF0000', category: 'Video' },
  { name: 'Facebook', color: '#1877F2', category: 'Social' },
  { name: 'Pinterest', color: '#E60023', category: 'Discovery' },
  { name: 'Threads', color: '#000000', category: 'Social' },
  { name: 'Snapchat', color: '#FFFC00', category: 'Stories' },
  { name: 'Reddit', color: '#FF4500', category: 'Community' },
  { name: 'Discord', color: '#5865F2', category: 'Community' },
  { name: 'Telegram', color: '#26A5E4', category: 'Messaging' },
  { name: 'WhatsApp', color: '#25D366', category: 'Messaging' },
  { name: 'Bluesky', color: '#0085FF', category: 'Social' },
  { name: 'Mastodon', color: '#6364FF', category: 'Social' },
  { name: 'WordPress', color: '#21759B', category: 'Blog' },
  { name: 'Google Business', color: '#4285F4', category: 'Business' },
  { name: 'Slack', color: '#4A154B', category: 'Team' },
  { name: 'RSS Feeds', color: '#F26522', category: 'Syndication' },
]

export function IntegrationsSection() {
  const row1 = INTEGRATIONS.slice(0, 10)
  const row2 = INTEGRATIONS.slice(10)
  return (
    <section id="integrations" className="py-24 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Every platform.<br /><span className="text-gradient">One interface.</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Connect all your social accounts and manage them from a single unified AI-powered dashboard.
          </p>
        </div>
        <div className="space-y-3">
          {[row1, row2].map((row, rowIdx) => (
            <div key={rowIdx} className="flex flex-wrap justify-center gap-3">
              {row.map(platform => (
                <div key={platform.name} className="platform-badge flex items-center gap-2.5 px-4 py-2.5 glass rounded-xl border border-white/[0.06] hover:border-white/20 cursor-pointer">
                  <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ background: `${platform.color}25`, border: `1px solid ${platform.color}40` }} />
                  <span className="text-sm text-white/70 whitespace-nowrap">{platform.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white/30 bg-white/[0.04]">{platform.category}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="text-center text-white/30 text-sm mt-6">All 23 platforms included in every plan · OAuth-secured connections</p>
      </div>
    </section>
  )
}
