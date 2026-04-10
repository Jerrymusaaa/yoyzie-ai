'use client'
import { useState } from 'react'
import { Heart, Eye, MousePointerClick, Share2, TrendingUp, ChevronDown } from 'lucide-react'

const POSTS = [
  { id: '1', platform: 'TikTok', platformColor: '#FF0050', platformInitial: 'TT', content: 'POV: When your AI writes better captions than your entire marketing team 😂', date: 'Apr 15', impressions: 284000, likes: 18400, comments: 2840, shares: 4200, clicks: 1240, engRate: 8.9 },
  { id: '2', platform: 'Instagram', platformColor: '#E1306C', platformInitial: 'IG', content: '✨ Elevating every touchpoint. Our new AI update is live — and it\'s changing the game.', date: 'Apr 12', impressions: 142000, likes: 9200, comments: 1480, shares: 2100, clicks: 3840, engRate: 7.2 },
  { id: '3', platform: 'LinkedIn', platformColor: '#0A66C2', platformInitial: 'IN', content: 'After 6 months of building, we\'ve helped 18,000+ teams grow their social presence with AI.', date: 'Apr 10', impressions: 94000, likes: 4800, comments: 840, shares: 1200, clicks: 5200, engRate: 6.4 },
  { id: '4', platform: 'Instagram', platformColor: '#E1306C', platformInitial: 'IG', content: 'Coffee or tea? ☕🍵 Let us know below! #engagement #community', date: 'Apr 8', impressions: 118000, likes: 7200, comments: 3400, shares: 890, clicks: 420, engRate: 5.8 },
  { id: '5', platform: 'X / Twitter', platformColor: '#1DA1F2', platformInitial: 'X', content: '🚨 Hot take: most brands spend 80% of their time on content and 20% on strategy. It should be flipped.', date: 'Apr 6', impressions: 210000, likes: 3200, comments: 480, shares: 1840, clicks: 2100, engRate: 2.6 },
  { id: '6', platform: 'TikTok', platformColor: '#FF0050', platformInitial: 'TT', content: 'Watch how we schedule 30 posts in under 2 minutes with AI 🤖⚡ #productivity', date: 'Apr 4', impressions: 198000, likes: 14200, comments: 1920, shares: 3400, clicks: 890, engRate: 7.8 },
]

type SortKey = 'impressions' | 'likes' | 'comments' | 'shares' | 'clicks' | 'engRate'

export function TopPosts() {
  const [sort, setSort] = useState<SortKey>('impressions')
  const [platform, setPlatform] = useState('All')
  const platforms = ['All', ...Array.from(new Set(POSTS.map(p => p.platform)))]
  const sorted = [...POSTS].filter(p => platform === 'All' || p.platform === platform).sort((a, b) => b[sort] - a[sort])
  const cols: { key: SortKey; label: string }[] = [
    { key: 'impressions', label: 'Impressions' }, { key: 'likes', label: 'Likes' },
    { key: 'comments', label: 'Comments' }, { key: 'shares', label: 'Shares' },
    { key: 'clicks', label: 'Clicks' }, { key: 'engRate', label: 'Eng. rate' },
  ]
  const fmt = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : n.toString()
  return (
    <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-base font-bold text-white">Top performing posts</h3>
          <p className="text-xs text-white/40 mt-0.5">Last 30 days</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {platforms.map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${platform === p ? 'bg-[#0066FF] text-white shadow-lg shadow-blue-500/20' : 'glass border border-white/[0.06] text-white/50 hover:text-white'}`}>{p}</button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Post</th>
              {cols.map(col => (
                <th key={col.key} onClick={() => setSort(col.key)} className="text-right px-3 py-3 text-xs font-medium text-white/40 cursor-pointer hover:text-white transition-colors whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">{col.label}{sort === col.key && <ChevronDown className="w-3 h-3 text-[#0066FF]" />}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {sorted.map((post, i) => (
              <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-white/20 w-4 text-center">#{i+1}</span>
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white" style={{ background: `${post.platformColor}25`, border: `1px solid ${post.platformColor}35` }}>{post.platformInitial}</div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-white/70 line-clamp-1">{post.content}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{post.date}</p>
                    </div>
                  </div>
                </td>
                {cols.map(col => (
                  <td key={col.key} className="px-3 py-3.5 text-right">
                    <span className={`text-sm font-medium ${sort === col.key ? 'text-white' : 'text-white/60'}`}>
                      {col.key === 'engRate' ? `${post[col.key]}%` : fmt(post[col.key])}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
