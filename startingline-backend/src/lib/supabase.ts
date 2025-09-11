import { createClient } from '@supabase/supabase-js'

// Supabase Configuration (updated with new API keys)
const supabaseUrl = 'https://kjeoqaoinkcrbukoqjfn.supabase.co'
const supabaseAnonKey = 'sb_publishable_F1XuyCaFXBxc_ZM2iPXB2w_FALDVqIO'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZW9xYW9pbmtjcmJ1a29xamZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA4NzIzMywiZXhwIjoyMDcyNjYzMjMzfQ.s5J6hqsj2rASYiPyK6Ml7PGOEsqgbxOdxnhUPmadolg'

// Debug logging
console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  anonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
  serviceKey: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'MISSING'
})

// Create Supabase client for regular operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create Supabase admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types (simplified for now)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_user_id: string
          email: string
          first_name: string
          last_name: string
          role: 'organiser' | 'admin' | 'participant'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          email: string
          first_name: string
          last_name: string
          role: 'organiser' | 'admin' | 'participant'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'organiser' | 'admin' | 'participant'
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          name: string
          slug?: string
          category: string
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string
          category: string
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
          status?: 'draft' | 'pending_approval' | 'published' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category?: string
          organiser_id?: string
          organiser_name?: string
          start_date?: string
          start_time?: string
          venue_name?: string
          address?: string
          city?: string
          province?: string
          country?: string
          latitude?: number
          longitude?: number
          license_required?: boolean
          temp_license_fee?: number
          license_details?: string
          primary_image_url?: string
          gallery_images?: string[]
          description?: string
          status?: 'draft' | 'pending_approval' | 'published' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      event_distances: {
        Row: {
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
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          distance_km: number
          price: number
          min_age?: number
          entry_limit?: number
          start_time?: string
          free_for_seniors?: boolean
          free_for_disability?: boolean
          senior_age_threshold?: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          distance_km?: number
          price?: number
          min_age?: number
          entry_limit?: number
          start_time?: string
          free_for_seniors?: boolean
          free_for_disability?: boolean
          senior_age_threshold?: number
          created_at?: string
        }
      }
      event_merchandise: {
        Row: {
          id: string
          event_id: string
          name: string
          description?: string
          price: number
          image_url?: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string
          price: number
          image_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          description?: string
          price?: number
          image_url?: string
          created_at?: string
        }
      }
      merchandise_variations: {
        Row: {
          id: string
          merchandise_id: string
          variation_name: string
          variation_options: any
          created_at: string
        }
        Insert: {
          id?: string
          merchandise_id: string
          variation_name: string
          variation_options: any
          created_at?: string
        }
        Update: {
          id?: string
          merchandise_id?: string
          variation_name?: string
          variation_options?: any
          created_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
