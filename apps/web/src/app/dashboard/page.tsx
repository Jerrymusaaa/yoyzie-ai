'use client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi, schedulingApi, walletApi } from '@/lib/api'
import { formatCurrency, formatNumber, formatRelativeTime } from '@/lib/utils'
import {
  Users, TrendingUp, Eye, Heart,
  Calendar, Wallet, Plus, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: overview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsApi.get('/api/v1/analytics/overview?days=30').then(r => r.data.data),
  })

  const { data: upcoming } = useQuery({
    queryKey: ['upcoming-posts'],
    queryFn: () => schedulingApi.get('/api/v1/scheduling/posts/upcoming?limit=5').then(r => r.data.data),
  })

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.get('/api/v1/wallet/balance').then(r => r.data.data),
    enabled: user?.accountCategory === 'INFLUENCER',
  })

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-white mb-1">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-white/50 text-sm">Here&apos;s what&apos;s happening with your social media today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Impressions"
          value={formatNumber(overview?.summary?.totalImpressions || 0)}
          icon={Eye}
          iconColor="text-brand-blue"
          change="Last 30 days"
          changeType="neutral"
        />
        <StatCard
          title="Total Reach"
          value={formatNumber(overview?.summary?.totalReach || 0)}
          icon={Users}
          iconColor="text-brand-teal"
          change="Last 30 days"
          changeType="neutral"
        />
        <StatCard
          title="Total Likes"
          value={formatNumber(overview?.summary?.totalLikes || 0)}
          icon={Heart}
          iconColor="text-brand-orange"
          change="Last 30 days"
          changeType="neutral"
        />
        <StatCard
          title="Avg Engagement"
          value={`${overview?.summary?.avgEngagementRate?.toFixed(1) || 0}%`}
          icon={TrendingUp}
          iconColor="text-green-400"
          change="Last 30 days"
          changeType="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Posts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Posts</CardTitle>
              <Link href="/dashboard/schedule">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight size={14} />
                </Button>
              </Link>
            </CardHeader>

            {upcoming?.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((post: any) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                    <div className="p-2 rounded-lg bg-white/5 text-lg shrink-0">
                      {post.platform === 'INSTAGRAM' ? '📸' : post.platform === 'TIKTOK' ? '🎵' : '📱'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/80 truncate">{post.caption}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="blue">{post.platform}</Badge>
                        <span className="text-xs text-white/40">
                          {formatRelativeTime(post.scheduledAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={32} className="text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm mb-3">No upcoming posts scheduled</p>
                <Link href="/dashboard/schedule">
                  <Button size="sm">
                    <Plus size={14} />
                    Schedule a post
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions + Wallet */}
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-4">Quick Actions</CardTitle>
            <div className="space-y-2">
              {[
                { label: 'Generate captions', href: '/dashboard/content', icon: '✍️' },
                { label: 'Schedule a post', href: '/dashboard/schedule', icon: '📅' },
                { label: 'View analytics', href: '/dashboard/analytics', icon: '📊' },
                { label: 'Browse campaigns', href: '/dashboard/campaigns', icon: '🎯' },
                { label: 'Chat with AI', href: '/dashboard/ai-chat', icon: '🤖' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors group"
                >
                  <span className="text-base">{action.icon}</span>
                  <span className="text-sm">{action.label}</span>
                  <ArrowRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </Card>

          {user?.accountCategory === 'INFLUENCER' && wallet && (
            <Card glow="teal">
              <CardHeader>
                <CardTitle className="text-brand-teal">My Wallet</CardTitle>
                <Wallet size={16} className="text-brand-teal" />
              </CardHeader>
              <p className="text-3xl font-display font-bold text-white mb-1">
                {formatCurrency(wallet.balance || 0)}
              </p>
              <p className="text-xs text-white/40 mb-4">Available balance</p>
              <Link href="/dashboard/wallet">
                <Button variant="teal" size="sm" className="w-full">
                  Manage Wallet
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
