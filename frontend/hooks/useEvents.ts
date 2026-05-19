'use client'

import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/services/events.service'
import { EventFilters } from '@/types/event.types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => eventsService.getCategories().then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  })
}

export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsService.getEvents(filters).then((r) => r.data.data),
    staleTime: 2 * 60 * 1000,
  })
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn: () => eventsService.getFeaturedEvents().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTrendingEvents() {
  return useQuery({
    queryKey: ['events', 'trending'],
    queryFn: () => eventsService.getTrendingEvents().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: () => eventsService.getEventBySlug(slug).then((r) => r.data.data),
    enabled: !!slug,
    staleTime: 3 * 60 * 1000,
  })
}

export function useRelatedEvents(slug: string) {
  return useQuery({
    queryKey: ['events', 'related', slug],
    queryFn: () => eventsService.getRelatedEvents(slug).then((r) => r.data.data),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })
}
