'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Category } from '@/types/event.types'
import { SORT_OPTIONS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface EventFiltersProps {
  categories: Category[]
}

export function EventFilters({ categories }: EventFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') ?? '',
    category: searchParams.get('category') ?? '',
    city: searchParams.get('city') ?? '',
    min_price: searchParams.get('min_price') ?? '',
    max_price: searchParams.get('max_price') ?? '',
    start_date_from: searchParams.get('start_date_from') ?? '',
    start_date_to: searchParams.get('start_date_to') ?? '',
    ordering: searchParams.get('ordering') ?? '-created_at',
  })

  const applyFilters = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    router.push(`/events?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      min_price: '',
      max_price: '',
      start_date_from: '',
      start_date_to: '',
      ordering: '-created_at',
    })
    router.push('/events')
  }

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && key !== 'ordering'
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" />
          <input
            type="text"
            placeholder="Арга хэмжээ, газар, хот хайх..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/50 focus:bg-black/10 dark:focus:bg-white/12 transition-all"
          />
        </div>
        <Button onClick={applyFilters} variant="primary" size="md">
          <Search size={16} />
          Хайх
        </Button>
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="glass"
          size="md"
          className={cn(showAdvanced && 'border-primary-500/40 bg-primary-500/10')}
        >
          <SlidersHorizontal size={16} />
          Шүүлт
          {hasActiveFilters && (
            <span className="ml-1 w-2 h-2 rounded-full bg-primary-400" />
          )}
        </Button>
        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="ghost" size="md">
            <X size={16} /> Арилгах
          </Button>
        )}
      </div>

      {/* Ангиллын товчлуурууд */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilters((f) => ({ ...f, category: '' }))}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
            !filters.category
              ? 'bg-primary-500/20 border-primary-500/40 text-primary-600 dark:text-primary-400'
              : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-500 dark:text-white/50 hover:border-black/20 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white/80'
          )}
        >
          Бүгд
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilters((f) => ({ ...f, category: cat.id }))}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
              filters.category === cat.id
                ? 'text-white border-opacity-50'
                : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-500 dark:text-white/50 hover:border-black/20 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white/80'
            )}
            style={
              filters.category === cat.id
                ? { backgroundColor: `${cat.color}25`, borderColor: `${cat.color}60`, color: cat.color }
                : {}
            }
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Нарийвчилсан шүүлт */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-5 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div>
              <label className="text-xs text-slate-500 dark:text-white/50 mb-1.5 block">Хот</label>
              <input
                type="text"
                placeholder="Улаанбаатар"
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/40"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-white/50 mb-1.5 block">Эхлэх огноо</label>
              <input
                type="date"
                value={filters.start_date_from}
                onChange={(e) => setFilters((f) => ({ ...f, start_date_from: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500/40 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-white/50 mb-1.5 block">Үнийн хязгаар</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Мин"
                  value={filters.min_price}
                  onChange={(e) => setFilters((f) => ({ ...f, min_price: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/40"
                />
                <input
                  type="number"
                  placeholder="Макс"
                  value={filters.max_price}
                  onChange={(e) => setFilters((f) => ({ ...f, max_price: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/40"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-white/50 mb-1.5 block">Эрэмбэлэх</label>
              <select
                value={filters.ordering}
                onChange={(e) => setFilters((f) => ({ ...f, ordering: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500/40"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
