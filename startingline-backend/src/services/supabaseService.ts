import { supabase, supabaseAdmin, type Tables, type TablesInsert, type TablesUpdate } from '../lib/supabase'
import type { User, Event, Ticket, Payment } from '../types'

export class SupabaseService {
  
  // ============================================
  // USER OPERATIONS
  // ============================================
  
  async createUser(userData: TablesInsert<'users'>): Promise<Tables<'users'>> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create user: ${error.message}`)
    return data
  }

  async getUserById(id: string): Promise<Tables<'users'> | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user: ${error.message}`)
    }
    
    return data
  }

  async getUserByAuthId(authUserId: string): Promise<Tables<'users'> | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user: ${error.message}`)
    }
    
    return data
  }

  async getUserByEmail(email: string): Promise<Tables<'users'> | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get user: ${error.message}`)
    }
    
    return data
  }

  async updateUser(id: string, updates: TablesUpdate<'users'>): Promise<Tables<'users'>> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update user: ${error.message}`)
    return data
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete user: ${error.message}`)
  }

  // ============================================
  // EVENT OPERATIONS
  // ============================================

  async getAllEvents(): Promise<Tables<'events'>[]> {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(`Failed to get events: ${error.message}`)
    return data || []
  }

  async getEventById(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_distances (
          id,
          name,
          distance_km,
          price,
          min_age,
          entry_limit,
          start_time,
          free_for_seniors,
          free_for_disability,
          senior_age_threshold
        ),
        event_merchandise (
          id,
          name,
          description,
          price,
          image_url,
          merchandise_variations (
            id,
            variation_name,
            variation_options
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get event: ${error.message}`)
    }
    
    if (data) {
      // Transform the data to match the expected format
      return {
        ...data,
        distances: data.event_distances || [],
        merchandise: data.event_merchandise || []
      }
    }
    
    return null
  }

  async getEventBySlug(slug: string): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        event_distances (
          id,
          name,
          distance_km,
          price,
          min_age,
          entry_limit,
          start_time,
          free_for_seniors,
          free_for_disability,
          senior_age_threshold
        ),
        event_merchandise (
          id,
          name,
          description,
          price,
          image_url
        )
      `)
      .eq('slug', slug)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get event by slug: ${error.message}`)
    }
    
    if (data) {
      // Transform the data to match the expected format
      return {
        ...data,
        distances: data.event_distances || [],
        merchandise: data.event_merchandise || []
      }
    }
    
    return null
  }

  async createEvent(eventData: TablesInsert<'events'>): Promise<Tables<'events'>> {
    // Use supabaseAdmin since we're already validating auth in the middleware
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({
        ...eventData,
        // Ensure we're using the auth_user_id for the foreign key
        organiser_id: eventData.organiser_id
      })
      .select('*')
      .single()
    
    if (error) throw new Error(`Failed to create event: ${error.message}`)
    return data
  }

  async createEventDistance(distanceData: any): Promise<any> {
    // Use supabaseAdmin to bypass RLS for event creation
    const { data, error } = await supabaseAdmin
      .from('event_distances')
      .insert(distanceData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create event distance: ${error.message}`)
    return data
  }

  async createMerchandise(merchandiseData: any): Promise<any> {
    // Use supabaseAdmin to bypass RLS for event creation
    const { data, error } = await supabaseAdmin
      .from('event_merchandise')
      .insert(merchandiseData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create merchandise: ${error.message}`)
    return data
  }

  async createMerchandiseVariation(variationData: any): Promise<any> {
    // Use supabaseAdmin to bypass RLS for event creation
    const { data, error } = await supabaseAdmin
      .from('merchandise_variations')
      .insert(variationData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create merchandise variation: ${error.message}`)
    return data
  }
  
  async updateEvent(id: string, updates: TablesUpdate<'events'>): Promise<Tables<'events'>> {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) throw new Error(`Failed to update event: ${error.message}`)
    return data
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete event: ${error.message}`)
  }

  // ============================================
  // TICKET OPERATIONS
  // ============================================

  async createTicket(ticketData: any): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('tickets')
      .insert(ticketData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create ticket: ${error.message}`)
    return data
  }

  async getTicketsByEvent(eventId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('event_id', eventId)
    
    if (error) throw new Error(`Failed to get tickets: ${error.message}`)
    return data || []
  }

  async getTicketsByParticipant(participantId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('participant_id', participantId)
    
    if (error) throw new Error(`Failed to get tickets: ${error.message}`)
    return data || []
  }

  async updateTicket(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update ticket: ${error.message}`)
    return data
  }

  async deleteTicket(id: string): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete ticket: ${error.message}`)
  }

  // ============================================
  // PAYMENT OPERATIONS
  // ============================================

  async createPayment(paymentData: any): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert(paymentData)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create payment: ${error.message}`)
    return data
  }

  async getPaymentsByEvent(eventId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('event_id', eventId)
    
    if (error) throw new Error(`Failed to get payments: ${error.message}`)
    return data || []
  }

  async getPaymentsByParticipant(participantId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('participant_id', participantId)
    
    if (error) throw new Error(`Failed to get payments: ${error.message}`)
    return data || []
  }

  async updatePayment(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update payment: ${error.message}`)
    return data
  }

  async deletePayment(id: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete payment: ${error.message}`)
  }

  // ============================================
  // ANALYTICS OPERATIONS
  // ============================================

  async getEventStats(eventId: string): Promise<any> {
    // Get basic event info
    const event = await this.getEventById(eventId)
    if (!event) throw new Error('Event not found')

    // Get ticket count and revenue
    const tickets = await this.getTicketsByEvent(eventId)
    const payments = await this.getPaymentsByEvent(eventId)

    const totalTickets = tickets.length
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)

    return {
      event,
      totalTickets,
      totalRevenue,
      tickets,
      payments
    }
  }

  async getDashboardStats(organiserId?: string): Promise<any> {
    let eventsQuery = supabase.from('events').select('*')
    
    if (organiserId) {
      eventsQuery = eventsQuery.eq('organiser_id', organiserId)
    }

    const { data: events, error: eventsError } = await eventsQuery
    
    if (eventsError) throw new Error(`Failed to get events: ${eventsError.message}`)

    const totalEvents = events?.length || 0
    const publishedEvents = events?.filter(e => e.status === 'published').length || 0
    const draftEvents = events?.filter(e => e.status === 'draft').length || 0
    const pendingEvents = events?.filter(e => e.status === 'pending_approval').length || 0

    return {
      totalEvents,
      publishedEvents,
      draftEvents,
      pendingEvents,
      events: events || []
    }
  }
}
