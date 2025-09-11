import { type Tables, type TablesInsert, type TablesUpdate } from '../lib/supabase';
export declare class SupabaseService {
    createUser(userData: TablesInsert<'users'>): Promise<Tables<'users'>>;
    getUserById(id: string): Promise<Tables<'users'> | null>;
    getUserByAuthId(authUserId: string): Promise<Tables<'users'> | null>;
    getUserByEmail(email: string): Promise<Tables<'users'> | null>;
    updateUser(id: string, updates: TablesUpdate<'users'>): Promise<Tables<'users'>>;
    deleteUser(id: string): Promise<void>;
    getAllEvents(): Promise<Tables<'events'>[]>;
    getEventById(id: string): Promise<any>;
    getEventBySlug(slug: string): Promise<any>;
    createEvent(eventData: TablesInsert<'events'>): Promise<Tables<'events'>>;
    createEventDistance(distanceData: any): Promise<any>;
    createMerchandise(merchandiseData: any): Promise<any>;
    createMerchandiseVariation(variationData: any): Promise<any>;
    updateEvent(id: string, updates: TablesUpdate<'events'>): Promise<Tables<'events'>>;
    deleteEvent(id: string): Promise<void>;
    createTicket(ticketData: any): Promise<any>;
    getTicketsByEvent(eventId: string): Promise<any[]>;
    getTicketsByParticipant(participantId: string): Promise<any[]>;
    updateTicket(id: string, updates: any): Promise<any>;
    deleteTicket(id: string): Promise<void>;
    createPayment(paymentData: any): Promise<any>;
    getPaymentsByEvent(eventId: string): Promise<any[]>;
    getPaymentsByParticipant(participantId: string): Promise<any[]>;
    updatePayment(id: string, updates: any): Promise<any>;
    deletePayment(id: string): Promise<void>;
    getEventStats(eventId: string): Promise<any>;
    getDashboardStats(organiserId?: string): Promise<any>;
}
//# sourceMappingURL=supabaseService.d.ts.map