'use client'

import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar, MapPin, Ticket, Users, Tag, Share2,
  ArrowLeft, CheckCircle2, AlertCircle
} from 'lucide-react'
import { useEvent, useRelatedEvents } from '@/hooks/useEvents'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { EventCard } from '@/components/events/EventCard'
import { EventDetailSkeleton } from '@/components/ui/Skeleton'
import { formatDate, formatDatetime, formatCurrency, cn } from '@/lib/utils'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { isAuthenticated } = useAuthStore()
  const { data: event, isLoading } = useEvent(slug)
  const { data: relatedEvents = [] } = useRelatedEvents(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 max-w-7xl mx-auto">
        <EventDetailSkeleton />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🎭</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Арга хэмжээ олдсонгүй</h2>
          <p className="text-slate-500 dark:text-white/40 mb-6">Энэ арга хэмжээ байхгүй эсвэл устгагдсан байна.</p>
          <Link href="/events">
            <Button variant="primary">Арга хэмжээ харах</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/booking/${slug}`)
      return
    }
    router.push(`/booking/${slug}`)
  }

  const isSoldOut = event.status === 'sold_out'
  const isAvailable = event.status === 'published' && !isSoldOut

  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* Баннер */}
      <div className="relative h-[45vh] min-h-[350px] overflow-hidden">
        {event.banner_url || event.poster_url ? (
          <Image
            src={event.banner_url ?? event.poster_url!}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-900 to-accent-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent dark:from-slate-950 light:from-slate-50" />

        {/* Буцах товч */}
        <div className="absolute top-6 left-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md text-white/80 hover:text-white border border-white/10 text-sm transition-all"
          >
            <ArrowLeft size={16} /> Буцах
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Үндсэн агуулга */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {event.category && (
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${event.category.color}25`,
                      color: event.category.color,
                      border: `1px solid ${event.category.color}40`,
                    }}
                  >
                    {event.category.icon} {event.category.name}
                  </span>
                  {event.is_featured && <Badge variant="warning">Онцлох</Badge>}
                  {event.is_trending && <Badge variant="info">Трэнд</Badge>}
                </div>
              )}

              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-slate-500 dark:text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-primary-400" />
                  {formatDatetime(event.start_date)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-accent-400" />
                  {event.venue}, {event.city}
                </div>
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-emerald-400" />
                  {event.available_tickets} тасалбар үлдсэн
                </div>
              </div>
            </motion.div>

            {/* Тайлбар */}
            <GlassCard>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Арга хэмжээний тухай</h2>
              <div className="text-slate-600 dark:text-white/70 leading-relaxed whitespace-pre-line text-base">
                {event.description}
              </div>

              {event.tags_list.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-6">
                  <Tag size={14} className="text-slate-400 dark:text-white/30" />
                  {event.tags_list.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 text-xs text-slate-500 dark:text-white/50">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Зургийн цомог */}
            {event.images.length > 0 && (
              <GlassCard>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Зургийн цомог</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {event.images.map((img) => (
                    <div key={img.id} className="relative aspect-video rounded-2xl overflow-hidden">
                      <Image
                        src={img.image_url}
                        alt={img.caption || event.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Газрын мэдээлэл */}
            <GlassCard>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Газрын мэдээлэл</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-accent-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium">{event.venue}</p>
                    {event.venue_address && <p className="text-slate-500 dark:text-white/50 text-sm">{event.venue_address}</p>}
                    <p className="text-slate-500 dark:text-white/50 text-sm">{event.city}, {event.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-primary-400 shrink-0" />
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium">Огноо & Цаг</p>
                    <p className="text-slate-500 dark:text-white/50 text-sm">
                      {formatDatetime(event.start_date)} — {formatDate(event.end_date, 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Хажуугийн самбар - Тасалбар */}
          <div className="space-y-5">
            <GlassCard className="sticky top-24">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">Тасалбар</h2>

              <div className="space-y-3 mb-6">
                {event.ticket_types.map((tt) => (
                  <div
                    key={tt.id}
                    className={cn(
                      'p-4 rounded-2xl border transition-all',
                      tt.is_available
                        ? 'border-black/10 dark:border-white/10 bg-black/3 dark:bg-white/5 hover:border-primary-500/30'
                        : 'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] opacity-60'
                    )}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{tt.name}</p>
                        {tt.description && (
                          <p className="text-slate-400 dark:text-white/40 text-xs mt-0.5">{tt.description}</p>
                        )}
                      </div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatCurrency(tt.price, tt.currency)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400 dark:text-white/40">
                        {tt.available_count} боломжтой
                      </span>
                      {!tt.is_available && (
                        <span className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle size={11} /> Дууссан
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isAvailable ? (
                <Button
                  onClick={handleBookNow}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="rounded-2xl"
                >
                  <Ticket size={18} /> Тасалбар захиалах
                </Button>
              ) : (
                <div className="text-center py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <p className="text-slate-500 dark:text-white/50 font-medium">
                    {isSoldOut ? '😔 Дууссан' : '❌ Боломжгүй'}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-black/8 dark:border-white/8 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Аюулгүй төлбөрийн баталгаажуулалт
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Тэр даруйдаа захиалга баталгаажуулах
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/40">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Дижитал тасалбар хүргэх
                </div>
              </div>
            </GlassCard>

            <button
              onClick={() => navigator.share?.({ title: event.title, url: window.location.href })}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-black/10 dark:border-white/10 text-sm text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:border-black/20 dark:hover:border-white/20 transition-all"
            >
              <Share2 size={14} /> Арга хэмжээ хуваалцах
            </button>
          </div>
        </div>

        {/* Холбогдох арга хэмжээнүүд */}
        {relatedEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Холбогдох арга хэмжээнүүд</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedEvents.map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
