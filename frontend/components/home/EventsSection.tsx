'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Event } from '@/types/event.types'
import { EventCard } from '@/components/events/EventCard'
import { EventCardSkeleton } from '@/components/ui/Skeleton'

interface EventsSectionProps {
  title: string
  subtitle?: string
  events: Event[]
  isLoading?: boolean
  viewAllHref?: string
  gradient?: boolean
}

export function EventsSection({
  title,
  subtitle,
  events,
  isLoading = false,
  viewAllHref = '/events',
  gradient = false,
}: EventsSectionProps) {
  return (
    <section className={`py-20 px-4 ${gradient ? 'bg-gradient-to-b from-transparent via-primary-950/20 to-transparent' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
            {subtitle && <p className="text-slate-500 dark:text-white/40">{subtitle}</p>}
          </div>
          <Link
            href={viewAllHref}
            className="hidden sm:flex items-center gap-2 text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-medium transition-colors group"
          >
            Бүгдийг харах
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <EventCardSkeleton key={i} />)
            : events.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
        </div>

        {!isLoading && events.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎭</div>
            <p className="text-slate-500 dark:text-white/40 text-lg">Арга хэмжээ олдсонгүй</p>
          </div>
        )}

        <div className="sm:hidden mt-8 text-center">
          <Link href={viewAllHref} className="inline-flex items-center gap-2 text-primary-500 dark:text-primary-400 font-medium">
            Бүгдийг харах <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
