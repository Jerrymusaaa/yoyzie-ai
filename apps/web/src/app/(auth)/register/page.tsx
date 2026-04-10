'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  accountCategory: z.enum(['INDIVIDUAL', 'INFLUENCER', 'BUSINESS']),
  accountType: z.string().min(1, 'Please select an account type'),
})

type FormData = z.infer<typeof schema>

const accountTypes: Record<string, { label: string; types: { value: string; label: string }[] }> = {
  INDIVIDUAL: {
    label: 'Individual',
    types: [
      { value: 'INDIVIDUAL_PRO', label: 'Individual Pro' },
      { value: 'CREATOR', label: 'Creator' },
      { value: 'POWER_USER', label: 'Power User' },
    ],
  },
  INFLUENCER: {
    label: 'Influencer',
    types: [
      { value: 'INFLUENCER_FREE', label: 'Free Influencer' },
      { value: 'INFLUENCER_STARTER', label: 'Influencer Starter' },
      { value: 'INFLUENCER_PRO', label: 'Influencer Pro' },
      { value: 'CREATOR_MODE', label: 'Creator Mode' },
    ],
  },
  BUSINESS: {
    label: 'Business',
    types: [
      { value: 'SME', label: 'SME / Small Business' },
      { value: 'GROWING_BUSINESS', label: 'Growing Business' },
      { value: 'ENTERPRISE', label: 'Enterprise' },
    ],
  },
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const category = watch('accountCategory')

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-brand-blue" size={28} />
            <span className="font-display font-bold text-2xl text-white">
              Yoyzie <span className="text-brand-blue">AI.</span>
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Create your account</h2>
          <p className="text-white/50 text-sm">Kenya&apos;s #1 social media intelligence platform</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
            <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="At least 8 characters" error={errors.password?.message} {...register('password')} />

            <div>
              <label className="text-sm font-medium text-white/70 mb-2 block">Account category</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(accountTypes).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setValue('accountCategory', key as any)
                      setValue('accountType', '')
                      setSelectedCategory(key)
                    }}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
                      category === key
                        ? 'bg-brand-blue/20 border-brand-blue text-brand-blue'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
              {errors.accountCategory && <p className="text-xs text-red-400 mt-1">{errors.accountCategory.message}</p>}
            </div>

            {category && (
              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Account type</label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-brand-blue"
                  {...register('accountType')}
                >
                  <option value="" className="bg-gray-900">Select type...</option>
                  {accountTypes[category]?.types.map((t) => (
                    <option key={t.value} value={t.value} className="bg-gray-900">{t.label}</option>
                  ))}
                </select>
                {errors.accountType && <p className="text-xs text-red-400 mt-1">{errors.accountType.message}</p>}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-center text-white/40 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-blue hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
