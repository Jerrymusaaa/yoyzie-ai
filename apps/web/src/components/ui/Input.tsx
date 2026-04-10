import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-white/70">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5 rounded-lg text-sm text-white',
            'bg-white/5 border border-white/10',
            'placeholder:text-white/30',
            'focus:outline-none focus:border-brand-blue focus:bg-white/8',
            'transition-all duration-200',
            error && 'border-red-500/50 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
