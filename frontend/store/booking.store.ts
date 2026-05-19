import { create } from 'zustand'
import { Event, TicketType } from '@/types/event.types'

interface BookingStore {
  selectedEvent: Event | null
  selectedTicketType: TicketType | null
  quantity: number
  step: 1 | 2 | 3 | 4
  bookingReference: string | null
  setEvent: (event: Event) => void
  setTicketType: (ticketType: TicketType) => void
  setQuantity: (quantity: number) => void
  setStep: (step: 1 | 2 | 3 | 4) => void
  setBookingReference: (ref: string) => void
  reset: () => void
}

const initialState = {
  selectedEvent: null,
  selectedTicketType: null,
  quantity: 1,
  step: 1 as const,
  bookingReference: null,
}

export const useBookingStore = create<BookingStore>()((set) => ({
  ...initialState,
  setEvent: (selectedEvent) => set({ selectedEvent }),
  setTicketType: (selectedTicketType) => set({ selectedTicketType }),
  setQuantity: (quantity) => set({ quantity }),
  setStep: (step) => set({ step }),
  setBookingReference: (bookingReference) => set({ bookingReference }),
  reset: () => set(initialState),
}))
