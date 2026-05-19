'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { eventsService } from '@/services/events.service'
import { useAuthStore } from '@/store/auth.store'
import { getApiErrorMessage } from '@/services/api'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { AdminEventForm } from '@/components/admin/AdminEventForm'

export default function AdminEventsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!isAuthenticated || !user?.is_admin) router.push('/')
  }, [isAuthenticated, user, router])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', search, page],
    queryFn: () => eventsService.adminGetEvents({ search, page }).then((r) => r.data.data),
    enabled: !!user?.is_admin,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsService.adminDeleteEvent(id),
    onSuccess: () => {
      toast.success('Арга хэмжээ устгагдлаа')
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  const events = data?.results ?? []

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Арга хэмжээнүүд</h1>
            <p className="text-slate-500 dark:text-white/40">Нийт {data?.count ?? 0} арга хэмжээ</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            <Plus size={16} /> Арга хэмжээ нэмэх
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" />
          <input
            type="text"
            placeholder="Арга хэмжээ хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-full rounded-2xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/40"
          />
        </div>

        <GlassCard noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/8 dark:border-white/8">
                  {['Гарчиг', 'Ангилал', 'Огноо', 'Газар', 'Тасалбар', 'Статус', 'Үйлдэл'].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-slate-400 dark:text-white/40 font-medium text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-black/5 dark:border-white/5">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="h-4 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />
                        </td>
                      </tr>
                    ))
                  : events.map((event: any) => (
                      <tr key={event.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/3 dark:hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 text-slate-900 dark:text-white font-medium max-w-[200px] truncate">{event.title}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-white/60">{event.category?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-white/60 whitespace-nowrap">{formatDate(event.start_date)}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-white/60 max-w-[150px] truncate">{event.venue}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-white/60">{event.available_tickets}/{event.total_capacity}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                            {getStatusLabel(event.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingEvent(event)}
                              className="p-1.5 rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-black/8 dark:hover:bg-white/10 transition-all"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Энэ арга хэмжээг устгах уу?')) {
                                  deleteMutation.mutate(event.id)
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
            {!isLoading && events.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 dark:text-white/30">Арга хэмжээ олдсонгүй</p>
              </div>
            )}
          </div>
        </GlassCard>

        <Modal
          isOpen={showCreateModal || !!editingEvent}
          onClose={() => { setShowCreateModal(false); setEditingEvent(null) }}
          title={editingEvent ? 'Арга хэмжээ засах' : 'Арга хэмжээ нэмэх'}
          size="xl"
        >
          <AdminEventForm
            event={editingEvent}
            onSuccess={() => {
              setShowCreateModal(false)
              setEditingEvent(null)
              queryClient.invalidateQueries({ queryKey: ['admin-events'] })
              toast.success(editingEvent ? 'Арга хэмжээ шинэчлэгдлээ' : 'Арга хэмжээ үүсгэгдлээ')
            }}
          />
        </Modal>
      </div>
    </div>
  )
}
