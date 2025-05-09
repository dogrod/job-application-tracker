import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          website: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          website?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          website?: string | null;
          created_at?: string;
        };
      };
      job_positions: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          description: string | null;
          location: string | null;
          post_url: string | null;
          posted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          description?: string | null;
          location?: string | null;
          post_url?: string | null;
          posted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          description?: string | null;
          location?: string | null;
          post_url?: string | null;
          posted_at?: string | null;
          created_at?: string;
        };
      };
      // Remaining tables will follow the same pattern
    };
  };
}; 