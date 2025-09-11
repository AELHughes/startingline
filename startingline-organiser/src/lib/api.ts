// Local API client for StartingLine backend
// Replaces Supabase with local PostgreSQL database calls

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

// Event interface (matches backend types)
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
  country?: string
  latitude?: number
  longitude?: number
  license_required: boolean
  temp_license_fee?: number
  license_details?: string
  primary_image_url?: string
  gallery_images?: string[]
  description?: string
  organiser_id: string
  organiser_name?: string
  created_at: string
  updated_at: string
  distances?: EventDistance[]
  merchandise?: Merchandise[]
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
  variation_name: string
  variation_options: any
}

export interface CreateEventData {
  name: string
  category: string
  start_date: string
  start_time: string
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
  primary_image_url?: string
  gallery_images?: string[]
  description?: string
  status?: 'draft' | 'pending_approval' | 'published'
  distances?: any[]
  merchandise?: any[]
}


// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`)
  }
  
  if (!data.success) {
    throw new Error(data.error || 'API request failed')
  }
  
  return data.data
}

// ============================================
// AUTHENTICATION API
// ============================================

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    if (data.success && data.data) {
      const { user, token } = data.data
      
      // Store auth data
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('user_type', user.role)
      
      return { user, token }
    }

    return data
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getAuthHeaders()
    })

    return handleApiResponse(response)
  },

  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    })

    return handleApiResponse(response)
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      // Clear local storage regardless
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      localStorage.removeItem('user_type')
    }
  }
}

// ============================================
// EVENTS API (Local PostgreSQL)
// ============================================

