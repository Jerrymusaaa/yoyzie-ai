'use client'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useUIStore } from '@/store/ui.store'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-brand-navy">
      <Sidebar />
      <Topbar title={title} />
      <main className={cn(
        'pt-16 min-h-screen transition-all duration-300',
        sidebarOpen ? 'ml-60' : 'ml-16'
      )}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
