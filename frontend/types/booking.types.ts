import { Event, TicketType } from './event.types'
import { User } from './auth.types'

export type BookingStatus = 'pending' | 'payment_uploaded' | 'confirmed' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'approved' | 'rejected'
export type PaymentMethod = 'bank_transfer' | 'mobile_money' | 'telebirr' | 'cbe_birr' | 'other'

export interface BookingTicket {
  id: string
  ticket_number: string
  is_used: boolean
  used_at: string | null
}

export interface Booking {
  id: string
  reference: string
  user?: User
  event: Event
  ticket_type: TicketType
  quantity: number
  unit_price: string
  total_amount: string
  currency: string
  status: BookingStatus
  notes: string
  tickets: BookingTicket[]
  cancelled_at: string | null
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

export interface BookingListItem {
  id: string
  reference: string
  event_title: string
  event_slug: string
  event_start_date: string
  event_venue: string
  ticket_type_name: string
  user_email: string
  quantity: number
  unit_price: string
  total_amount: string
  currency: string
  status: BookingStatus
  created_at: string
}

export interface CreateBookingPayload {
  event_id: string
  ticket_type_id: string
  quantity: number
  notes?: string
}

export interface Payment {
  id: string
  booking_reference: string
  user_email: string
  amount: string
  currency: string
  method: PaymentMethod
  transaction_reference: string
  proof_url: string | null
  status: PaymentStatus
  admin_notes: string
  reviewed_at: string | null
  created_at: string
}
