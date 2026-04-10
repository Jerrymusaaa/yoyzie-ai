'use client'
import { Bell, Search, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { authApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function Topbar({ title }: { title?: string }) {
  const { user, clearAuth } = useAuthStore()
  const { sidebarOpen } = useUIStore()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authApi.post('/api/v1/auth/logout')
    } catch {}
    clearAuth()
    router.push('/login')
    toast.success('Logged out successfully')
  }

  return (
    <header className={`fixed top-0 right-0 z-30 h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#050A14]/90 backdrop-blur-sm transition-all duration-300 ${sidebarOpen ? 'left-60' : 'left-16'}`}>
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="font-display font-semibold text-white text-lg">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            placeholder="Search..."
            className="w-56 pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-brand-blue"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-orange rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
