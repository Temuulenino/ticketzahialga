'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  hover?: boolean
  glow?: boolean
  noPadding?: boolean
}

export function GlassCard({ hover = false, glow = false, noPadding = false, className, children, ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'rounded-3xl border backdrop-blur-xl transition-all duration-300',
        'bg-white/[0.06] border-white/[0.10]',
        'dark:bg-white/[0.06] dark:border-white/[0.10]',
        'light:bg-white/70 light:border-slate-200',
        hover && 'cursor-pointer hover:bg-white/[0.10] hover:border-white/20 hover:shadow-card-hover dark:hover:bg-white/[0.10] dark:hover:border-white/20',
        hover && 'light:hover:bg-white/90 light:hover:border-slate-300',
        glow && 'hover:shadow-glow',
        !noPadding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
