import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'KES'): string {
  return `${currency} ${amount.toLocaleString('en-KE')}`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    INSTAGRAM: '#E1306C',
    TIKTOK: '#69C9D0',
    LINKEDIN: '#0077B5',
    TWITTER: '#1DA1F2',
    FACEBOOK: '#1877F2',
    YOUTUBE: '#FF0000',
  }
  return colors[platform] || '#0066FF'
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    INSTAGRAM: '📸',
    TIKTOK: '🎵',
    LINKEDIN: '💼',
    TWITTER: '🐦',
    FACEBOOK: '👥',
    YOUTUBE: '▶️',
  }
  return icons[platform] || '📱'
}
