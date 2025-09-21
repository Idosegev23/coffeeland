import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          role: 'customer' | 'admin' | 'editor';
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          role?: 'customer' | 'admin' | 'editor';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          phone?: string | null;
          role?: 'customer' | 'admin' | 'editor';
          created_at?: string;
        };
      };
      hero_slides: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          image_url: string | null;
          video_url: string | null;
          cta_text: string | null;
          cta_url: string | null;
          sort_order: number;
          active_from: string | null;
          active_to: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          cta_text?: string | null;
          cta_url?: string | null;
          sort_order?: number;
          active_from?: string | null;
          active_to?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subtitle?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          cta_text?: string | null;
          cta_url?: string | null;
          sort_order?: number;
          active_from?: string | null;
          active_to?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      banners: {
        Row: {
          id: string;
          title: string;
          body: string | null;
          cta_text: string | null;
          cta_url: string | null;
          bg_hex: string | null;
          text_hex: string | null;
          layout_mode: 'marquee' | 'bento';
          style: Record<string, any> | null;
          dismissible: boolean;
          priority: number;
          active_from: string | null;
          active_to: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body?: string | null;
          cta_text?: string | null;
          cta_url?: string | null;
          bg_hex?: string | null;
          text_hex?: string | null;
          layout_mode?: 'marquee' | 'bento';
          style?: Record<string, any> | null;
          dismissible?: boolean;
          priority?: number;
          active_from?: string | null;
          active_to?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string | null;
          cta_text?: string | null;
          cta_url?: string | null;
          bg_hex?: string | null;
          text_hex?: string | null;
          layout_mode?: 'marquee' | 'bento';
          style?: Record<string, any> | null;
          dismissible?: boolean;
          priority?: number;
          active_from?: string | null;
          active_to?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description_md: string | null;
          price_cents: number;
          currency: string;
          compare_at_price_cents: number | null;
          stock: number;
          sku: string | null;
          is_active: boolean;
          kind: 'physical' | 'digital' | 'service';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description_md?: string | null;
          price_cents: number;
          currency?: string;
          compare_at_price_cents?: number | null;
          stock?: number;
          sku?: string | null;
          is_active?: boolean;
          kind?: 'physical' | 'digital' | 'service';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description_md?: string | null;
          price_cents?: number;
          currency?: string;
          compare_at_price_cents?: number | null;
          stock?: number;
          sku?: string | null;
          is_active?: boolean;
          kind?: 'physical' | 'digital' | 'service';
          created_at?: string;
          updated_at?: string;
        };
      };
      workshops: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description_md: string | null;
          age_min: number | null;
          age_max: number | null;
          duration_min: number;
          base_price: number;
          cover_image_url: string | null;
          capacity_default: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description_md?: string | null;
          age_min?: number | null;
          age_max?: number | null;
          duration_min: number;
          base_price: number;
          cover_image_url?: string | null;
          capacity_default?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description_md?: string | null;
          age_min?: number | null;
          age_max?: number | null;
          duration_min?: number;
          base_price?: number;
          cover_image_url?: string | null;
          capacity_default?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      workshop_sessions: {
        Row: {
          id: string;
          workshop_id: string;
          start_at: string;
          end_at: string;
          capacity_override: number | null;
          price_override: number | null;
          location: string | null;
          status: 'scheduled' | 'cancelled' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          workshop_id: string;
          start_at: string;
          end_at: string;
          capacity_override?: number | null;
          price_override?: number | null;
          location?: string | null;
          status?: 'scheduled' | 'cancelled' | 'completed';
          created_at?: string;
        };
        Update: {
          id?: string;
          workshop_id?: string;
          start_at?: string;
          end_at?: string;
          capacity_override?: number | null;
          price_override?: number | null;
          location?: string | null;
          status?: 'scheduled' | 'cancelled' | 'completed';
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          total_amount: number;
          currency: string;
          status: 'pending' | 'paid' | 'cancelled' | 'refunded';
          payment_provider: string;
          external_payment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          total_amount: number;
          currency?: string;
          status?: 'pending' | 'paid' | 'cancelled' | 'refunded';
          payment_provider?: string;
          external_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          total_amount?: number;
          currency?: string;
          status?: 'pending' | 'paid' | 'cancelled' | 'refunded';
          payment_provider?: string;
          external_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
