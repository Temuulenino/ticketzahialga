'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Mail, Lock, Ticket, ArrowRight } from 'lucide-react'
import { loginSchema, LoginInput } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import { getApiErrorMessage } from '@/services/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const { login } = useAuth()
  const { setPendingEmail } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      const user = await login(data)
      toast.success(`Тавтай морилно уу, ${user.first_name}!`)
      router.push(redirect)
    } catch (err: any) {
      const errData = err?.response?.data
      if (errData?.errors?.requires_verification) {
        setPendingEmail(errData.errors.email)
        toast.error('Эхлээд имэйлээ баталгаажуулна уу.')
        router.push('/verify-otp')
        return
      }
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-primary-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-accent-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <Ticket size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">TicketPro</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6 mb-2">Тавтай морилно уу</h1>
          <p className="text-slate-500 dark:text-white/40">Бүртгэлдээ нэвтрэх</p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              {...register('email')}
              label="Имэйл хаяг"
              type="email"
              placeholder="ta@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              required
              autoComplete="email"
            />

            <Input
              {...register('password')}
              label="Нууц үг"
              type="password"
              placeholder="Нууц үгээ оруулна уу"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              required
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
              >
                Нууц үг мартсан уу?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
              Нэвтрэх <ArrowRight size={16} />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10 text-center">
            <p className="text-slate-500 dark:text-white/50 text-sm">
              Бүртгэл байхгүй юу?{' '}
              <Link href="/register" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-medium transition-colors">
                Бүртгүүлэх
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
