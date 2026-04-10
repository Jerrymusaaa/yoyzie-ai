'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setApiError('')
    try {
      const res = await authApi.post('/api/v1/auth/login', data)
      const { user, accessToken } = res.data.data
      setUser(user, accessToken)
      toast.success(`Welcome back, ${user.name}!`)
      router.push('/dashboard')
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const googleAuthUrl = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/v1/auth/google`

  return (
    <div>
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-white/40 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#0066FF] hover:text-[#3385FF] transition-colors font-medium">Sign up free</Link>
        </p>
      </div>

      {/* Google */}
      <a href={googleAuthUrl} className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.08] hover:border-white/[0.15] transition-all mb-6">
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </a>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-xs text-white/25">or continue with email</span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

      {apiError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{apiError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input type="email" placeholder="you@company.com" {...register('email')} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 outline-none focus:border-[#0066FF]/50 focus:bg-white/[0.06] transition-all" />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-white/70">Password</label>
            <Link href="/forgot-password" className="text-xs text-[#0066FF] hover:text-[#3385FF] transition-colors">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 outline-none focus:border-[#0066FF]/50 focus:bg-white/[0.06] transition-all" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full rounded-xl mt-2">
          {!loading && <>Sign in <ArrowRight className="w-4 h-4" /></>}
        </Button>
      </form>

      <p className="text-center text-xs text-white/25 mt-6">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="text-white/40 hover:text-white/60 underline underline-offset-2">Terms</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-white/40 hover:text-white/60 underline underline-offset-2">Privacy Policy</Link>
      </p>
    </div>
  )
}
