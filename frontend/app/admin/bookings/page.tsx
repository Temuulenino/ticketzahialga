'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { bookingsService } from '@/services/bookings.service'
import { useAuthStore } from '@/store/auth.store'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { GlassCard } from '@/components/ui/GlassCard'
import { Search } from 'lucide-react'

export default function AdminBookingsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !user?.is_admin) router.push('/')
  }, [isAuthenticated, user, router])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', search, statusFilter],
    queryFn: () => bookingsService.adminGetBookings({ search, status: statusFilter || undefined }).then((r) => r.data.data),
    enabled: !!user?.is_admin,
  })

  const bookings = data?.results ?? []

  const statusFilters = [
    { value: '', label: 'Бүгд' },
    { value: 'pending', label: 'Хүлээгдэж байна' },
    { value: 'payment_uploaded', label: 'Төлбөр илгээгдсэн' },
    { value: 'confirmed', label: 'Баталгаажсан' },
    { value: 'cancelled', label: 'Цуцлагдсан' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Бүх захиалгууд</h1>
          <p className="text-slate-500 dark:text-white/40">Нийт {data?.count ?? 0} захиалга</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Лавлагаа эсвэл хэрэглэгчээр хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/40 w-64"
            />
          </div>
          <div className="flex gap-2">
            {statusFilters.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  statusFilter === value
                    ? 'bg-primary-500/20 border-primary-500/40 text-primary-600 dark:text-primary-400'
                    : 'border-black/10 dark:border-white/10 text-slate-500 dark:text-white/50 hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <GlassCard noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/8 dark:border-white/8">
                  {['Лавлагаа', 'Хэрэглэгч', 'Арга хэмжээ', 'Тоо', 'Дүн', 'Статус', 'Огноо'].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-slate-400 dark:text-white/40 font-medium text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" /></td></tr>
                    ))
                  : bookings.map((b: any) => (
                      <tr key={b.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/3 dark:hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 font-mono text-primary-500 dark:text-primary-400 text-xs">{b.reference}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-white/70">{b.user_email}</td>
                        <td className="px-4 py-3 text-slate-900 dark:text-white max-w-[180px] truncate">{b.event_title}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-white/60">{b.quantity}</td>
                        <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{formatCurrency(b.total_amount, b.currency)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(b.status)}`}>
                            {getStatusLabel(b.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 dark:text-white/40 text-xs">{formatDate(b.created_at)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
