'use client'

import { HeroSection } from '@/components/home/HeroSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { EventsSection } from '@/components/home/EventsSection'
import { useCategories, useFeaturedEvents, useTrendingEvents } from '@/hooks/useEvents'

export default function HomePage() {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: featuredEvents = [], isLoading: featuredLoading } = useFeaturedEvents()
  const { data: trendingEvents = [], isLoading: trendingLoading } = useTrendingEvents()

  return (
    <>
      <HeroSection />

      {!categoriesLoading && categories.length > 0 && (
        <CategoriesSection categories={categories} />
      )}

      <EventsSection
        title="Онцлох арга хэмжээнүүд"
        subtitle="Хамгийн шилдэг туршлагуудыг танд санал болгож байна"
        events={featuredEvents}
        isLoading={featuredLoading}
        viewAllHref="/events?is_featured=true"
      />

      <EventsSection
        title="Одоогийн трэнд"
        subtitle="Энэ долоо хоногийн хамгийн алдартай арга хэмжээнүүд"
        events={trendingEvents}
        isLoading={trendingLoading}
        viewAllHref="/events?is_trending=true"
        gradient
      />
    </>
  )
}
