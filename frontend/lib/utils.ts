import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string, fmt = 'MMM dd, yyyy') {
  const date = parseISO(dateStr)
  return isValid(date) ? format(date, fmt) : 'Invalid date'
}

export function formatDatetime(dateStr: string) {
  const date = parseISO(dateStr)
  return isValid(date) ? format(date, 'MMM dd, yyyy • HH:mm') : 'Invalid date'
}

export function formatRelative(dateStr: string) {
  const date = parseISO(dateStr)
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : 'Invalid date'
}

export function formatCurrency(amount: string | number, currency = 'ETB') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: currency === 'ETB' ? 'ETB' : currency,
    minimumFractionDigits: 0,
  }).format(num)
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('en-US').format(num)
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.slice(0, length)}...` : str
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    payment_uploaded: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    confirmed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
    refunded: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    approved: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
    published: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    draft: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    sold_out: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  }
  return colors[status] ?? 'text-slate-400 bg-slate-400/10 border-slate-400/20'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Хүлээгдэж байна',
    payment_uploaded: 'Төлбөр илгээгдлээ',
    confirmed: 'Баталгаажлаа',
    cancelled: 'Цуцлагдлаа',
    refunded: 'Буцаалт хийгдлээ',
    approved: 'Зөвшөөрөгдлөө',
    rejected: 'Татгалзлаа',
    published: 'Нийтлэгдлээ',
    draft: 'Ноорог',
    sold_out: 'Дууссан',
  }
  return labels[status] ?? status
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
