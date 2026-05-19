export const APP_NAME = 'TicketPro'
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

export const CATEGORY_ICONS: Record<string, string> = {
  concert: '🎵',
  entertainment: '🎭',
  museum: '🏛️',
  festival: '🎉',
  live_show: '🎪',
  sports: '⚽',
  theater: '🎬',
  other: '✨',
}

export const CATEGORY_LABELS: Record<string, string> = {
  concert: 'Концерт',
  entertainment: 'Үзвэр',
  museum: 'Музей',
  festival: 'Наадам',
  live_show: 'Шууд тоглолт',
  sports: 'Спорт',
  theater: 'Театр',
  other: 'Бусад',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'Банкны шилжүүлэг',
  mobile_money: 'Мобайл мөнгө',
  telebirr: 'ТелеБирр',
  cbe_birr: 'CBE Бирр',
  other: 'Бусад',
}

export const BOOKING_STATUS_STEPS = [
  { key: 'pending', label: 'Захиалга үүсгэгдлээ', step: 1 },
  { key: 'payment_uploaded', label: 'Төлбөр илгээгдлээ', step: 2 },
  { key: 'confirmed', label: 'Захиалга баталгаажлаа', step: 3 },
]

export const NAV_LINKS = [
  { href: '/', label: 'Нүүр' },
  { href: '/entertainment', label: 'Үзвэр' },
  { href: '/concerts', label: 'Концерт' },
  { href: '/museums', label: 'Музей' },
  { href: '/events', label: 'Бүх арга хэмжээ' },
]

export const SORT_OPTIONS = [
  { value: '-created_at', label: 'Шинэ нь эхэнд' },
  { value: 'created_at', label: 'Хуучин нь эхэнд' },
  { value: 'start_date', label: 'Огноо (өсөхөөр)' },
  { value: '-start_date', label: 'Огноо (буурахаар)' },
  { value: 'title', label: 'Нэр (А-Я)' },
]
