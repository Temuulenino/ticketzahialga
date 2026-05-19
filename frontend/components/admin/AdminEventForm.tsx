'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { eventsService } from '@/services/events.service'
import { getApiErrorMessage } from '@/services/api'
import { useCategories } from '@/hooks/useEvents'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Upload } from 'lucide-react'

interface AdminEventFormProps {
  event?: any
  onSuccess: () => void
}

export function AdminEventForm({ event, onSuccess }: AdminEventFormProps) {
  const { data: categories = [] } = useCategories()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [poster, setPoster] = useState<File | null>(null)
  const [banner, setBanner] = useState<File | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          short_description: event.short_description,
          category: event.category?.id ?? '',
          venue: event.venue,
          venue_address: event.venue_address,
          city: event.city,
          country: event.country,
          start_date: event.start_date?.slice(0, 16),
          end_date: event.end_date?.slice(0, 16),
          status: event.status,
          is_featured: event.is_featured,
          is_trending: event.is_trending,
          total_capacity: event.total_capacity,
          tags: event.tags,
        }
      : { status: 'draft', country: 'Ethiopia', is_featured: false, is_trending: false },
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          formData.append(key, val as string)
        }
      })
      if (poster) formData.append('poster', poster)
      if (banner) formData.append('banner', banner)

      if (event) {
        await eventsService.adminUpdateEvent(event.id, formData)
      } else {
        await eventsService.adminCreateEvent(formData)
      }
      onSuccess()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input {...register('title', { required: 'Title required' })} label="Event Title" error={errors.title?.message as string} />
        </div>

        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Category</label>
          <select {...register('category')} className="w-full px-4 py-3 rounded-2xl bg-white/8 border border-white/10 text-white focus:outline-none focus:border-primary-500/40 text-sm">
            <option value="" className="bg-slate-900">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Status</label>
          <select {...register('status')} className="w-full px-4 py-3 rounded-2xl bg-white/8 border border-white/10 text-white focus:outline-none focus:border-primary-500/40 text-sm">
            {['draft', 'published', 'cancelled'].map((s) => (
              <option key={s} value={s} className="bg-slate-900 capitalize">{s}</option>
            ))}
          </select>
        </div>

        <Input {...register('start_date', { required: 'Start date required' })} label="Start Date & Time" type="datetime-local" error={errors.start_date?.message as string} />
        <Input {...register('end_date', { required: 'End date required' })} label="End Date & Time" type="datetime-local" error={errors.end_date?.message as string} />

        <Input {...register('venue', { required: 'Venue required' })} label="Venue Name" error={errors.venue?.message as string} />
        <Input {...register('city', { required: 'City required' })} label="City" error={errors.city?.message as string} />

        <div className="col-span-2">
          <Input {...register('venue_address')} label="Venue Address" />
        </div>

        <Input {...register('total_capacity', { valueAsNumber: true })} label="Total Capacity" type="number" />
        <Input {...register('tags')} label="Tags (comma separated)" placeholder="music, jazz, live" />

        <div className="col-span-2">
          <label className="text-sm text-white/60 mb-1.5 block">Short Description</label>
          <input
            {...register('short_description')}
            maxLength={500}
            placeholder="Brief event summary (max 500 chars)"
            className="w-full px-4 py-3 rounded-2xl bg-white/8 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary-500/40"
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm text-white/60 mb-1.5 block">Description *</label>
          <textarea
            {...register('description', { required: 'Description required' })}
            rows={5}
            placeholder="Full event description..."
            className="w-full px-4 py-3 rounded-2xl bg-white/8 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary-500/40 resize-none"
          />
        </div>

        {/* Image uploads */}
        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Event Poster</label>
          <label className="flex items-center gap-2 p-3 rounded-2xl border border-dashed border-white/15 cursor-pointer hover:border-primary-500/40 transition-all">
            <Upload size={16} className="text-white/30" />
            <span className="text-sm text-white/40">{poster?.name ?? 'Upload poster'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setPoster(e.target.files?.[0] ?? null)} />
          </label>
        </div>

        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Event Banner</label>
          <label className="flex items-center gap-2 p-3 rounded-2xl border border-dashed border-white/15 cursor-pointer hover:border-primary-500/40 transition-all">
            <Upload size={16} className="text-white/30" />
            <span className="text-sm text-white/40">{banner?.name ?? 'Upload banner'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setBanner(e.target.files?.[0] ?? null)} />
          </label>
        </div>

        <div className="col-span-2 flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded accent-primary-500" />
            <span className="text-sm text-white/70">Featured Event</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_trending')} className="w-4 h-4 rounded accent-primary-500" />
            <span className="text-sm text-white/70">Trending Event</span>
          </label>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
          {event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  )
}
