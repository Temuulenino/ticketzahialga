'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, Ticket, User, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useAuth } from '@/hooks/useAuth'
import { cn, getInitials } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-black/10 dark:border-white/10 shadow-2xl'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Лого */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow group-hover:shadow-glow-pink transition-all duration-300">
                <Ticket size={18} className="text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-white/70 bg-clip-text text-transparent">
              Ticket<span className="from-primary-400 to-accent-400 bg-gradient-to-r bg-clip-text text-transparent">Pro</span>
            </span>
          </Link>

          {/* Дэсктоп навигаци */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                  pathname === link.href
                    ? 'text-slate-900 dark:text-white bg-black/10 dark:bg-white/10'
                    : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-black/8 dark:hover:bg-white/8'
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Хайлт + Үйлдлүүд */}
          <div className="flex items-center gap-3">
            {/* Дэсктоп хайлт */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" />
                <input
                  type="text"
                  placeholder="Арга хэмжээ хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-52 text-sm bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/50 focus:bg-black/10 dark:focus:bg-white/12 transition-all"
                />
              </div>
            </form>

            <ThemeToggle />

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-black/8 dark:hover:bg-white/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-xl object-cover" />
                    ) : (
                      getInitials(user.full_name || user.email)
                    )}
                  </div>
                  <span className="hidden sm:block text-sm text-slate-700 dark:text-white/80 font-medium">{user.first_name}</span>
                  <ChevronDown
                    size={14}
                    className={cn('text-slate-400 dark:text-white/40 transition-transform', userMenuOpen && 'rotate-180')}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-black/8 dark:border-white/8">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user.full_name}</p>
                        <p className="text-xs text-slate-400 dark:text-white/40 truncate">{user.email}</p>
                      </div>
                      <div className="p-2 space-y-0.5">
                        {user.role !== 'user' && (
                          <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8 transition-all">
                            <LayoutDashboard size={15} /> Админ самбар
                          </Link>
                        )}
                        <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8 transition-all">
                          <User size={15} /> Миний профайл
                        </Link>
                        <Link href="/profile?tab=bookings" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8 transition-all">
                          <Ticket size={15} /> Миний захиалгууд
                        </Link>
                        <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8 transition-all">
                          <Settings size={15} /> Тохиргоо
                        </Link>
                        <hr className="border-black/8 dark:border-white/8 my-1" />
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 transition-all"
                        >
                          <LogOut size={15} /> Гарах
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Нэвтрэх</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Бүртгүүлэх</Button>
                </Link>
              </div>
            )}

            {/* Мобайл цэс */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-black/8 dark:hover:bg-white/10 transition-all"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Мобайл цэс */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-black/10 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" />
                  <input
                    type="text"
                    placeholder="Арга хэмжээ хайх..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2.5 w-full text-sm bg-black/5 dark:bg-white/8 border border-black/10 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500/50"
                  />
                </div>
              </form>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname === link.href
                      ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-3 border-t border-black/10 dark:border-white/10 flex gap-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="glass" size="sm" fullWidth>Нэвтрэх</Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button variant="primary" size="sm" fullWidth>Бүртгүүлэх</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
