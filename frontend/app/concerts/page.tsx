'use client'

import { motion } from 'framer-motion'
import { Music } from 'lucide-react'
import { EventCard } from '@/components/events/EventCard'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
import { useEvents } from '@/hooks/useEvents'

export default function ConcertsPage() {
  const { data, isLoading } = useEvents({ category_type: 'concert', ordering: '-created_at' })
  const events = data?.results ?? []

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary-500/15 border border-primary-500/25 mb-4">
            <Music size={28} className="text-primary-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            <span className="text-gradient">Концерт</span>
          </h1>
          <p className="text-slate-500 dark:text-white/40 text-lg">Мартагдашгүй шууд хөгжмийн туршлага</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <EventCardSkeleton key={i} />)
            : events.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
        </div>

        {!isLoading && events.length === 0 && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🎵</p>
            <p className="text-slate-500 dark:text-white/40 text-lg">Одоогоор концерт байхгүй байна</p>
          </div>
        )}
      </div>
    </div>
  )
}
