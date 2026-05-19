export type EventStatus = 'draft' | 'published' | 'sold_out' | 'cancelled' | 'completed'
export type CategoryType = 'concert' | 'entertainment' | 'museum' | 'festival' | 'live_show' | 'sports' | 'theater' | 'other'

export interface Category {
  id: string
  name: string
  slug: string
  type: CategoryType
  description: string
  icon: string
  color: string
  event_count: number
}

export interface TicketType {
  id: string
  name: string
  description: string
  price: string
  currency: string
  total_count: number
  sold_count: number
  available_count: number
  max_per_booking: number
  is_active: boolean
  is_available: boolean
  sale_start: string | null
  sale_end: string | null
}

export interface EventImage {
  id: string
  image_url: string
  caption: string
  order: number
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  short_description: string
  category: Category
  venue: string
  venue_address: string
  city: string
  country: string
  latitude: number | null
  longitude: number | null
  start_date: string
  end_date: string
  poster_url: string | null
  banner_url: string | null
  images: EventImage[]
  status: EventStatus
  is_featured: boolean
  is_trending: boolean
  tags_list: string[]
  total_capacity: number
  available_tickets: number
  ticket_types: TicketType[]
  min_price: string | null
  created_at: string
}

export interface EventFilters {
  search?: string
  category?: string
  category_type?: CategoryType
  city?: string
  start_date_from?: string
  start_date_to?: string
  min_price?: number
  max_price?: number
  ordering?: string
  page?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
