// User Types
export interface User {
  id: string
  auth_user_id: string
  email: string
  first_name: string
  last_name: string
  role: 'organiser' | 'admin' | 'participant'
  created_at: Date
  updated_at: Date
}

export interface CreateUserData {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'organiser' | 'admin' | 'participant'
}

export interface LoginData {
  email: string
  password: string
}

// Event Types
export interface Event {
  id: string
  name: string
  slug?: string
  category: EventCategory
  organiser_id: string
  organiser_name?: string
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
  status: 'draft' | 'pending_approval' | 'published' | 'cancelled'
  created_at: Date
  updated_at: Date
  distances?: EventDistance[]
  merchandise?: Merchandise[]
}

export type EventCategory = 
  | 'road-cycling'
  | 'road-running'
  | 'mountain-biking'
  | 'triathlon'

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
  created_at: Date
}

export interface CreateDistanceData {
  name: string
  distance_km: number
  price: number
  min_age?: number
  entry_limit?: number
  start_time?: string
  free_for_seniors?: boolean
  free_for_disability?: boolean
  senior_age_threshold?: number
}

// Merchandise Types
export interface Merchandise {
  id: string
  event_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  variations?: MerchandiseVariation[]
  created_at: Date
}

export interface MerchandiseVariation {
  id: string
  merchandise_id: string
  variation_name: string
  variation_options: any
  created_at: Date
}

export interface CreateMerchandiseData {
  name: string
  description?: string
  price: number
  variations?: MerchandiseVariation[]
  image_url?: string
}

export interface CreateEventData {
  name: string
  category: EventCategory
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
  distances?: CreateDistanceData[]
  merchandise?: CreateMerchandiseData[]
}

// Ticket Types
export interface Ticket {
  id: string
  event_id: string
  participant_id: string
  distance_id: string
  quantity: number
  price: number
  status: 'active' | 'cancelled' | 'refunded'
  created_at: Date
  updated_at: Date
}

// Payment Types
export interface Payment {
  id: string
  event_id: string
  participant_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: string
  transaction_id?: string
  created_at: Date
  updated_at: Date
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// JWT Token Payload
export interface JwtPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

// Request Types with User
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
    role: string
  }
}
