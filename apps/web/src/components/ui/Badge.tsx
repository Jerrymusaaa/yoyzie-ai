import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'blue' | 'teal' | 'orange' | 'green' | 'red' | 'gray'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'blue', size = 'sm', className }: BadgeProps) {
  const variants = {
    blue: 'bg-brand-blue/20 text-brand-blue border-brand-blue/30',
    teal: 'bg-brand-teal/20 text-brand-teal border-brand-teal/30',
    orange: 'bg-brand-orange/20 text-brand-orange border-brand-orange/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    gray: 'bg-white/10 text-white/60 border-white/20',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  )
}
