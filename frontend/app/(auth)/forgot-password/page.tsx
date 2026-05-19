'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Mail, Ticket, ArrowLeft } from 'lucide-react'
import { forgotPasswordSchema, ForgotPasswordInput } from '@/lib/validations'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { getApiErrorMessage } from '@/services/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { setPendingEmail } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setPendingEmail(data.email)
      setSent(true)
      toast.success('Бүртгэл байгаа бол OTP илгээгдлээ')
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <Ticket size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">TicketPro</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6 mb-2">Нууц үг сэргээх</h1>
          <p className="text-slate-500 dark:text-white/40">Нууц үг солих OTP код илгээнэ</p>
        </div>

        <GlassCard>
          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register('email')}
                label="Имэйл хаяг"
                type="email"
                placeholder="ta@example.com"
                leftIcon={<Mail size={16} />}
                error={errors.email?.message}
                required
              />
              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                OTP илгээх
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <p className="text-slate-900 dark:text-white font-medium mb-2">Имэйлээ шалгана уу!</p>
              <p className="text-slate-500 dark:text-white/50 text-sm mb-5">
                OTP код <span className="text-primary-500 dark:text-primary-400">{getValues('email')}</span> хаяг руу илгээгдлээ
              </p>
              <Button
                onClick={() => router.push('/verify-otp')}
                variant="primary"
                fullWidth
              >
                OTP оруулах
              </Button>
            </div>
          )}

          <div className="mt-5 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 transition-colors">
              <ArrowLeft size={14} /> Нэвтрэх хуудас руу буцах
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
