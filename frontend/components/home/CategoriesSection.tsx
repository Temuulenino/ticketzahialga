'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Category } from '@/types/event.types'

interface CategoriesSectionProps {
  categories: Category[]
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Ангиллаар <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Хайх</span>
          </h2>
          <p className="text-slate-500 dark:text-white/40">Хайж буй зүйлээ олоорой</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/events?category=${cat.id}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-3xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] hover:bg-white/80 dark:hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 duration-300"
                  style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}30` }}
                >
                  {cat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-white/80 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">{cat.event_count} арга хэмжээ</p>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Бүх арга хэмжээ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: categories.length * 0.05 }}
          >
            <Link
              href="/events"
              className="group flex flex-col items-center gap-3 p-5 rounded-3xl border border-dashed border-primary-500/30 bg-primary-500/5 hover:border-primary-500/60 hover:bg-primary-500/10 transition-all duration-300 hover:-translate-y-1 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ✨
              </div>
              <div>
                <p className="text-sm font-medium text-primary-500 dark:text-primary-400">Бүгдийг харах</p>
                <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">Бүх арга хэмжээ</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
