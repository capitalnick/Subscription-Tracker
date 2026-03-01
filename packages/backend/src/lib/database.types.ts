export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          supabase_id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supabase_id: string;
          email: string;
          created_at?: string;
          updated_at: string;
        };
        Update: {
          id?: string;
          supabase_id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      merchants: {
        Row: {
          id: string;
          canonical_name: string;
          slug: string;
          category: string;
          common_descriptors: string[];
          website_url: string | null;
          logo_letter: string;
          logo_color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          canonical_name: string;
          slug: string;
          category: string;
          common_descriptors?: string[];
          website_url?: string | null;
          logo_letter: string;
          logo_color: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          canonical_name?: string;
          slug?: string;
          category?: string;
          common_descriptors?: string[];
          website_url?: string | null;
          logo_letter?: string;
          logo_color?: string;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          merchant_id: string | null;
          custom_name: string | null;
          amount: number;
          currency: string;
          frequency: string;
          category: string;
          next_billing_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          merchant_id?: string | null;
          custom_name?: string | null;
          amount: number;
          currency?: string;
          frequency: string;
          category: string;
          next_billing_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          merchant_id?: string | null;
          custom_name?: string | null;
          amount?: number;
          currency?: string;
          frequency?: string;
          category?: string;
          next_billing_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      detected_items: {
        Row: {
          id: string;
          user_id: string;
          ingestion_method: string;
          status: string;
          duplicate: boolean;
          ai_merchant_name: string | null;
          ai_amount: number | null;
          ai_currency: string | null;
          ai_frequency: string | null;
          ai_detected_date: string | null;
          ai_next_billing: string | null;
          ai_confidence: string | null;
          ai_notes: string | null;
          ai_fields_purged_at: string | null;
          merchant_id: string | null;
          source_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ingestion_method: string;
          status?: string;
          duplicate?: boolean;
          ai_merchant_name?: string | null;
          ai_amount?: number | null;
          ai_currency?: string | null;
          ai_frequency?: string | null;
          ai_detected_date?: string | null;
          ai_next_billing?: string | null;
          ai_confidence?: string | null;
          ai_notes?: string | null;
          ai_fields_purged_at?: string | null;
          merchant_id?: string | null;
          source_hash?: string | null;
          created_at?: string;
          updated_at: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ingestion_method?: string;
          status?: string;
          duplicate?: boolean;
          ai_merchant_name?: string | null;
          ai_amount?: number | null;
          ai_currency?: string | null;
          ai_frequency?: string | null;
          ai_detected_date?: string | null;
          ai_next_billing?: string | null;
          ai_confidence?: string | null;
          ai_notes?: string | null;
          ai_fields_purged_at?: string | null;
          merchant_id?: string | null;
          source_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
