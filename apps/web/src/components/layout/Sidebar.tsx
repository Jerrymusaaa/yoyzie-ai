'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import {
  LayoutDashboard, PenSquare, Calendar, BarChart2,
  Megaphone, Wallet, TrendingUp, Settings, Users,
  Bot, CreditCard, Bell, ChevronLeft, ChevronRight,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/content', label: 'Content Studio', icon: PenSquare },
  { href: '/dashboard/schedule', label: 'Scheduler', icon: Calendar },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/dashboard/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/dashboard/influencers', label: 'Influencers', icon: Users },
  { href: '/dashboard/trends', label: 'Trends', icon: TrendingUp },
  { href: '/dashboard/ai-chat', label: 'AI Assistant', icon: Bot },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full z-40 flex flex-col',
      'bg-[#080f1f] border-r border-white/5',
      'transition-all duration-300',
      sidebarOpen ? 'w-60' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
        {sidebarOpen && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="text-brand-blue" size={20} />
            <span className="font-display font-bold text-white">
              Yoyzie <span className="text-brand-blue">AI.</span>
            </span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-0.5',
                'transition-all duration-200 group',
                isActive
                  ? 'bg-brand-blue/20 text-brand-blue'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      {sidebarOpen && user && (
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue text-sm font-bold shrink-0">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-white/40 truncate">{user.accountType?.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
