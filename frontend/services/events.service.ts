import api from './api'
import { EventFilters, PaginatedResponse, Event, Category } from '@/types/event.types'

export const eventsService = {
  getCategories: () =>
    api.get<{ data: Category[] }>('/events/categories/'),

  getEvents: (params?: EventFilters) =>
    api.get<{ data: PaginatedResponse<Event> }>('/events/', { params }),

  getFeaturedEvents: () =>
    api.get<{ data: Event[] }>('/events/featured/'),

  getTrendingEvents: () =>
    api.get<{ data: Event[] }>('/events/trending/'),

  getEventBySlug: (slug: string) =>
    api.get<{ data: Event }>(`/events/${slug}/`),

  getRelatedEvents: (slug: string) =>
    api.get<{ data: Event[] }>(`/events/${slug}/related/`),

  // Admin
  adminGetEvents: (params?: Record<string, unknown>) =>
    api.get('/events/admin/list/', { params }),

  adminCreateEvent: (data: FormData) =>
    api.post('/events/admin/list/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  adminUpdateEvent: (id: string, data: FormData | Record<string, unknown>) =>
    api.patch(`/events/admin/${id}/`, data),

  adminDeleteEvent: (id: string) =>
    api.delete(`/events/admin/${id}/`),

  adminAddTicketType: (eventId: string, data: Record<string, unknown>) =>
    api.post(`/events/admin/${eventId}/tickets/`, data),

  adminUploadImage: (eventId: string, data: FormData) =>
    api.post(`/events/admin/${eventId}/images/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
