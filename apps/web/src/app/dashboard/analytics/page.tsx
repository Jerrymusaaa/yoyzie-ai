'use client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { analyticsApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { formatNumber } from '@/lib/utils'
import { BarChart2, Eye, Users, Heart, TrendingUp, MousePointer, Sparkles } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AnalyticsPage() {
  const [days, setDays] = useState(30)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)

  const { data: overview } = useQuery({
    queryKey: ['analytics-overview', days],
    queryFn: () => analyticsApi.get(`/api/v1/analytics/overview?days=${days}`).then(r => r.data.data),
  })

  const { data: topPosts } = useQuery({
    queryKey: ['top-posts', days],
    queryFn: () => analyticsApi.get(`/api/v1/analytics/posts/top?days=${days}&limit=5`).then(r => r.data.data),
  })

  const platformData = overview?.platformBreakdown
    ? Object.entries(overview.platformBreakdown).map(([platform, data]: [string, any]) => ({
        platform,
        impressions: data.impressions || 0,
        likes: data.likes || 0,
        posts: data.posts || 0,
      }))
    : []

  const generateSummary = async () => {
    setGeneratingSummary(true)
    try {
      const res = await analyticsApi.post(`/api/v1/analytics/reports/generate?period=${days <= 7 ? 'weekly' : 'monthly'}`)
      setAiSummary(res.data.data.report.summary)
    } catch {
      toast.error('Failed to generate summary')
    } finally {
      setGeneratingSummary(false)
    }
  }

  return (
    <DashboardLayout title="Analytics">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                days === d ? 'bg-brand-blue text-white' : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
        <Button onClick={generateSummary} loading={generatingSummary} variant="secondary" size="sm">
          <Sparkles size={14} />
          AI Summary
        </Button>
      </div>

      {aiSummary && (
        <Card className="mb-6 border-brand-blue/20" glow="blue">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand-blue/20 shrink-0">
              <Sparkles size={16} className="text-brand-blue" />
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">AI Performance Summary</h3>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Impressions" value={formatNumber(overview?.summary?.totalImpressions || 0)} icon={Eye} iconColor="text-brand-blue" />
        <StatCard title="Total Reach" value={formatNumber(overview?.summary?.totalReach || 0)} icon={Users} iconColor="text-brand-teal" />
        <StatCard title="Total Likes" value={formatNumber(overview?.summary?.totalLikes || 0)} icon={Heart} iconColor="text-brand-orange" />
        <StatCard title="Avg Engagement" value={`${overview?.summary?.avgEngagementRate?.toFixed(1) || 0}%`} icon={TrendingUp} iconColor="text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Impressions by Platform</CardTitle>
          </CardHeader>
          {platformData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="platform" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  formatter={(val) => formatNumber(Number(val))}
                />
                <Bar dataKey="impressions" fill="#0066FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-white/30 text-sm">
              No data yet — ingest some metrics to see charts
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Posts</CardTitle>
          </CardHeader>
          {topPosts?.length > 0 ? (
            <div className="space-y-3">
              {topPosts.slice(0, 5).map((post: any, i: number) => (
                <div key={post.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/3">
                  <span className="text-white/30 text-sm w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="blue">{post.platform}</Badge>
                      <span className="text-xs text-white/40">{formatNumber(post.impressions)} views</span>
                    </div>
                    <p className="text-xs text-white/60 truncate">{post.externalPostId}</p>
                  </div>
                  <span className="text-sm font-medium text-brand-teal shrink-0">
                    {post.engagementRate?.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-white/30 text-sm">
              No post metrics yet
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Comments" value={formatNumber(overview?.summary?.totalComments || 0)} icon={BarChart2} iconColor="text-purple-400" />
        <StatCard title="Total Shares" value={formatNumber(overview?.summary?.totalShares || 0)} icon={TrendingUp} iconColor="text-yellow-400" />
        <StatCard title="Total Clicks" value={formatNumber(overview?.summary?.totalClicks || 0)} icon={MousePointer} iconColor="text-pink-400" />
        <StatCard title="Total Posts" value={overview?.summary?.totalPosts || 0} icon={Eye} iconColor="text-indigo-400" />
      </div>
    </DashboardLayout>
  )
}
