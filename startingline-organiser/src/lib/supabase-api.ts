import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kjeoqaoinkcrbukoqjfn.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_F1XuyCaFXBxc_ZM2iPXB2w_FALDVqIO'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Event interface
export interface Event {
  id: string
  name: string
  slug?: string
  category: string
  status: 'draft' | 'pending_approval' | 'published' | 'cancelled'
  start_date: string
  start_time: string
  venue_name?: string
  address: string
  city: string
  province: string
  license_required: boolean
  temp_license_fee?: number
  license_details?: string
  primary_image_url?: string
  image_url?: string
  gallery_images?: string[]
  description?: string
  organiser_id: string
  organiser_name?: string
  created_at: string
  updated_at: string
  event_distances?: EventDistance[]
  distances?: EventDistance[]
  merchandise?: Merchandise[]
  event_type?: string
  location?: string
  price?: string
}

export interface EventDistance {
  id: string
  event_id: string
  name: string
  distance_km: number
  price: number
  min_age?: number
  entry_limit?: number
  start_time?: string
  free_for_seniors: boolean
  free_for_disability: boolean
  senior_age_threshold?: number
}

export interface Merchandise {
  id: string
  event_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  variations?: MerchandiseVariation[]
}

export interface MerchandiseVariation {
  id: string
  merchandise_id: string
  name: string
  options: string[]
}

export interface CreateEventData {
  name: string
  category: string
  start_date: string
  start_time: string
  venue?: string
  venue_name?: string
  address: string
  city: string
  province: string
  country?: string
  latitude?: number
  longitude?: number
  license_required: boolean
  temp_license_fee?: number
  license_details?: string
  image_url?: string
  primary_image_url?: string
  gallery_images?: string[]
  description?: string
  status?: 'draft' | 'pending_approval' | 'published'
  distances?: any[]
  merchandise?: any[]
}

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    if (data.success && data.data) {
      const { user, token } = data.data
      
      // Store auth data
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('user_type', user.role)
      
      return { user, token }
    } else {
      throw new Error('Invalid response format')
    }
  },

  register: async (userData: any) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    return data
  },

  logout: async () => {
    // Clear local storage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('user_type')
  }
}

