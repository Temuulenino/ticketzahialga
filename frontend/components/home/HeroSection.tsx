'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Sparkles, ArrowRight, Music, Palette, Trophy } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

const floatingIcons = [
  { Icon: Music, x: '10%', y: '20%', delay: 0, color: 'text-primary-400' },
  { Icon: Palette, x: '85%', y: '15%', delay: 0.5, color: 'text-accent-400' },
  { Icon: Trophy, x: '80%', y: '70%', delay: 1, color: 'text-amber-400' },
  { Icon: Sparkles, x: '15%', y: '65%', delay: 1.5, color: 'text-emerald-400' },
]

export function HeroSection() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const path = searchQuery.trim()
      ? `/events?search=${encodeURIComponent(searchQuery.trim())}`
      : '/events'
    router.push(path)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Арын зураг */}
      <div className="absolute inset-0">
        <Image
          src="https://picsum.photos/seed/concert-hero-bg/1920/1080"
          alt=""
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-800/10 rounded-full blur-3xl" />
      </div>

      {/* Торон давхарга */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Хөвөгч дүрсүүд */}
      {floatingIcons.map(({ Icon, x, y, delay, color }, i) => (
        <motion.div
          key={i}
          className={`absolute hidden lg:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm ${color}`}
          style={{ left: x, top: y }}
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}
        >
          <Icon size={22} />
        </motion.div>
      ))}

      {/* Агуулга */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/15 border border-primary-500/25 text-primary-300 text-sm font-medium mb-8"
          >
            <Sparkles size={14} className="animate-pulse" />
            Монголын №1 Тасалбарын Платформ
            <ArrowRight size={12} />
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-[1.05]">
            <span className="text-white">Мартагдашгүй </span>
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent bg-[length:200%] animate-gradient">
              Туршлагуудыг
            </span>
            <br />
            <span className="text-white">Нээж Олоорой</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Концерт, наадам, музейн аялал, үзвэр үйлчилгээ болон шууд тоглолтын тасалбарыг нэг премиум платформоос захиалаарай.
          </p>

          {/* Хайлт */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Концерт, арга хэмжээ, уран бүтээлч хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-base bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl text-white placeholder-white/35 focus:outline-none focus:border-primary-500/60 focus:bg-white/15 transition-all shadow-glass"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="rounded-3xl px-8 shrink-0">
              Хайх <ArrowRight size={18} />
            </Button>
          </form>

          {/* Статистик */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/40"
          >
            {[
              { value: '500+', label: 'Арга хэмжээ' },
              { value: '50K+', label: 'Зарагдсан тасалбар' },
              { value: '200+', label: 'Уран бүтээлч' },
              { value: '4.9★', label: 'Үнэлгээ' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
                <div>{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Доод градиент */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent dark:from-slate-950 light:from-slate-50" />
    </section>
  )
}
