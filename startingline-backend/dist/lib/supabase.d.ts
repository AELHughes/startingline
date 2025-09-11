export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export declare const supabaseAdmin: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    auth_user_id: string;
                    email: string;
                    first_name: string;
                    last_name: string;
                    role: 'organiser' | 'admin' | 'participant';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    auth_user_id: string;
                    email: string;
                    first_name: string;
                    last_name: string;
                    role: 'organiser' | 'admin' | 'participant';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    auth_user_id?: string;
                    email?: string;
                    first_name?: string;
                    last_name?: string;
                    role?: 'organiser' | 'admin' | 'participant';
                    created_at?: string;
                    updated_at?: string;
                };
            };
            events: {
                Row: {
                    id: string;
                    name: string;
                    slug?: string;
                    category: string;
                    organiser_id: string;
                    organiser_name?: string;
                    start_date: string;
                    start_time: string;
                    venue_name?: string;
                    address: string;
                    city: string;
                    province: string;
                    country?: string;
                    latitude?: number;
                    longitude?: number;
                    license_required: boolean;
                    temp_license_fee?: number;
                    license_details?: string;
                    primary_image_url?: string;
                    gallery_images?: string[];
                    description?: string;
                    status: 'draft' | 'pending_approval' | 'published' | 'cancelled';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug?: string;
                    category: string;
                    organiser_id: string;
                    organiser_name?: string;
                    start_date: string;
                    start_time: string;
                    venue_name?: string;
                    address: string;
                    city: string;
                    province: string;
                    country?: string;
                    latitude?: number;
                    longitude?: number;
                    license_required: boolean;
                    temp_license_fee?: number;
                    license_details?: string;
                    primary_image_url?: string;
                    gallery_images?: string[];
                    description?: string;
                    status?: 'draft' | 'pending_approval' | 'published' | 'cancelled';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    category?: string;
                    organiser_id?: string;
                    organiser_name?: string;
                    start_date?: string;
                    start_time?: string;
                    venue_name?: string;
                    address?: string;
                    city?: string;
                    province?: string;
                    country?: string;
                    latitude?: number;
                    longitude?: number;
                    license_required?: boolean;
                    temp_license_fee?: number;
                    license_details?: string;
                    primary_image_url?: string;
                    gallery_images?: string[];
                    description?: string;
                    status?: 'draft' | 'pending_approval' | 'published' | 'cancelled';
                    created_at?: string;
                    updated_at?: string;
                };
            };
            event_distances: {
                Row: {
                    id: string;
                    event_id: string;
                    name: string;
                    distance_km: number;
                    price: number;
                    min_age?: number;
                    entry_limit?: number;
                    start_time?: string;
                    free_for_seniors: boolean;
                    free_for_disability: boolean;
                    senior_age_threshold?: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    name: string;
                    distance_km: number;
                    price: number;
                    min_age?: number;
                    entry_limit?: number;
                    start_time?: string;
                    free_for_seniors?: boolean;
                    free_for_disability?: boolean;
                    senior_age_threshold?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    name?: string;
                    distance_km?: number;
                    price?: number;
                    min_age?: number;
                    entry_limit?: number;
                    start_time?: string;
                    free_for_seniors?: boolean;
                    free_for_disability?: boolean;
                    senior_age_threshold?: number;
                    created_at?: string;
                };
            };
            event_merchandise: {
                Row: {
                    id: string;
                    event_id: string;
                    name: string;
                    description?: string;
                    price: number;
                    image_url?: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    name: string;
                    description?: string;
                    price: number;
                    image_url?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    name?: string;
                    description?: string;
                    price?: number;
                    image_url?: string;
                    created_at?: string;
                };
            };
            merchandise_variations: {
                Row: {
                    id: string;
                    merchandise_id: string;
                    variation_name: string;
                    variation_options: any;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    merchandise_id: string;
                    variation_name: string;
                    variation_options: any;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    merchandise_id?: string;
                    variation_name?: string;
                    variation_options?: any;
                    created_at?: string;
                };
            };
        };
    };
}
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
//# sourceMappingURL=supabase.d.ts.map