export const eventsApi = {
  // Get all events (public)
  getEvents: async (): Promise<Event[]> => {
    try {
      console.log('🔍 Fetching all events from local API...')
      
      const response = await fetch(`${API_BASE}/api/events`, {
        headers: { 'Content-Type': 'application/json' }
      })

      const events = await handleApiResponse<Event[]>(response)
      console.log('✅ Retrieved', events.length, 'events from local API')
      return events
    } catch (error) {
      console.error('❌ Get events error:', error)
      throw error
    }
  },

  // Get event by slug
  getEventBySlug: async (slug: string): Promise<Event | null> => {
    try {
      console.log('🔍 Fetching event by slug:', slug)
      
      const response = await fetch(`${API_BASE}/api/events/slug/${slug}`, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.status === 404) {
        return null
      }

      const event = await handleApiResponse<Event>(response)
      console.log('✅ Retrieved event:', event.name)
      return event
    } catch (error) {
      console.error('❌ Get event by slug error:', error)
      throw error
    }
  },

  // Get event by ID
  getEvent: async (eventId: string): Promise<Event | null> => {
    try {
      console.log('🔍 Fetching event by ID:', eventId)
      
      const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.status === 404) {
        return null
      }

      const event = await handleApiResponse<Event>(response)
      console.log('✅ Retrieved event:', event.name)
      return event
    } catch (error) {
      console.error('❌ Get event by ID error:', error)
      throw error
    }
  },

  // Get my events (for organizers)
  getMyEvents: async (): Promise<Event[]> => {
    try {
      console.log('🔍 Fetching my events from local API...')
      
      const response = await fetch(`${API_BASE}/api/events/my`, {
        headers: getAuthHeaders()
      })

      const events = await handleApiResponse<Event[]>(response)
      console.log('✅ Retrieved', events.length, 'events for current organizer')
      return events
    } catch (error) {
      console.error('❌ Get my events error:', error)
      return []
    }
  },

  // Get event by ID
  getEventById: async (eventId: string): Promise<Event> => {
    try {
      console.log('🔍 Fetching event by ID:', eventId)
      
      const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
        headers: getAuthHeaders()
      })

      const event = await handleApiResponse<Event>(response)
      console.log('✅ Retrieved event:', event.name)
      return event
    } catch (error) {
      console.error('❌ Get event by ID error:', error)
      throw error
    }
  },

  // Create event
  createEvent: async (eventData: CreateEventData): Promise<Event> => {
    try {
      console.log('🔍 Creating event:', eventData.name)
      
      const response = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(eventData)
      })

      const event = await handleApiResponse<Event>(response)
      console.log('✅ Created event:', event.name)
      return event
    } catch (error) {
      console.error('❌ Create event error:', error)
      throw error
    }
  },

  // Update event
  updateEvent: async (eventId: string, eventData: Partial<CreateEventData>): Promise<Event> => {
    try {
      console.log('🔍 Updating event:', eventId)
      
      const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(eventData)
      })

      const event = await handleApiResponse<Event>(response)
      console.log('✅ Updated event:', event.name)
      return event
    } catch (error) {
      console.error('❌ Update event error:', error)
      throw error
    }
  },

  // Delete event
  deleteEvent: async (eventId: string): Promise<void> => {
    try {
      console.log('🔍 Deleting event:', eventId)
      
      const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      await handleApiResponse(response)
      console.log('✅ Deleted event:', eventId)
    } catch (error) {
      console.error('❌ Delete event error:', error)
      throw error
    }
  },

  // Get event audit trail
  getEventAuditTrail: async (eventId: string): Promise<any[]> => {
    try {
      console.log('🔍 Fetching audit trail for event:', eventId)
      
      const response = await fetch(`${API_BASE}/api/events/${eventId}/audit-trail`, {
        headers: getAuthHeaders()
      })

      const auditTrail = await handleApiResponse<any[]>(response)
      console.log('✅ Retrieved audit trail with', auditTrail.length, 'entries')
      return auditTrail
    } catch (error) {
      console.error('❌ Get audit trail error:', error)
      throw error
    }
  },

  // Admin: Get all events
  getAllEventsAdmin: async (): Promise<Event[]> => {
    try {
      console.log('🔍 Admin fetching all events')
      
      const response = await fetch(`${API_BASE}/api/events/admin/all`, {
        headers: getAuthHeaders()
      })

      const events = await handleApiResponse<Event[]>(response)
      console.log('✅ Admin retrieved', events.length, 'events')
      return events
    } catch (error) {
      console.error('❌ Admin get all events error:', error)
      throw error
    }
  },

  // Admin: Update event status with note
  updateEventStatusAdmin: async (eventId: string, status: string, adminNote?: string): Promise<Event> => {
    try {
      console.log('🔍 Admin updating event status:', eventId, 'to', status)
      
      const response = await fetch(`${API_BASE}/api/events/admin/${eventId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, adminNote })
      })

      const event = await handleApiResponse<Event>(response)
      console.log('✅ Admin updated event status successfully')
      return event
    } catch (error) {
      console.error('❌ Admin update event status error:', error)
      throw error
    }
  },

  // Admin: Get statistics
  getAdminStats: async (): Promise<any> => {
    try {
      console.log('🔍 Admin fetching statistics')
      
      const response = await fetch(`${API_BASE}/api/events/admin/stats`, {
        headers: getAuthHeaders()
      })

      const stats = await handleApiResponse<any>(response)
      console.log('✅ Admin retrieved statistics:', stats)
      return stats
    } catch (error) {
      console.error('❌ Admin get stats error:', error)
      throw error
    }
  },

  // Admin: Get recent events
  getRecentEventsAdmin: async (limit = 5): Promise<any[]> => {
    try {
      console.log('🔍 Admin fetching recent events')
      
      const response = await fetch(`${API_BASE}/api/events/admin/recent?limit=${limit}`, {
        headers: getAuthHeaders()
      })

      const events = await handleApiResponse<any[]>(response)
      console.log('✅ Admin retrieved recent events:', events.length)
      return events
    } catch (error) {
      console.error('❌ Admin get recent events error:', error)
      throw error
    }
  },

  // Update event section (admin only)
  updateEventSection: async (eventId: string, section: string, data: any): Promise<any> => {
    try {
      console.log(`🔧 Admin updating event ${eventId} section: ${section}`)
      
      const response = await fetch(`${API_BASE}/api/events/admin/${eventId}/section`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ section, data })
      })

      const result = await handleApiResponse<any>(response)
      console.log(`✅ Admin successfully updated event ${eventId} ${section} section`)
      return result
    } catch (error) {
      console.error(`❌ Admin update event section error:`, error)
      throw error
    }
  },

  // Update event status (admin only)
  updateEventStatus: async (eventId: string, status: string, adminNote?: string): Promise<any> => {
    try {
      console.log(`🔧 Admin updating event ${eventId} status to: ${status}`)
      
      const response = await fetch(`${API_BASE}/api/events/admin/${eventId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, adminNote })
      })

      const result = await handleApiResponse<any>(response)
      console.log(`✅ Admin successfully updated event ${eventId} status to ${status}`)
      return result
    } catch (error) {
      console.error(`❌ Admin update event status error:`, error)
      throw error
    }
  }
}

