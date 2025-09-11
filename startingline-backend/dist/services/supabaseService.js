"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const supabase_1 = require("../lib/supabase");
class SupabaseService {
    async createUser(userData) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('users')
            .insert(userData)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to create user: ${error.message}`);
        return data;
    }
    async getUserById(id) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to get user: ${error.message}`);
        }
        return data;
    }
    async getUserByAuthId(authUserId) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('auth_user_id', authUserId)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to get user: ${error.message}`);
        }
        return data;
    }
    async getUserByEmail(email) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to get user: ${error.message}`);
        }
        return data;
    }
    async updateUser(id, updates) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to update user: ${error.message}`);
        return data;
    }
    async deleteUser(id) {
        const { error } = await supabase_1.supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);
        if (error)
            throw new Error(`Failed to delete user: ${error.message}`);
    }
    async getAllEvents() {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(`Failed to get events: ${error.message}`);
        return data || [];
    }
    async getEventById(id) {
        const { data, error } = await supabase_1.supabase
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
            .single();
        if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to get event: ${error.message}`);
        }
        if (data) {
            return {
                ...data,
                distances: data.event_distances || [],
                merchandise: data.event_merchandise || []
            };
        }
        return null;
    }
    async getEventBySlug(slug) {
        const { data, error } = await supabase_1.supabaseAdmin
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
            .single();
        if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to get event by slug: ${error.message}`);
        }
        if (data) {
            return {
                ...data,
                distances: data.event_distances || [],
                merchandise: data.event_merchandise || []
            };
        }
        return null;
    }
    async createEvent(eventData) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('events')
            .insert({
            ...eventData,
            organiser_id: eventData.organiser_id
        })
            .select('*')
            .single();
        if (error)
            throw new Error(`Failed to create event: ${error.message}`);
        return data;
    }
    async createEventDistance(distanceData) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('event_distances')
            .insert(distanceData)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to create event distance: ${error.message}`);
        return data;
    }
    async createMerchandise(merchandiseData) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('event_merchandise')
            .insert(merchandiseData)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to create merchandise: ${error.message}`);
        return data;
    }
    async createMerchandiseVariation(variationData) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('merchandise_variations')
            .insert(variationData)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to create merchandise variation: ${error.message}`);
        return data;
    }
    async updateEvent(id, updates) {
        const { data, error } = await supabase_1.supabase
            .from('events')
            .update(updates)
            .eq('id', id)
            .select('*')
            .single();
        if (error)
            throw new Error(`Failed to update event: ${error.message}`);
        return data;
    }
    async deleteEvent(id) {
        const { error } = await supabase_1.supabase
            .from('events')
            .delete()
            .eq('id', id);
        if (error)
            throw new Error(`Failed to delete event: ${error.message}`);
    }
    async createTicket(ticketData) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('tickets')
            .insert(ticketData)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to create ticket: ${error.message}`);
        return data;
    }
    async getTicketsByEvent(eventId) {
        const { data, error } = await supabase_1.supabase
            .from('tickets')
            .select('*')
            .eq('event_id', eventId);
        if (error)
            throw new Error(`Failed to get tickets: ${error.message}`);
        return data || [];
    }
    async getTicketsByParticipant(participantId) {
        const { data, error } = await supabase_1.supabase
            .from('tickets')
            .select('*')
            .eq('participant_id', participantId);
        if (error)
            throw new Error(`Failed to get tickets: ${error.message}`);
        return data || [];
    }
    async updateTicket(id, updates) {
        const { data, error } = await supabase_1.supabase
            .from('tickets')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to update ticket: ${error.message}`);
        return data;
    }
    async deleteTicket(id) {
        const { error } = await supabase_1.supabase
            .from('tickets')
            .delete()
            .eq('id', id);
        if (error)
            throw new Error(`Failed to delete ticket: ${error.message}`);
    }
    async createPayment(paymentData) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('payments')
            .insert(paymentData)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to create payment: ${error.message}`);
        return data;
    }
    async getPaymentsByEvent(eventId) {
        const { data, error } = await supabase_1.supabase
            .from('payments')
            .select('*')
            .eq('event_id', eventId);
        if (error)
            throw new Error(`Failed to get payments: ${error.message}`);
        return data || [];
    }
    async getPaymentsByParticipant(participantId) {
        const { data, error } = await supabase_1.supabase
            .from('payments')
            .select('*')
            .eq('participant_id', participantId);
        if (error)
            throw new Error(`Failed to get payments: ${error.message}`);
        return data || [];
    }
    async updatePayment(id, updates) {
        const { data, error } = await supabase_1.supabase
            .from('payments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(`Failed to update payment: ${error.message}`);
        return data;
    }
    async deletePayment(id) {
        const { error } = await supabase_1.supabase
            .from('payments')
            .delete()
            .eq('id', id);
        if (error)
            throw new Error(`Failed to delete payment: ${error.message}`);
    }
    async getEventStats(eventId) {
        const event = await this.getEventById(eventId);
        if (!event)
            throw new Error('Event not found');
        const tickets = await this.getTicketsByEvent(eventId);
        const payments = await this.getPaymentsByEvent(eventId);
        const totalTickets = tickets.length;
        const totalRevenue = payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);
        return {
            event,
            totalTickets,
            totalRevenue,
            tickets,
            payments
        };
    }
    async getDashboardStats(organiserId) {
        let eventsQuery = supabase_1.supabase.from('events').select('*');
        if (organiserId) {
            eventsQuery = eventsQuery.eq('organiser_id', organiserId);
        }
        const { data: events, error: eventsError } = await eventsQuery;
        if (eventsError)
            throw new Error(`Failed to get events: ${eventsError.message}`);
        const totalEvents = events?.length || 0;
        const publishedEvents = events?.filter(e => e.status === 'published').length || 0;
        const draftEvents = events?.filter(e => e.status === 'draft').length || 0;
        const pendingEvents = events?.filter(e => e.status === 'pending_approval').length || 0;
        return {
            totalEvents,
            publishedEvents,
            draftEvents,
            pendingEvents,
            events: events || []
        };
    }
}
exports.SupabaseService = SupabaseService;
//# sourceMappingURL=supabaseService.js.map