import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  iconColor?: string
  className?: string
}

export function StatCard({
  title, value, change, changeType = 'neutral', icon: Icon, iconColor = 'text-brand-blue', className
}: StatCardProps) {
  return (
    <div className={cn('glass rounded-xl p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-sm mb-1">{title}</p>
          <p className="text-2xl font-display font-bold text-white">{value}</p>
          {change && (
            <p className={cn('text-xs mt-1', {
              'text-green-400': changeType === 'up',
              'text-red-400': changeType === 'down',
              'text-white/40': changeType === 'neutral',
            })}>
              {changeType === 'up' && '↑ '}
              {changeType === 'down' && '↓ '}
              {change}
            </p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg bg-white/5', iconColor)}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}
