'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Users, Ticket, TrendingUp, DollarSign, Clock,
  Calendar, BarChart3
} from 'lucide-react'
import { adminService } from '@/services/admin.service'
import { useAuthStore } from '@/store/auth.store'
import { formatCurrency, formatNumber, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { GlassCard } from '@/components/ui/GlassCard'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

function StatCard({ label, value, icon: Icon, color, change }: {
  label: string; value: string | number; icon: any; color: string; change?: string
}) {
  return (
    <GlassCard hover>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {change && (
          <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full">
            {change}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-slate-500 dark:text-white/50">{label}</p>
    </GlassCard>
  )
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !user?.is_admin) {
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  const { data: dashData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminService.getDashboard().then((r) => r.data.data),
    enabled: !!user?.is_admin,
    refetchInterval: 60000,
  })

  const overview = dashData?.overview
  const recentBookings = dashData?.recent_bookings ?? []
  const revenueTrend = dashData?.revenue_trend ?? []

  if (!user?.is_admin) return null

  const stats = overview
    ? [
        {
          label: 'Нийт хэрэглэгч',
          value: formatNumber(overview.total_users),
          icon: Users,
          color: 'bg-primary-600',
          change: `+${overview.new_users_7d} долоо хоногт`,
        },
        {
          label: 'Нийтлэгдсэн арга хэмжээ',
          value: formatNumber(overview.published_events),
          icon: Calendar,
          color: 'bg-emerald-600',
        },
        {
          label: 'Нийт захиалга',
          value: formatNumber(overview.total_bookings),
          icon: Ticket,
          color: 'bg-accent-600',
        },
        {
          label: 'Хүлээгдэж буй төлбөр',
          value: overview.pending_payments,
          icon: Clock,
          color: 'bg-amber-600',
        },
        {
          label: 'Нийт орлого',
          value: formatCurrency(overview.total_revenue),
          icon: DollarSign,
          color: 'bg-cyan-600',
        },
        {
          label: 'Сарын орлого',
          value: formatCurrency(overview.monthly_revenue),
          icon: TrendingUp,
          color: 'bg-violet-600',
        },
      ]
    : []

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Толгой хэсэг */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Админ самбар</h1>
          <p className="text-slate-500 dark:text-white/40 mt-1">Тавтай морилно уу, {user.first_name}. Ерөнхий тоймтой танилцана уу.</p>
        </motion.div>

        {/* Хурдан холбоосууд */}
        <div className="flex gap-3 flex-wrap">
          {[
            { href: '/admin/events', label: 'Арга хэмжээ удирдах', icon: Calendar },
            { href: '/admin/bookings', label: 'Захиалгууд', icon: Ticket },
            { href: '/admin/payments', label: 'Төлбөрүүд', icon: DollarSign },
            { href: '/admin/users', label: 'Хэрэглэгчид', icon: Users },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all text-sm text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white">
                <Icon size={15} /> {label}
              </div>
            </Link>
          ))}
        </div>

        {/* Статистик сараачлал */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-3xl bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        )}

        {/* Орлогын график */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Орлого — Сүүлийн 7 хоног</h2>
            {revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    tickFormatter={(v) => formatDate(v, 'MMM d')}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    tickFormatter={(v) => `${v.toLocaleString()}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,23,42,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(v: number) => [formatCurrency(v), 'Орлого']}
                    labelFormatter={(l) => formatDate(l, 'MMMM dd, yyyy')}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#revGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-slate-300 dark:text-white/20">
                <BarChart3 size={40} />
              </div>
            )}
          </GlassCard>

          {/* Захиалгын статус */}
          <GlassCard>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Захиалгын статус</h2>
            {dashData?.bookings_by_status && (
              <div className="space-y-3">
                {Object.entries(dashData.bookings_by_status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                    <span className="text-slate-900 dark:text-white font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Сүүлийн захиалгууд */}
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Сүүлийн захиалгууд</h2>
            <Link href="/admin/bookings" className="text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors">
              Бүгдийг харах →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/8 dark:border-white/8">
                  {['Лавлагаа', 'Хэрэглэгч', 'Арга хэмжээ', 'Дүн', 'Статус', 'Огноо'].map((h) => (
                    <th key={h} className="text-left pb-3 text-slate-400 dark:text-white/40 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="space-y-2">
                {recentBookings.map((booking: any) => (
                  <tr key={booking.reference} className="border-b border-black/5 dark:border-white/5 hover:bg-black/3 dark:hover:bg-white/3">
                    <td className="py-3 font-mono text-primary-500 dark:text-primary-400 text-xs">{booking.reference}</td>
                    <td className="py-3 text-slate-600 dark:text-white/70">{booking.user}</td>
                    <td className="py-3 text-slate-600 dark:text-white/70 max-w-[180px] truncate">{booking.event}</td>
                    <td className="py-3 text-slate-900 dark:text-white font-medium">{formatCurrency(booking.amount)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 dark:text-white/40 text-xs">{formatDate(booking.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentBookings.length === 0 && (
              <p className="text-center text-slate-400 dark:text-white/30 py-8">Сүүлийн захиалга байхгүй байна</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
