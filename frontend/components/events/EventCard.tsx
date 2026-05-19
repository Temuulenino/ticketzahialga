'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Ticket, TrendingUp, Star } from 'lucide-react'
import { Event } from '@/types/event.types'
import { formatDate, formatCurrency, cn } from '@/lib/utils'

interface EventCardProps {
  event: Event
  index?: number
  featured?: boolean
}

export function EventCard({ event, index = 0, featured = false }: EventCardProps) {
  const minPrice = event.min_price
    ? formatCurrency(event.min_price, event.ticket_types[0]?.currency)
    : 'Үнэгүй'

  const isUnavailable = event.status === 'sold_out' || event.status === 'cancelled'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/events/${event.slug}`} className="block group">
        <div
          className={cn(
            'relative rounded-3xl overflow-hidden border',
            'border-black/10 dark:border-white/10',
            'bg-white/70 dark:bg-white/[0.04] backdrop-blur-lg',
            'transition-all duration-400 ease-out',
            'hover:border-primary-500/30 hover:bg-white/90 dark:hover:bg-white/[0.08]',
            'hover:shadow-card-hover hover:-translate-y-1',
            featured && 'ring-1 ring-primary-500/20'
          )}
        >
          {/* Постер */}
          <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
            {event.poster_url ? (
              <Image
                src={event.poster_url}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-900/50 to-accent-900/50 flex items-center justify-center">
                <Ticket size={40} className="text-white/20" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Дээд тэмдгүүд */}
            <div className="absolute top-3 left-3 flex gap-2">
              {event.is_featured && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/90 text-amber-950 text-xs font-bold backdrop-blur-sm">
                  <Star size={10} fill="currentColor" /> Онцлох
                </span>
              )}
              {event.is_trending && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-xl bg-primary-500/90 text-white text-xs font-bold backdrop-blur-sm">
                  <TrendingUp size={10} /> Трэнд
                </span>
              )}
            </div>

            {event.status === 'sold_out' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-xl tracking-widest opacity-80">ДУУССАН</span>
              </div>
            )}

            {event.category && (
              <div className="absolute bottom-3 left-3">
                <span className="px-2.5 py-1 rounded-xl text-xs font-medium backdrop-blur-md border border-white/20 text-white bg-black/40">
                  {event.category.icon} {event.category.name}
                </span>
              </div>
            )}
          </div>

          {/* Агуулга */}
          <div className="p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
              {event.title}
            </h3>

            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-white/50 text-xs">
                <Calendar size={12} className="shrink-0 text-primary-400/70" />
                <span>{formatDate(event.start_date, 'EEE, MMM dd yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-white/50 text-xs">
                <MapPin size={12} className="shrink-0 text-accent-400/70" />
                <span className="truncate">{event.venue}, {event.city}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/8 dark:border-white/8">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-wider">Эхлэх үнэ</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{minPrice}</p>
              </div>
              <div
                className={cn(
                  'px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200',
                  isUnavailable
                    ? 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-white/30 border border-black/10 dark:border-white/10'
                    : 'bg-primary-500/20 text-primary-600 dark:text-primary-400 border border-primary-500/30 group-hover:bg-primary-500 group-hover:text-white'
                )}
              >
                {isUnavailable ? 'Боломжгүй' : 'Захиалах'}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
