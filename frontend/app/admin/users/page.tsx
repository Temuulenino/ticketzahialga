'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import { useAuthStore } from '@/store/auth.store'
import { formatDate, getInitials } from '@/lib/utils'
import { GlassCard } from '@/components/ui/GlassCard'
import { Search, ShieldCheck, ShieldOff } from 'lucide-react'

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !user?.is_admin) router.push('/')
  }, [isAuthenticated, user, router])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => adminService.getUsers({ search, role: roleFilter || undefined }).then((r) => r.data.data),
    enabled: !!user?.is_admin,
  })

  const users = data?.results ?? []

  const roleColors: Record<string, string> = {
    user: 'text-slate-500 dark:text-white/60 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10',
    admin: 'text-primary-600 dark:text-primary-400 bg-primary-400/10 border-primary-400/20',
    super_admin: 'text-amber-600 dark:text-amber-400 bg-amber-400/10 border-amber-400/20',
  }

  const roleFilters = [
    { value: '', label: 'Бүгд' },
    { value: 'user', label: 'Хэрэглэгч' },
    { value: 'admin', label: 'Админ' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Хэрэглэгчид</h1>
          <p className="text-slate-500 dark:text-white/40">Нийт {data?.count ?? 0} бүртгэлтэй хэрэглэгч</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Хэрэглэгч хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/40 w-64"
            />
          </div>
          <div className="flex gap-2">
            {roleFilters.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setRoleFilter(value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  roleFilter === value
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
                  {['Хэрэглэгч', 'Имэйл', 'Үүрэг', 'Баталгаажсан', 'Идэвхтэй', 'Бүртгүүлсэн'].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-slate-400 dark:text-white/40 font-medium text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" /></td></tr>
                    ))
                  : users.map((u: any) => (
                      <tr key={u.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/3 dark:hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {getInitials(u.full_name || u.email)}
                            </div>
                            <span className="text-slate-900 dark:text-white font-medium">{u.full_name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-white/60">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${roleColors[u.role] ?? ''}`}>
                            {u.role === 'super_admin' ? 'Супер Админ' : u.role === 'admin' ? 'Админ' : 'Хэрэглэгч'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.is_verified
                            ? <ShieldCheck size={16} className="text-emerald-400" />
                            : <ShieldOff size={16} className="text-red-400/60" />}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${u.is_active ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                            {u.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 dark:text-white/40 text-xs">{formatDate(u.date_joined)}</td>
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
