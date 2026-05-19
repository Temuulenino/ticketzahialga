'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { CheckCircle2, Minus, Plus, Upload, ArrowRight, Calendar, MapPin } from 'lucide-react'
import { useEvent } from '@/hooks/useEvents'
import { useAuthStore } from '@/store/auth.store'
import { bookingsService } from '@/services/bookings.service'
import { paymentsService } from '@/services/payments.service'
import { getApiErrorMessage } from '@/services/api'
import { formatCurrency, formatDatetime } from '@/lib/utils'
import { TicketType } from '@/types/event.types'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'

const STEPS = ['Тасалбар сонгох', 'Шалгах & Баталгаажуулах', 'Төлбөр илгээх', 'Захиалга баталгаажлаа']

const PAYMENT_METHODS = [
  { id: 'bank_transfer', label: 'Банкны шилжүүлэг', icon: '🏦' },
  { id: 'telebirr', label: 'ТелеБирр', icon: '📱' },
  { id: 'cbe_birr', label: 'CBE Бирр', icon: '💳' },
  { id: 'mobile_money', label: 'Мобайл мөнгө', icon: '💰' },
]

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const { data: event, isLoading } = useEvent(params.slug as string)

  const [step, setStep] = useState(1)
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [bookingRef, setBookingRef] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [transactionRef, setTransactionRef] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-white/40">Арга хэмжээ ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  const totalPrice = selectedTicketType
    ? parseFloat(selectedTicketType.price) * quantity
    : 0

  const handleCreateBooking = async () => {
    if (!selectedTicketType) return
    setIsSubmitting(true)
    try {
      const res = await bookingsService.createBooking({
        event_id: event.id,
        ticket_type_id: selectedTicketType.id,
        quantity,
        notes,
      })
      setBookingRef(res.data.data.reference)
      setStep(3)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUploadPayment = async () => {
    if (!proofFile || !bookingRef) return
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('booking_reference', bookingRef)
    formData.append('method', paymentMethod)
    formData.append('transaction_reference', transactionRef)
    formData.append('proof_image', proofFile)
    try {
      await paymentsService.uploadPayment(formData)
      setStep(4)
      toast.success('Төлбөр илгээгдлээ! Админы баталгаажуулалтыг хүлээж байна.')
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Алхамын индикатор */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((label, index) => {
            const stepNum = index + 1
            const isActive = step === stepNum
            const isComplete = step > stepNum
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isComplete
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-primary-500 text-white shadow-glow'
                        : 'bg-black/10 dark:bg-white/10 text-slate-400 dark:text-white/40'
                    }`}
                  >
                    {isComplete ? <CheckCircle2 size={18} /> : stepNum}
                  </div>
                  <p className={`text-xs mt-1.5 hidden sm:block transition-colors ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/30'}`}>
                    {label}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-16 sm:w-24 h-px mx-3 mb-4 sm:mb-0 transition-colors ${step > stepNum ? 'bg-emerald-500' : 'bg-black/10 dark:bg-white/10'}`} />
                )}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Алхам 1: Тасалбар сонгох */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{event.title}</h1>
                  <div className="flex gap-4 text-slate-500 dark:text-white/50 text-sm">
                    <span className="flex items-center gap-1"><Calendar size={13} />{formatDatetime(event.start_date)}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} />{event.venue}</span>
                  </div>
                </div>

                <GlassCard>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Тасалбарын төрөл сонгох</h2>
                  <div className="space-y-3">
                    {event.ticket_types.filter((tt) => tt.is_active).map((tt) => (
                      <button
                        key={tt.id}
                        onClick={() => setSelectedTicketType(tt)}
                        disabled={!tt.is_available}
                        className={`w-full p-4 rounded-2xl border text-left transition-all ${
                          selectedTicketType?.id === tt.id
                            ? 'border-primary-500/60 bg-primary-500/10'
                            : tt.is_available
                            ? 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-black/3 dark:bg-white/5'
                            : 'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                              selectedTicketType?.id === tt.id ? 'border-primary-500 bg-primary-500' : 'border-black/30 dark:border-white/30'
                            }`} />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">{tt.name}</p>
                              {tt.description && <p className="text-slate-500 dark:text-white/40 text-xs mt-0.5">{tt.description}</p>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(tt.price, tt.currency)}</p>
                            <p className="text-xs text-slate-400 dark:text-white/40">{tt.available_count} үлдсэн</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </GlassCard>

                {selectedTicketType && (
                  <GlassCard>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Тоо хэмжээ</h2>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-xl border border-black/15 dark:border-white/15 flex items-center justify-center text-slate-900 dark:text-white hover:bg-black/8 dark:hover:bg-white/10 transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(selectedTicketType.max_per_booking, selectedTicketType.available_count, q + 1))}
                        className="w-10 h-10 rounded-xl border border-black/15 dark:border-white/15 flex items-center justify-center text-slate-900 dark:text-white hover:bg-black/8 dark:hover:bg-white/10 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                      <span className="text-sm text-slate-500 dark:text-white/40">
                        Нэг захиалгад макс {Math.min(selectedTicketType.max_per_booking, selectedTicketType.available_count)}
                      </span>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm text-slate-500 dark:text-white/60 mb-1.5 block">Тэмдэглэл (заавал биш)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Онцгой хүсэлт байвал бичнэ үү..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/50 resize-none text-sm"
                      />
                    </div>
                  </GlassCard>
                )}
              </div>

              {/* Захиалгын хураангуй */}
              <GlassCard className="h-fit sticky top-24">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Захиалгын хураангуй</h2>
                {selectedTicketType ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-white/60">{selectedTicketType.name}</span>
                      <span className="text-slate-900 dark:text-white">{formatCurrency(selectedTicketType.price, selectedTicketType.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-white/60">Тоо хэмжээ</span>
                      <span className="text-slate-900 dark:text-white">× {quantity}</span>
                    </div>
                    <div className="border-t border-black/10 dark:border-white/10 pt-3 flex justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">Нийт дүн</span>
                      <span className="font-bold text-xl text-slate-900 dark:text-white">
                        {formatCurrency(totalPrice, selectedTicketType.currency)}
                      </span>
                    </div>
                    <Button
                      onClick={() => setStep(2)}
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="mt-2"
                    >
                      Үргэлжлүүлэх <ArrowRight size={16} />
                    </Button>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-white/40 text-sm">Тасалбарын төрөл сонгоод үргэлжлүүлнэ үү</p>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* Алхам 2: Шалгах & Баталгаажуулах */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto space-y-5"
            >
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Захиалга шалгах</h1>

              <GlassCard>
                <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Арга хэмжээний мэдээлэл</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-white/50">Арга хэмжээ</span><span className="text-slate-900 dark:text-white font-medium">{event.title}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-white/50">Огноо</span><span className="text-slate-900 dark:text-white">{formatDatetime(event.start_date)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-white/50">Газар</span><span className="text-slate-900 dark:text-white">{event.venue}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-white/50">Тасалбар</span><span className="text-slate-900 dark:text-white">{selectedTicketType?.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-white/50">Тоо хэмжээ</span><span className="text-slate-900 dark:text-white">{quantity}</span></div>
                  <div className="flex justify-between pt-2 border-t border-black/10 dark:border-white/10"><span className="font-semibold text-slate-900 dark:text-white">Нийт дүн</span><span className="font-bold text-lg text-slate-900 dark:text-white">{formatCurrency(totalPrice, selectedTicketType?.currency!)}</span></div>
                </div>
              </GlassCard>

              <GlassCard>
                <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Таны мэдээлэл</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-white/50">Нэр</span><span className="text-slate-900 dark:text-white">{user?.full_name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-white/50">Имэйл</span><span className="text-slate-900 dark:text-white">{user?.email}</span></div>
                </div>
              </GlassCard>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-sm text-amber-700 dark:text-amber-300">
                <p className="font-semibold mb-1">📋 Төлбөрийн зааварчилгаа</p>
                <p className="text-amber-600/70 dark:text-amber-300/70">Захиалга баталгаажуулсны дараа төлбөрийн баримтаа илгээх шаардлагатай. Админ төлбөрийг шалгасны дараа таны захиалга баталгаажна.</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="glass" size="lg" fullWidth>
                  Буцах
                </Button>
                <Button onClick={handleCreateBooking} variant="primary" size="lg" fullWidth isLoading={isSubmitting}>
                  Захиалга баталгаажуулах
                </Button>
              </div>
            </motion.div>
          )}

          {/* Алхам 3: Төлбөр илгээх */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto space-y-5"
            >
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Төлбөрийн баримт илгээх</h1>
                <p className="text-slate-500 dark:text-white/50">Захиалгын лавлагаа: <span className="text-primary-500 dark:text-primary-400 font-mono font-bold">{bookingRef}</span></p>
              </div>

              <GlassCard>
                <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Төлбөрийн арга</h2>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary-500/60 bg-primary-500/10'
                          : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-1">{method.icon}</div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{method.label}</p>
                    </button>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="space-y-4">
                <div>
                  <label className="text-sm text-slate-500 dark:text-white/60 mb-1.5 block">Гүйлгээний лавлагаа (заавал биш)</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="жнь: TXN123456"
                    className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/50 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-500 dark:text-white/60 mb-1.5 block">Төлбөрийн дэлгэцийн агшин *</label>
                  <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-black/15 dark:border-white/15 hover:border-primary-500/40 cursor-pointer transition-all hover:bg-primary-500/5">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                    />
                    <Upload size={28} className="text-slate-300 dark:text-white/30" />
                    {proofFile ? (
                      <p className="text-emerald-500 dark:text-emerald-400 font-medium text-sm">{proofFile.name}</p>
                    ) : (
                      <div className="text-center">
                        <p className="text-slate-500 dark:text-white/60 text-sm">Зураг оруулахын тулд дарна уу</p>
                        <p className="text-slate-400 dark:text-white/30 text-xs mt-1">PNG, JPG 10MB хүртэл</p>
                      </div>
                    )}
                  </label>
                </div>
              </GlassCard>

              <Button
                onClick={handleUploadPayment}
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                disabled={!proofFile}
              >
                <Upload size={16} /> Төлбөрийн баримт илгээх
              </Button>
            </motion.div>
          )}

          {/* Алхам 4: Баталгаажлаа */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 size={48} className="text-emerald-400" />
                </motion.div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Төлбөр илгээгдлээ!</h1>
                <p className="text-slate-500 dark:text-white/50 text-lg mb-2">Таны захиалгын лавлагаа:</p>
                <p className="text-2xl font-mono font-bold text-primary-500 dark:text-primary-400">{bookingRef}</p>
              </div>

              <GlassCard className="text-left mb-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-white/70">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    Захиалга үүсгэгдэж баталгаажлаа
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-white/70">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    Төлбөрийн баримт амжилттай илгээгдлээ
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-white/50">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400/60 shrink-0" />
                    Админы төлбөрийн шалгалтыг хүлээж байна
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 dark:text-white/30">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-black/20 dark:border-white/20 shrink-0" />
                    Захиалга баталгаажуулах & тасалбар олгох
                  </div>
                </div>
              </GlassCard>

              <div className="flex gap-3">
                <Button onClick={() => router.push('/profile?tab=bookings')} variant="glass" size="lg" fullWidth>
                  Миний захиалгууд
                </Button>
                <Button onClick={() => router.push('/')} variant="primary" size="lg" fullWidth>
                  Арга хэмжээ үзэх
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
