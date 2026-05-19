'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Phone, Ticket, ArrowRight } from 'lucide-react'
import { registerSchema, RegisterInput } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import { getApiErrorMessage } from '@/services/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const { setPendingEmail } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    try {
      await registerUser(data)
      setPendingEmail(data.email)
      toast.success('Бүртгэл амжилттай! Имэйл дээрх OTP кодоо шалгана уу.')
      router.push('/verify-otp')
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-primary-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-accent-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <Ticket size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">TicketPro</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6 mb-2">Бүртгэл үүсгэх</h1>
          <p className="text-slate-500 dark:text-white/40">Олон мянган үзэгчдийн нэгдэл</p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                {...register('first_name')}
                label="Нэр"
                placeholder="Бат"
                leftIcon={<User size={15} />}
                error={errors.first_name?.message}
                required
              />
              <Input
                {...register('last_name')}
                label="Овог"
                placeholder="Болд"
                leftIcon={<User size={15} />}
                error={errors.last_name?.message}
                required
              />
            </div>

            <Input
              {...register('email')}
              label="Имэйл хаяг"
              type="email"
              placeholder="ta@example.com"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              required
              autoComplete="email"
            />

            <Input
              {...register('phone')}
              label="Утасны дугаар"
              type="tel"
              placeholder="+976 9XXX XXXX"
              leftIcon={<Phone size={15} />}
              error={errors.phone?.message}
            />

            <Input
              {...register('password')}
              label="Нууц үг"
              type="password"
              placeholder="Хамгийн багадаа 8 тэмдэгт"
              leftIcon={<Lock size={15} />}
              error={errors.password?.message}
              required
              hint="Томоор бичсэн үсэг болон тоо агуулсан байх ёстой"
            />

            <Input
              {...register('confirm_password')}
              label="Нууц үг давтах"
              type="password"
              placeholder="Нууц үгээ давтан оруулна уу"
              leftIcon={<Lock size={15} />}
              error={errors.confirm_password?.message}
              required
            />

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} className="mt-2">
              Бүртгэл үүсгэх <ArrowRight size={16} />
            </Button>
          </form>

          <p className="mt-4 text-xs text-slate-400 dark:text-white/30 text-center">
            Бүртгүүлснээр та манай{' '}
            <Link href="#" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300">Үйлчилгээний нөхцөл</Link> болон{' '}
            <Link href="#" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300">Нууцлалын бодлого</Link>-г зөвшөөрч байна
          </p>

          <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10 text-center">
            <p className="text-slate-500 dark:text-white/50 text-sm">
              Бүртгэлтэй юу?{' '}
              <Link href="/login" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-medium transition-colors">
                Нэвтрэх
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