// Events API
export const eventsApi = {
  // Get all events
  getEvents: async (): Promise<Event[]> => {
    try {
      console.log('🔍 Starting getEvents query...')
      
      // Use simple query to avoid complex join issues
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true })

      console.log('🔍 getEvents query result:', { data, error })

      if (error) {
        console.error('❌ Get events error:', error)
        throw error
      }

      if (!data) {
        console.log('⚠️ No data returned from getEvents')
        return []
      }

      console.log('✅ getEvents found', data.length, 'events')

      // Transform the data to match the expected format and fetch distances
      const transformed = await Promise.all(data.map(async (event) => {
        // Fetch distances for this event
        const { data: distancesData } = await supabase
          .from('event_distances')
          .select('*')
          .eq('event_id', event.id)

        return {
          ...event,
          // Map database fields to expected frontend fields
          event_type: event.category || 'cycling',
          location: event.venue_name || event.city || 'Unknown Location',
          address: event.address_line_1 || event.address || '',
          image_url: event.primary_image_url || event.image_url,
          // Include actual distances data
          event_distances: distancesData || [],
          merchandise: []
        }
      }))

      console.log('✅ getEvents transformed:', transformed)
      return transformed
    } catch (error) {
      console.error('❌ Get events error:', error)
      throw error
    }
  },

  // Get event by slug
  getEventBySlug: async (slug: string): Promise<Event | null> => {
    try {
      console.log('🔍 Fetching event with slug:', slug)

      // First try a simple query without joins
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single()

      console.log('🔍 Event fetch result by slug:', { data, error })
      
      if (error) {
        console.error('❌ Event fetch by slug error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          slug: slug
        })
        
        // If it's a "not found" error, return null instead of throwing
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No event found with slug:', slug)
          return null
        }
        
        throw error
      }

      // If simple query works, try to get related data separately
      let eventData = data as any

      // Get distances
      const { data: distancesData, error: distancesError } = await supabase
        .from('event_distances')
        .select('*')
        .eq('event_id', eventData.id)

      if (distancesError) {
        console.error('Error fetching distances:', distancesError)
        eventData.distances = []
      } else {
        eventData.distances = distancesData || []
      }

      // Get merchandise from event_merchandise table (the correct table)
      console.log('🔍 Fetching merchandise from event_merchandise table for event:', eventData.id)
      
      // First try a simple query without variations
      const { data: merchandiseData, error: merchandiseError } = await supabase
        .from('event_merchandise')
        .select('*')
        .eq('event_id', eventData.id)

      console.log('🔍 Merchandise fetch result:', { merchandiseData, merchandiseError })
      console.log('🔍 Merchandise data details:', 
        merchandiseData?.map(m => ({ id: m.id, name: m.name, price: m.price })))

      if (merchandiseError) {
        console.error('Error fetching merchandise:', merchandiseError)
        eventData.merchandise = []
      } else {
        // For each merchandise item, get its variations
        const merchandiseWithVariations = await Promise.all(
          (merchandiseData || []).map(async (merch) => {
            const { data: variations, error: variationsError } = await supabase
              .from('merchandise_variations')
              .select('*')
              .eq('merchandise_id', merch.id)

            if (variationsError) {
              console.error('Error fetching variations for merch:', merch.id, variationsError)
            }

            return {
              ...merch,
              variations: variations || []
            }
          })
        )

        eventData.merchandise = merchandiseWithVariations
      }

      console.log('🔍 Final event data with related data:', {
        id: eventData.id,
        name: eventData.name,
        distancesCount: eventData.distances?.length || 0,
        merchandiseCount: eventData.merchandise?.length || 0
      })

      return eventData
    } catch (error) {
      console.error('❌ Event fetch by slug error:', error)
      throw error
    }
  },

  // Get event by ID (fallback)
  getEvent: async (eventId: string): Promise<Event | null> => {
    try {
      console.log('🔍 Fetching event with ID:', eventId)

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      // Get related data
      const [distancesResult, merchandiseResult] = await Promise.all([
        supabase.from('event_distances').select('*').eq('event_id', eventId),
        supabase.from('event_merchandise').select('*').eq('event_id', eventId)
      ])

      return {
        ...data,
        distances: distancesResult.data || [],
        merchandise: merchandiseResult.data || []
      }
    } catch (error) {
      console.error('❌ Event fetch by ID error:', error)
      throw error
    }
  },

  // Get my events (for organisers)
  getMyEvents: async (): Promise<Event[]> => {
    try {
      console.log('🔍 Fetching all events for organizer dashboard...')

      // Use simple query to avoid complex join issues
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('🔍 Events query result:', { data, error })

      if (error) {
        console.error('❌ Events query error:', error)
        throw error
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ No events found')
        return []
      }

      // Transform the data to match the expected format
      const transformedEvents = await Promise.all(data.map(async (event) => {
        // Fetch distances for this event
        const { data: distancesData } = await supabase
          .from('event_distances')
          .select('*')
          .eq('event_id', event.id)

        // Fetch merchandise for this event (simplified query first)
        const { data: merchandiseData } = await supabase
          .from('event_merchandise')
          .select('*')
          .eq('event_id', event.id)

        return {
          ...event,
          // Map database fields to expected frontend fields
          event_type: event.category || 'cycling',
          location: event.venue_name || event.city || 'Unknown Location',
          address: event.address_line_1 || event.address || '',
          image_url: event.primary_image_url || event.image_url,
          // Include actual data
          event_distances: distancesData || [],
          merchandise: merchandiseData || []
        }
      }))

      console.log('✅ Transformed events:', transformedEvents)
      return transformedEvents
    } catch (error) {
      console.error('Get my events error:', error)
      return []
    }
  },

  // Create event
  createEvent: async (eventData: CreateEventData): Promise<Event> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event')
      }

      return result.data
    } catch (error) {
      console.error('Create event error:', error)
      throw error
    }
  }
}

// User API
export const userApi = {
  getProfile: async (): Promise<ApiResponse<any>> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile')
      }

      return result
    } catch (error) {
      console.error('Get profile error:', error)
      throw error
    }
  },

  updateProfile: async (profileData: any): Promise<ApiResponse<any>> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile')
      }

      return result
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }
}

// Storage API
export const storageApi = {
  uploadImage: async (file: File, folder: string = 'events'): Promise<string> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', folder)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/storage/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image')
      }

      return result.data.url
    } catch (error) {
      console.error('Upload image error:', error)
      throw error
    }
  }
}

// Articles API for WordPress content
export interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string | null
  author: string
  publishedDate: string
  modifiedDate: string
  categories: string[]
  tags: string[]
  commentCount: number
  url: string
}

export interface ArticleCategory {
  slug: string
  name: string
  count: number
}

export class ArticlesApi {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
  }

  async getAllArticles(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
  }): Promise<{
    success: boolean
    data: Article[]
    pagination: {
      page: number
      limit: number
      total: number
    }
    error?: string
  }> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.search) searchParams.append('search', params.search)
      if (params?.category) searchParams.append('category', params.category)

      const url = `${this.baseUrl}/api/articles${searchParams.toString() ? '?' + searchParams.toString() : ''}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch articles')
      }

      return result
    } catch (error) {
      console.error('Get articles error:', error)
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 12, total: 0 },
        error: error instanceof Error ? error.message : 'Failed to fetch articles'
      }
    }
  }

  async getArticleBySlug(slug: string): Promise<{
    success: boolean
    data?: Article
    error?: string
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/articles/${slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch article')
      }

      return result
    } catch (error) {
      console.error('Get article error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch article'
      }
    }
  }

  async getCategories(): Promise<{
    success: boolean
    data: ArticleCategory[]
    error?: string
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/articles/meta/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch categories')
      }

      return result
    } catch (error) {
      console.error('Get categories error:', error)
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch categories'
      }
    }
  }
}

export const articlesApi = new ArticlesApi()
