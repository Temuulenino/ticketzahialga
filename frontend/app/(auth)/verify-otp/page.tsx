'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Mail, ShieldCheck, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { getApiErrorMessage } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import Link from 'next/link'
import { Ticket } from 'lucide-react'

export default function VerifyOTPPage() {
  const router = useRouter()
  const { verifyOTP } = useAuth()
  const { pendingEmail } = useAuthStore()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (!pendingEmail) {
      router.push('/login')
    }
  }, [pendingEmail, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every((d) => d !== '') && value) {
      handleSubmit(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      handleSubmit(pasted)
    }
  }

  const handleSubmit = async (code?: string) => {
    const finalCode = code ?? otp.join('')
    if (finalCode.length !== 6 || !pendingEmail) return

    setIsLoading(true)
    try {
      await verifyOTP({ email: pendingEmail, code: finalCode, purpose: 'verify_email' })
      toast.success('Имэйл баталгаажлаа! TicketPro-д тавтай морилно уу.')
      router.push('/')
    } catch (err) {
      toast.error(getApiErrorMessage(err))
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!pendingEmail || countdown > 0) return
    setIsResending(true)
    try {
      await authService.resendOTP(pendingEmail)
      toast.success('Шинэ OTP имэйл рүү илгээгдлээ')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-primary-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-56 h-56 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <Ticket size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">TicketPro</span>
          </Link>

          <div className="mt-8 mb-4 w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto">
            <ShieldCheck size={28} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Имэйл баталгаажуулах</h1>
          <p className="text-slate-500 dark:text-white/40 text-sm">
            6 оронтой код илгээгдлээ
          </p>
          <p className="text-slate-900 dark:text-white font-medium flex items-center justify-center gap-2 mt-1">
            <Mail size={15} className="text-primary-400" />
            {pendingEmail}
          </p>
        </div>

        <GlassCard>
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold rounded-2xl bg-black/5 dark:bg-white/8 border border-black/15 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500/60 focus:bg-black/10 dark:focus:bg-white/12 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            ))}
          </div>

          <Button
            onClick={() => handleSubmit()}
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={otp.some((d) => !d)}
          >
            Имэйл баталгаажуулах
          </Button>

          <div className="mt-5 text-center">
            {countdown > 0 ? (
              <p className="text-slate-500 dark:text-white/40 text-sm">
                Дахин илгээх боломжтой болно <span className="text-primary-500 dark:text-primary-400 font-medium">{countdown}с</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="flex items-center gap-2 text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-medium transition-colors mx-auto disabled:opacity-50"
              >
                <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
                {isResending ? 'Илгээж байна...' : 'OTP дахин илгээх'}
              </button>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-400 dark:text-white/30 text-center">
            Буруу имэйл оруулсан уу?{' '}
            <Link href="/register" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300">Буцах</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
