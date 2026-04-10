'use client'
import { Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

const POSTS = [
  { id: 1, platform: 'Instagram', platformColor: '#E1306C', initial: 'IG', time: 'Today, 6:00 PM EAT', content: '🌟 Exciting news! Our new product launch is just around the corner. Stay tuned for something amazing...', status: 'scheduled' },
  { id: 2, platform: 'TikTok', platformColor: '#FF0050', initial: 'TT', time: 'Today, 8:00 PM EAT', content: 'POV: When your AI writes better captions than your entire marketing team 😂 #AIMarketing #SocialMedia', status: 'scheduled' },
  { id: 3, platform: 'LinkedIn', platformColor: '#0A66C2', initial: 'IN', time: 'Yesterday, 9:00 AM EAT', content: 'Thrilled to share our Q1 results: 340% increase in engagement, 18K+ new followers, and a 280% campaign ROI lift.', status: 'published' },
  { id: 4, platform: 'X / Twitter', platformColor: '#1DA1F2', initial: 'X', time: 'Tomorrow, 10:00 AM EAT', content: 'The future of social media management is here. AI-powered, conversational, and incredibly fast. 🚀', status: 'draft' },
]

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  published: { label: 'Published', icon: CheckCircle2, color: '#00D4AA', bg: 'rgba(0,212,170,0.1)' },
  draft: { label: 'Draft', icon: Loader2, color: '#888', bg: 'rgba(136,136,136,0.1)' },
  failed: { label: 'Failed', icon: AlertCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
}

export function ScheduledPosts() {
  return (
    <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-bold text-white">Scheduled Posts</h3>
          <p className="text-xs text-white/40 mt-0.5">Upcoming & recent</p>
        </div>
        <button className="text-xs text-[#0066FF] hover:text-[#3385FF] font-medium transition-colors">View all →</button>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {POSTS.map(post => {
          const status = STATUS_CONFIG[post.status as keyof typeof STATUS_CONFIG]
          return (
            <div key={post.id} className="flex items-start gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                style={{ background: `${post.platformColor}25`, border: `1px solid ${post.platformColor}35` }}>
                {post.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white/70">{post.platform}</span>
                  <span className="text-[10px] text-white/30">·</span>
                  <span className="text-[10px] text-white/30">{post.time}</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{post.content}</p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full flex-shrink-0" style={{ background: status.bg }}>
                <status.icon className="w-3 h-3" style={{ color: status.color }} />
                <span className="text-[10px] font-medium" style={{ color: status.color }}>{status.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