// ============================================
// USER API
// ============================================

export const userApi = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getAuthHeaders()
    })

    return handleApiResponse(response)
  },

  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    })

    return handleApiResponse(response)
  }
}

// ============================================
// NOTIFICATIONS API
// ============================================

export const notificationsApi = {
  // Get user notifications
  getNotifications: async (limit = 50): Promise<any[]> => {
    try {
      console.log('🔍 Fetching notifications')
      
      const response = await fetch(`${API_BASE}/api/notifications?limit=${limit}`, {
        headers: getAuthHeaders()
      })

      const notifications = await handleApiResponse<any[]>(response)
      console.log('✅ Retrieved', notifications.length, 'notifications')
      return notifications
    } catch (error) {
      console.error('❌ Get notifications error:', error)
      return []
    }
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications/unread-count`, {
        headers: getAuthHeaders()
      })

      const result = await handleApiResponse<{ count: number }>(response)
      return result.count
    } catch (error) {
      console.error('❌ Get unread count error:', error)
      return 0
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })

      await handleApiResponse(response)
      console.log('✅ Marked notification as read:', notificationId)
    } catch (error) {
      console.error('❌ Mark notification read error:', error)
      throw error
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })

      await handleApiResponse(response)
      console.log('✅ Marked all notifications as read')
    } catch (error) {
      console.error('❌ Mark all notifications read error:', error)
      throw error
    }
  }
}

// ============================================
// MESSAGES API
// ============================================

export const messagesApi = {
  // Get user messages
  getMessages: async (limit = 50): Promise<any[]> => {
    try {
      console.log('🔍 Fetching messages')
      
      const response = await fetch(`${API_BASE}/api/messages?limit=${limit}`, {
        headers: getAuthHeaders()
      })

      const messages = await handleApiResponse<any[]>(response)
      console.log('✅ Retrieved', messages.length, 'messages')
      return messages
    } catch (error) {
      console.error('❌ Get messages error:', error)
      return []
    }
  },

  // Get unread message count
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE}/api/messages/unread-count`, {
        headers: getAuthHeaders()
      })

      const result = await handleApiResponse<{ count: number }>(response)
      return result.count
    } catch (error) {
      console.error('❌ Get unread message count error:', error)
      return 0
    }
  },

  // Get message thread
  getThread: async (messageId: string): Promise<any[]> => {
    try {
      console.log('🔍 Fetching message thread:', messageId)
      
      const response = await fetch(`${API_BASE}/api/messages/${messageId}/thread`, {
        headers: getAuthHeaders()
      })

      const thread = await handleApiResponse<any[]>(response)
      console.log('✅ Retrieved message thread with', thread.length, 'messages')
      return thread
    } catch (error) {
      console.error('❌ Get message thread error:', error)
      throw error
    }
  },

  // Send message
  sendMessage: async (messageData: {
    recipientId: string
    subject: string
    body: string
    eventId?: string
    parentMessageId?: string
  }): Promise<any> => {
    try {
      console.log('🔍 Sending message:', messageData.subject)
      
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData)
      })

      const message = await handleApiResponse<any>(response)
      console.log('✅ Message sent successfully')
      return message
    } catch (error) {
      console.error('❌ Send message error:', error)
      throw error
    }
  },

  // Mark message as read
  markAsRead: async (messageId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })

      await handleApiResponse(response)
      console.log('✅ Marked message as read:', messageId)
    } catch (error) {
      console.error('❌ Mark message read error:', error)
      throw error
    }
  }
}

// ============================================
// STORAGE API
// ============================================

export const storageApi = {
  uploadImage: async (file: File, folder: string = 'events'): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', folder)

      const response = await fetch(`${API_BASE}/api/storage/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      })

      const result = await handleApiResponse<{ url: string }>(response)
      return result.url
    } catch (error) {
      console.error('Upload image error:', error)
      throw error
    }
  }
}

// ============================================
// ARTICLES API (WordPress integration)
// ============================================

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

      const url = `${API_BASE}/api/articles${searchParams.toString() ? '?' + searchParams.toString() : ''}`
      
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' }
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
      const response = await fetch(`${API_BASE}/api/articles/${slug}`, {
        headers: { 'Content-Type': 'application/json' }
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
      const response = await fetch(`${API_BASE}/api/articles/meta/categories`, {
        headers: { 'Content-Type': 'application/json' }
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

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
