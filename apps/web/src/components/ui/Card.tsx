import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  glow?: 'blue' | 'teal' | 'orange' | 'none'
}

export function Card({ children, className, glow = 'none' }: CardProps) {
  const glows = {
    blue: 'glow-blue',
    teal: 'glow-teal',
    orange: 'shadow-[0_0_20px_rgba(255,107,53,0.15)]',
    none: '',
  }

  return (
    <div className={cn('glass rounded-xl p-5', glows[glow], className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('font-display font-semibold text-white', className)}>
      {children}
    </h3>
  )
}
