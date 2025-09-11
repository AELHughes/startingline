import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi, type Event, type CreateEventData } from '@/lib/api'

// Get all events
export const useEvents = () => {
  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: eventsApi.getEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get my events (for organisers)
export const useMyEvents = () => {
  return useQuery<Event[]>({
    queryKey: ['my-events'],
    queryFn: eventsApi.getMyEvents,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get event by slug
export const useEventBySlug = (slug: string) => {
  return useQuery<Event | null>({
    queryKey: ['event', slug],
    queryFn: async () => {
      if (!slug) return null
      return await eventsApi.getEventBySlug(slug)
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get event by ID (fallback)
export const useEvent = (eventId: string) => {
  return useQuery<Event | null>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) return null
      return await eventsApi.getEvent(eventId)
    },
    enabled: !!eventId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Create event mutation
export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      return await eventsApi.createEvent(eventData)
    },
    onSuccess: () => {
      // Invalidate and refetch events
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
    },
    onError: (error) => {
      console.error('❌ Failed to submit event:', error)
    }
  })
}

// Update event mutation (if needed)
export const useUpdateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, eventData }: { eventId: string; eventData: Partial<CreateEventData> }) => {
      return await eventsApi.updateEvent(eventId, eventData)
    },
    onSuccess: (_, { eventId }) => {
      // Invalidate specific event and lists
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
    },
  })
}

// Delete event mutation (if needed)
export const useDeleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: string) => {
      return await eventsApi.deleteEvent(eventId)
    },
    onSuccess: () => {
      // Invalidate events lists
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
    },
  })
}
