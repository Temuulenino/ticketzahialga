'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { paymentsService } from '@/services/payments.service'
import { useAuthStore } from '@/store/auth.store'
import { getApiErrorMessage } from '@/services/api'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import Image from 'next/image'

export default function AdminPaymentsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !user?.is_admin) router.push('/')
  }, [isAuthenticated, user, router])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', statusFilter],
    queryFn: () => paymentsService.adminGetPayments({ status: statusFilter || undefined }).then((r) => r.data.data),
    enabled: !!user?.is_admin,
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: string; action: 'approve' | 'reject'; notes: string }) =>
      paymentsService.adminReviewPayment(id, { action, admin_notes: notes }),
    onSuccess: (_, { action }) => {
      toast.success(`Төлбөр ${action === 'approve' ? 'зөвшөөрөгдлөө' : 'татгалзагдлаа'}`)
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      setSelectedPayment(null)
      setAdminNotes('')
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  const payments = data?.results ?? []

  const statusLabels: Record<string, string> = {
    '': 'Бүгд',
    pending: 'Хүлээгдэж байна',
    approved: 'Зөвшөөрөгдсөн',
    rejected: 'Татгалзсан',
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Төлбөр баталгаажуулах</h1>
            <p className="text-slate-500 dark:text-white/40">{data?.count ?? 0} төлбөр</p>
          </div>
        </div>

        {/* Статусын шүүлт */}
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                statusFilter === s
                  ? 'bg-primary-500/20 border-primary-500/40 text-primary-600 dark:text-primary-400'
                  : 'border-black/10 dark:border-white/10 text-slate-500 dark:text-white/50 hover:border-black/20 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white/80'
              }`}
            >
              {statusLabels[s] ?? getStatusLabel(s)}
            </button>
          ))}
        </div>

        <GlassCard noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/8 dark:border-white/8">
                  {['Захиалгын лавлагаа', 'Хэрэглэгч', 'Дүн', 'Арга', 'Гүйлгээний лавлагаа', 'Статус', 'Огноо', 'Үйлдэл'].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-slate-400 dark:text-white/40 font-medium text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" /></td></tr>
                    ))
                  : payments.map((payment: any) => (
                      <tr key={payment.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/3 dark:hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 font-mono text-primary-500 dark:text-primary-400 text-xs">{payment.booking_reference}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-white/70">{payment.user_email}</td>
                        <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{formatCurrency(payment.amount, payment.currency)}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-white/60 capitalize">{payment.method.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-slate-400 dark:text-white/40 font-mono text-xs">{payment.transaction_reference || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                            {getStatusLabel(payment.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 dark:text-white/40 text-xs whitespace-nowrap">{formatDate(payment.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedPayment(payment)}
                              className="p-1.5 rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-black/8 dark:hover:bg-white/10 transition-all"
                              title="Дэлгэрэнгүй харах"
                            >
                              <Eye size={14} />
                            </button>
                            {payment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => reviewMutation.mutate({ id: payment.id, action: 'approve', notes: '' })}
                                  className="p-1.5 rounded-lg text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
                                  title="Зөвшөөрөх"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => { setSelectedPayment(payment); setAdminNotes('') }}
                                  className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                  title="Татгалзах"
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Төлбөрийн дэлгэрэнгүй Modal */}
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => { setSelectedPayment(null); setAdminNotes('') }}
          title="Төлбөрийн дэлгэрэнгүй"
          size="md"
        >
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-400 dark:text-white/40">Захиалга</p><p className="text-slate-900 dark:text-white font-mono">{selectedPayment.booking_reference}</p></div>
                <div><p className="text-slate-400 dark:text-white/40">Хэрэглэгч</p><p className="text-slate-900 dark:text-white">{selectedPayment.user_email}</p></div>
                <div><p className="text-slate-400 dark:text-white/40">Дүн</p><p className="text-slate-900 dark:text-white font-bold">{formatCurrency(selectedPayment.amount)}</p></div>
                <div><p className="text-slate-400 dark:text-white/40">Арга</p><p className="text-slate-900 dark:text-white capitalize">{selectedPayment.method.replace('_', ' ')}</p></div>
                {selectedPayment.transaction_reference && (
                  <div className="col-span-2"><p className="text-slate-400 dark:text-white/40">Гүйлгээний лавлагаа</p><p className="text-slate-900 dark:text-white font-mono">{selectedPayment.transaction_reference}</p></div>
                )}
              </div>

              {selectedPayment.proof_url && (
                <div>
                  <p className="text-slate-400 dark:text-white/40 text-sm mb-2">Төлбөрийн баримт</p>
                  <div className="relative h-48 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
                    <Image src={selectedPayment.proof_url} alt="Төлбөрийн баримт" fill className="object-contain" />
                  </div>
                </div>
              )}

              {selectedPayment.status === 'pending' && (
                <div>
                  <label className="text-sm text-slate-500 dark:text-white/60 mb-1.5 block">Админы тэмдэглэл (заавал биш)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Хэрэглэгчид тэмдэглэл оруулах..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/50 resize-none"
                  />
                  <div className="flex gap-3 mt-3">
                    <Button
                      onClick={() => reviewMutation.mutate({ id: selectedPayment.id, action: 'approve', notes: adminNotes })}
                      variant="primary"
                      fullWidth
                      isLoading={reviewMutation.isPending}
                      leftIcon={<CheckCircle size={15} />}
                    >
                      Төлбөр зөвшөөрөх
                    </Button>
                    <Button
                      onClick={() => reviewMutation.mutate({ id: selectedPayment.id, action: 'reject', notes: adminNotes })}
                      variant="danger"
                      fullWidth
                      isLoading={reviewMutation.isPending}
                      leftIcon={<XCircle size={15} />}
                    >
                      Татгалзах
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}
