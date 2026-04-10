'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import {
  LayoutDashboard, MessageSquare, Wand2, Megaphone, CalendarDays,
  BarChart3, Users2, TrendingUp, CreditCard, Settings, Zap,
  ChevronLeft, ChevronRight, X, Wallet,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Assistant', href: '/dashboard/ai-chat', icon: MessageSquare, badge: 'AI' },
  { label: 'Content Studio', href: '/dashboard/content', icon: Wand2 },
  { label: 'Campaign Manager', href: '/dashboard/campaigns', icon: Megaphone },
  { label: 'Scheduler', href: '/dashboard/schedule', icon: CalendarDays },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Influencers', href: '/dashboard/influencers', icon: Users2 },
  { label: 'Trends', href: '/dashboard/trends', icon: TrendingUp },
]

const BOTTOM_ITEMS = [
  { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const CONNECTED_PLATFORMS = [
  { name: 'Instagram', color: '#E1306C', initial: 'IG', followers: '12.4K' },
  { name: 'TikTok', color: '#FF0050', initial: 'TT', followers: '8.2K' },
  { name: 'LinkedIn', color: '#0A66C2', initial: 'IN', followers: '3.1K' },
  { name: 'X', color: '#1DA1F2', initial: 'X', followers: '5.7K' },
]

interface SidebarProps {
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

export function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'YA'

  return (
    <aside className={cn(
      'fixed lg:relative inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0',
      'border-r border-white/[0.06]',
      collapsed ? 'w-[70px]' : 'w-[240px]',
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    )} style={{ background: '#0A1020' }}>

      <div className={cn('flex items-center h-16 px-4 border-b border-white/[0.06] flex-shrink-0', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)' }} className="text-white font-bold text-base">
              Yoyzie <span className="text-[#0066FF]">AI.</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        )}
        <button onClick={onClose} className="lg:hidden p-1 text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        {!collapsed && (
          <button onClick={onToggleCollapse} className="hidden lg:flex p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={onToggleCollapse} className="hidden lg:flex mx-auto mt-3 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {!collapsed && <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-2">Main</p>}
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.label} href={item.href} className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
              collapsed ? 'justify-center' : '',
              active ? 'bg-[#0066FF]/15 text-white border border-[#0066FF]/20' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
            )}>
              <item.icon className={cn('w-[18px] h-[18px] flex-shrink-0', active ? 'text-[#0066FF]' : '')} />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#0066FF]/20 text-[#0066FF]">{item.badge}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#1A2540] border border-white/10 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}

        {!collapsed && (
          <div className="pt-4 pb-2">
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-2">Connected</p>
            <div className="space-y-0.5">
              {CONNECTED_PLATFORMS.map(p => (
                <div key={p.name} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: `${p.color}30`, border: `1px solid ${p.color}40` }}>{p.initial}</div>
                  <span className="flex-1 text-xs">{p.name}</span>
                  <span className="text-[11px] text-white/30">{p.followers}</span>
                </div>
              ))}
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[#0066FF] hover:bg-[#0066FF]/10 transition-all mt-1">
                <span className="w-5 h-5 rounded-md border border-[#0066FF]/30 flex items-center justify-center text-sm">+</span>
                Add platform
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="px-2 py-3 border-t border-white/[0.06] space-y-0.5">
        {BOTTOM_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.label} href={item.href} className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
              collapsed ? 'justify-center' : '',
              active ? 'bg-[#0066FF]/15 text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
            )}>
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#1A2540] border border-white/10 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}

        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer mt-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{initials}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] text-white/30 truncate">{user?.accountType?.replace(/_/g, ' ') || 'Free Plan'}</div>
            </div>
            <Settings className="w-3.5 h-3.5 text-white/30" />
          </div>
        ) : (
          <div className="flex justify-center mt-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00D4AA] flex items-center justify-center text-xs font-bold text-white cursor-pointer">{initials}</div>
          </div>
        )}
      </div>
    </aside>
  )
}
