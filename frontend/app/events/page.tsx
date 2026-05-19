'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { EventCard } from '@/components/events/EventCard'
import { EventFilters } from '@/components/events/EventFilters'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
import { useEvents } from '@/hooks/useEvents'
import { useCategories } from '@/hooks/useEvents'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

function EventsContent() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)

  const filters = {
    search: searchParams.get('search') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    category_type: (searchParams.get('category_type') ?? undefined) as any,
    city: searchParams.get('city') ?? undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    start_date_from: searchParams.get('start_date_from') ?? undefined,
    ordering: searchParams.get('ordering') ?? '-created_at',
    page,
  }

  const { data: categories = [] } = useCategories()
  const { data, isLoading } = useEvents(filters)
  const events = data?.results ?? []
  const totalPages = data ? Math.ceil(data.count / 12) : 1

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Бүх <span className="text-gradient">Арга хэмжээ</span>
          </h1>
          <p className="text-slate-500 dark:text-white/40">
            {data ? `${data.count} арга хэмжээ олдлоо` : 'Бүх боломжит арга хэмжээг үзэх'}
          </p>
        </motion.div>

        <EventFilters categories={categories} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <EventCardSkeleton key={i} />)
            : events.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
        </div>

        {!isLoading && events.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">🎭</div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Арга хэмжээ олдсонгүй</h3>
            <p className="text-slate-500 dark:text-white/40">Шүүлт эсвэл хайлтын нөхцөлөө өөрчилж үзнэ үү</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-slate-600 dark:text-white/60 text-sm">
              {page} / {totalPages} хуудас
            </span>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <EventsContent />
    </Suspense>
  )
}
