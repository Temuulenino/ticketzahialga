'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Lock, Moon } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import api, { getApiErrorMessage } from '@/services/api'
import { changePasswordSchema, ChangePasswordInput } from '@/lib/validations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onChangePassword = async (data: ChangePasswordInput) => {
    setIsChangingPassword(true)
    try {
      await api.post('/users/change-password/', data)
      toast.success('Нууц үг амжилттай солигдлоо')
      reset()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Тохиргоо</h1>
          <p className="text-slate-500 dark:text-white/40 mt-1">Бүртгэлийн тохиргоогоо удирдах</p>
        </div>

        {/* Нууц үг солих */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center">
              <Lock size={18} className="text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Нууц үг солих</h2>
              <p className="text-sm text-slate-500 dark:text-white/40">Бүртгэлийн нууц үгээ шинэчлэх</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <Input
              {...register('old_password')}
              label="Одоогийн нууц үг"
              type="password"
              placeholder="Одоогийн нууц үгийг оруулна уу"
              error={errors.old_password?.message}
              required
            />
            <Input
              {...register('new_password')}
              label="Шинэ нууц үг"
              type="password"
              placeholder="Хамгийн багадаа 8 тэмдэгт"
              error={errors.new_password?.message}
              required
              hint="Томоор бичсэн үсэг болон тоо агуулсан байх ёстой"
            />
            <Input
              {...register('confirm_password')}
              label="Шинэ нууц үг давтах"
              type="password"
              placeholder="Шинэ нууц үгийг давтан оруулна уу"
              error={errors.confirm_password?.message}
              required
            />
            <Button type="submit" variant="primary" isLoading={isChangingPassword}>
              Нууц үг шинэчлэх
            </Button>
          </form>
        </GlassCard>

        {/* Гадаад байдал */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-slate-500/15 border border-slate-500/20 flex items-center justify-center">
              <Moon size={18} className="text-slate-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Гадаад байдал</h2>
              <p className="text-sm text-slate-500 dark:text-white/40">Харагдах байдлаа тохируулах</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-900 dark:text-white font-medium">Дүр</p>
              <p className="text-sm text-slate-500 dark:text-white/40">Харанхуй болон тод дүрийг солих</p>
            </div>
            <div className="flex gap-2">
              {[
                { value: 'dark', label: 'Харанхуй' },
                { value: 'light', label: 'Тод' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    theme === value
                      ? 'bg-primary-500/20 border-primary-500/40 text-primary-600 dark:text-primary-400'
                      : 'border-black/10 dark:border-white/10 text-slate-500 dark:text-white/50 hover:border-black/20 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
