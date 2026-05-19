import api from './api'
import { CreateBookingPayload } from '@/types/booking.types'

export const bookingsService = {
  createBooking: (data: CreateBookingPayload) =>
    api.post('/bookings/create/', data),

  getUserBookings: (params?: Record<string, unknown>) =>
    api.get('/bookings/', { params }),

  getBookingByReference: (reference: string) =>
    api.get(`/bookings/${reference}/`),

  cancelBooking: (reference: string) =>
    api.post(`/bookings/${reference}/cancel/`),

  // Admin
  adminGetBookings: (params?: Record<string, unknown>) =>
    api.get('/bookings/admin/list/', { params }),

  adminGetBooking: (reference: string) =>
    api.get(`/bookings/admin/${reference}/`),

  adminConfirmBooking: (reference: string) =>
    api.post(`/bookings/admin/${reference}/confirm/`),
}
