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
  },

  // Get admin comments for an event
  getAdminComments: async (eventId: string): Promise<any[]> => {
    try {
      console.log('🔍 Fetching admin comments for event:', eventId)
      
      const response = await fetch(`${API_BASE}/api/events/${eventId}/admin-comments`, {
        headers: getAuthHeaders()
      })

      const comments = await handleApiResponse<any[]>(response)
      console.log('✅ Retrieved', comments.length, 'admin comments')
      return comments
    } catch (error) {
      console.error('❌ Get admin comments error:', error)
      throw error
    }
  },

  // Create admin comment (admin only)
  createAdminComment: async (eventId: string, section: string, comment: string): Promise<any> => {
    try {
      console.log('🔍 Creating admin comment for event:', eventId, 'section:', section)
      
      const response = await fetch(`${API_BASE}/api/events/${eventId}/admin-comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ section, comment })
      })

      const result = await handleApiResponse<any>(response)
      console.log('✅ Admin comment created successfully')
      return result
    } catch (error) {
      console.error('❌ Create admin comment error:', error)
      throw error
    }
  },

  // Update admin comment (admin only)
  updateAdminComment: async (commentId: string, comment?: string, status?: string): Promise<any> => {
    try {
      console.log('🔍 Updating admin comment:', commentId)
      
      const response = await fetch(`${API_BASE}/api/events/admin-comments/${commentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comment, status })
      })

      const result = await handleApiResponse<any>(response)
      console.log('✅ Admin comment updated successfully')
      return result
    } catch (error) {
      console.error('❌ Update admin comment error:', error)
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
  // Get admin user ID (for organisers)
  getAdminId: async (): Promise<any> => {
    try {
      console.log('🔍 Fetching admin user ID')
      
      const response = await fetch(`${API_BASE}/api/messages/admin-id`, {
        headers: getAuthHeaders()
      })

      const adminData = await handleApiResponse<any>(response)
      console.log('✅ Admin user ID retrieved successfully')
      return adminData
    } catch (error) {
      console.error('❌ Get admin user ID error:', error)
      throw error
    }
  },

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

// Participant Registration API
export interface ParticipantData {
  first_name: string
  last_name: string
  email: string
  mobile: string
  date_of_birth: string
  disabled?: boolean
  medical_aid_name?: string
  medical_aid_number?: string
  emergency_contact_name: string
  emergency_contact_number: string
  merchandise?: Array<{
    merchandise_id: string
    variation_id?: string
    quantity: number
    unit_price: number
  }>
}

export interface RegistrationDetails {
  event: Event & {
    distances: EventDistance[]
    merchandise: Merchandise[]
  }
}

export interface OrderData {
  event_id: string
  account_holder_first_name: string
  account_holder_last_name: string
  account_holder_email: string
  account_holder_mobile: string
  account_holder_company?: string
  account_holder_address: string
  emergency_contact_name: string
  emergency_contact_number: string
  account_holder_password?: string
  participants: Array<{
    distance_id: string
    participant: ParticipantData
  }>
}

export interface SavedParticipant {
  id: string
  first_name: string
  last_name: string
  email: string
  mobile: string
  date_of_birth: string
  medical_aid_name?: string
  medical_aid_number?: string
  emergency_contact_name: string
  emergency_contact_number: string
  created_at: string
}

export interface Order {
  id: string
  event_id: string
  total_amount: number
  status: string
  created_at: string
  event_name: string
  start_date: string
  start_time: string
  city: string
  tickets: Array<{
    id: string
    ticket_number: string
    participant_name: string
    participant_email: string
    amount: number
    status: string
  }>
}

export interface Ticket {
  id: string
  ticket_number: string
  event_name: string
  start_date: string
  start_time: string
  venue_name?: string
  address: string
  city: string
  distance_name: string
  distance_price: number
  participant_first_name: string
  participant_last_name: string
  participant_email: string
  participant_mobile: string
  participant_date_of_birth: string
  participant_disabled: boolean
  participant_medical_aid_name?: string
  participant_medical_aid_number?: string
  emergency_contact_name: string
  emergency_contact_number: string
  amount: number
  status: string
  merchandise: Array<{
    merchandise_name: string
    description: string
    image_url?: string
    variation_name?: string
    variation_options?: any
    quantity: number
    unit_price: number
    total_price: number
  }>
}

class ParticipantRegistrationApi {
  async getRegistrationDetails(eventId: string): Promise<{
    success: boolean
    data?: RegistrationDetails
    error?: string
  }> {
    try {
      const response = await fetch(`${API_BASE}/api/participant-registration/event/${eventId}/registration-details`, {
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get registration details')
      }

      return result
    } catch (error) {
      console.error('Get registration details error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get registration details'
      }
    }
  }

  async validateParticipant(distanceId: string, dateOfBirth: string, disabled?: boolean): Promise<{
    success: boolean
    data?: {
      age: number
      min_age_met: boolean
      is_free: boolean
      reason: string
    }
    error?: string
  }> {
    try {
      const response = await fetch(`${API_BASE}/api/participant-registration/validate-participant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distance_id: distanceId,
          date_of_birth: dateOfBirth,
          disabled
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to validate participant')
      }

      return result
    } catch (error) {
      console.error('Validate participant error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate participant'
      }
    }
  }

  async getSavedParticipants(): Promise<{
    success: boolean
    data?: SavedParticipant[]
    error?: string
  }> {
    try {
      const response = await fetch(`${API_BASE}/api/participant-registration/saved-participants`, {
        headers: getAuthHeaders()
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get saved participants')
      }

      return result
    } catch (error) {
      console.error('Get saved participants error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get saved participants'
      }
    }
  }

  async saveParticipant(participantData: Omit<SavedParticipant, 'id' | 'created_at'>): Promise<{
    success: boolean
    data?: SavedParticipant
    error?: string
  }> {
    try {
      const response = await fetch(`${API_BASE}/api/participant-registration/save-participant`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(participantData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save participant')
      }

      return result
    } catch (error) {
      console.error('Save participant error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save participant'
      }
    }
  }

  async register(orderData: OrderData): Promise<{
    success: boolean
    data?: {
      order: any
      tickets: any[]
    }
    error?: string
  }> {
    try {
      const response = await fetch(`${API_BASE}/api/participant-registration/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register')
      }

      return result
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register'
      }
    }
  }

  async getMyOrders(): Promise<{
    success: boolean
    data?: Order[]
    error?: string
  }> {
    try {
      const response = await fetch(`${API_BASE}/api/participant-registration/my-orders`, {
        headers: getAuthHeaders()
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get orders')
      }

      return result
    } catch (error) {
      console.error('Get my orders error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get orders'
      }
    }
  }

  async getTicket(ticketId: string): Promise<{
    success: boolean
    data?: Ticket
    error?: string
  }> {
    try {
      const response = await fetch(`${API_BASE}/api/participant-registration/ticket/${ticketId}`, {
        headers: getAuthHeaders()
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get ticket')
      }

      return result
    } catch (error) {
      console.error('Get ticket error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get ticket'
      }
    }
  }
}

export const participantRegistrationApi = new ParticipantRegistrationApi()

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
