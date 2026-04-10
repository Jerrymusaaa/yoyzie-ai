'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  accountCategory: z.enum(['INDIVIDUAL', 'INFLUENCER', 'BUSINESS']),
  accountType: z.string().min(1, 'Please select an account type'),
})
type FormData = z.infer<typeof schema>

const ACCOUNT_TYPES: Record<string, { label: string; types: { value: string; label: string; desc: string }[] }> = {
  INDIVIDUAL: {
    label: 'Individual',
    types: [
      { value: 'INDIVIDUAL_PRO', label: 'Individual Pro', desc: 'Solo creators & bloggers' },
      { value: 'CREATOR', label: 'Creator', desc: 'Serious content creators' },
      { value: 'POWER_USER', label: 'Power User', desc: 'Run your own campaigns' },
    ],
  },
  INFLUENCER: {
    label: 'Influencer',
    types: [
      { value: 'INFLUENCER_FREE', label: 'Free', desc: 'Get started — 25% commission' },
      { value: 'INFLUENCER_STARTER', label: 'Starter', desc: '20% commission rate' },
      { value: 'INFLUENCER_PRO', label: 'Pro', desc: '15% commission rate' },
      { value: 'CREATOR_MODE', label: 'Creator Mode', desc: '10% commission + instant payouts' },
    ],
  },
  BUSINESS: {
    label: 'Business',
    types: [
      { value: 'SME', label: 'SME', desc: 'Small businesses & startups' },
      { value: 'GROWING_BUSINESS', label: 'Growing Business', desc: 'Scale your marketing team' },
      { value: 'ENTERPRISE', label: 'Enterprise', desc: 'Large organizations' },
    ],
  },
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const category = watch('accountCategory')
  const accountType = watch('accountType')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await authApi.post('/api/v1/auth/register', data)
      toast.success('Account created! Please check your email to verify.')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-white/40 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0066FF] hover:text-[#3385FF] transition-colors font-medium">Sign in</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Full name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input type="text" placeholder="Your full name" {...register('name')} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 outline-none focus:border-[#0066FF]/50 focus:bg-white/[0.06] transition-all" />
          </div>
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input type="email" placeholder="you@company.com" {...register('email')} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 outline-none focus:border-[#0066FF]/50 focus:bg-white/[0.06] transition-all" />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input type="password" placeholder="At least 8 characters" {...register('password')} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 outline-none focus:border-[#0066FF]/50 focus:bg-white/[0.06] transition-all" />
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">I am a...</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(ACCOUNT_TYPES).map(([key, val]) => (
              <button key={key} type="button" onClick={() => { setValue('accountCategory', key as any); setValue('accountType', '') }}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${category === key ? 'bg-[#0066FF]/15 border-[#0066FF]/40 text-white' : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/20'}`}>
                {val.label}
              </button>
            ))}
          </div>
          {errors.accountCategory && <p className="text-xs text-red-400 mt-1">{errors.accountCategory.message}</p>}
        </div>

        {category && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Account type</label>
            <div className="space-y-2">
              {ACCOUNT_TYPES[category]?.types.map(t => (
                <button key={t.value} type="button" onClick={() => setValue('accountType', t.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm border transition-all text-left ${accountType === t.value ? 'bg-[#0066FF]/15 border-[#0066FF]/40 text-white' : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:border-white/20'}`}>
                  <span className="font-medium">{t.label}</span>
                  <span className="text-xs text-white/30">{t.desc}</span>
                </button>
              ))}
            </div>
            {errors.accountType && <p className="text-xs text-red-400 mt-1">{errors.accountType.message}</p>}
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full rounded-xl">
          {!loading && <>Create account <ArrowRight className="w-4 h-4" /></>}
        </Button>
      </form>

      <p className="text-center text-xs text-white/25 mt-6">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="text-white/40 hover:text-white/60 underline underline-offset-2">Terms</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-white/40 hover:text-white/60 underline underline-offset-2">Privacy Policy</Link>
      </p>
    </div>
  )
}
