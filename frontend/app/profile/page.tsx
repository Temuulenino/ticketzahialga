'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { User, Camera, Ticket } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import api from '@/services/api'
import { bookingsService } from '@/services/bookings.service'
import { profileSchema, ProfileInput } from '@/lib/validations'
import { getApiErrorMessage } from '@/services/api'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { BookingListItem } from '@/types/booking.types'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getInitials } from '@/lib/utils'

export default function ProfilePage() {
  const { user, updateUser, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'profile'
  const [isSaving, setIsSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: () => bookingsService.getUserBookings().then((r) => r.data.data),
    enabled: activeTab === 'bookings' && isAuthenticated,
  })

  const bookings: BookingListItem[] = bookingsData?.results ?? []

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      phone: user?.phone ?? '',
      bio: user?.bio ?? '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({ first_name: user.first_name, last_name: user.last_name, phone: user.phone, bio: user.bio })
    }
  }, [user, reset])

  const onSave = async (data: ProfileInput) => {
    setIsSaving(true)
    try {
      const res = await api.patch('/users/profile/', data)
      updateUser(res.data.data)
      toast.success('Профайл амжилттай шинэчлэгдлээ')
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      const res = await api.patch('/users/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updateUser(res.data.data)
      toast.success('Зураг шинэчлэгдлээ')
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const tabs = [
    { id: 'profile', label: 'Профайл', icon: User },
    { id: 'bookings', label: 'Захиалгууд', icon: Ticket },
  ]

  if (!user) return null

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Толгой хэсэг */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
              {avatarPreview || user.avatar_url ? (
                <img src={avatarPreview ?? user.avatar_url!} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{getInitials(user.full_name || user.email)}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center cursor-pointer hover:bg-primary-400 transition-colors shadow-lg">
              <Camera size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.full_name}</h1>
            <p className="text-slate-500 dark:text-white/50">{user.email}</p>
            <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-500/15 text-primary-500 dark:text-primary-400 border border-primary-500/25 capitalize">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Табууд */}
        <div className="flex gap-1 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 mb-6 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Link key={id} href={`/profile?tab=${id}`}>
              <button
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-white/80 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            </Link>
          ))}
        </div>

        {/* Профайл таб */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard className="max-w-xl">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">Профайл засах</h2>
              <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input {...register('first_name')} label="Нэр" error={errors.first_name?.message} />
                  <Input {...register('last_name')} label="Овог" error={errors.last_name?.message} />
                </div>
                <Input {...register('phone')} label="Утасны дугаар" type="tel" placeholder="+976 9XXX XXXX" error={errors.phone?.message} />
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-white/80 mb-1.5 block">Танилцуулга</label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    placeholder="Өөрийнхөө тухай бичнэ үү..."
                    className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/50 resize-none text-sm transition-all"
                  />
                  {errors.bio && <p className="text-xs text-red-400 mt-1">{errors.bio.message}</p>}
                </div>
                <div className="pt-1">
                  <p className="text-sm text-slate-500 dark:text-white/40 mb-1">Имэйл хаяг</p>
                  <p className="text-slate-900 dark:text-white font-medium">{user.email}</p>
                  <p className="text-xs text-slate-400 dark:text-white/30 mt-1">Имэйл хаягийг өөрчлөх боломжгүй</p>
                </div>
                <Button type="submit" variant="primary" isLoading={isSaving}>
                  Хадгалах
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* Захиалгын таб */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Миний захиалгууд</h2>
            {bookingsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <GlassCard className="text-center py-12">
                <Ticket size={40} className="text-slate-300 dark:text-white/20 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-white/40">Захиалга байхгүй байна</p>
                <Link href="/events">
                  <Button variant="primary" size="sm" className="mt-4">Арга хэмжээ харах</Button>
                </Link>
              </GlassCard>
            ) : (
              bookings.map((booking) => (
                <GlassCard key={booking.id} hover className="!p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{booking.event_title}</p>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-white/50">{booking.event_venue} · {formatDate(booking.event_start_date)}</p>
                      <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">
                        {booking.quantity}× {booking.ticket_type_name} · {formatCurrency(booking.total_amount)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-xs text-primary-500 dark:text-primary-400">{booking.reference}</p>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
