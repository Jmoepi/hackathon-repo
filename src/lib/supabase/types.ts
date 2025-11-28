export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          id_number: string | null;
          date_of_birth: string | null;
          business_name: string;
          business_type: string | null;
          business_address: string | null;
          business_city: string | null;
          business_province: string | null;
          business_postal_code: string | null;
          business_phone: string | null;
          vat_number: string | null;
          receipt_header: string | null;
          receipt_footer: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          id_number?: string | null;
          date_of_birth?: string | null;
          business_name: string;
          business_type?: string | null;
          business_address?: string | null;
          business_city?: string | null;
          business_province?: string | null;
          business_postal_code?: string | null;
          business_phone?: string | null;
          vat_number?: string | null;
          receipt_header?: string | null;
          receipt_footer?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          id_number?: string | null;
          date_of_birth?: string | null;
          business_name?: string;
          business_type?: string | null;
          business_address?: string | null;
          business_city?: string | null;
          business_province?: string | null;
          business_postal_code?: string | null;
          business_phone?: string | null;
          vat_number?: string | null;
          receipt_header?: string | null;
          receipt_footer?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          name: string;
          category: string;
          price: number;
          cost: number;
          stock: number;
          units_sold: number;
          low_stock_threshold: number;
          sku: string | null;
          barcode: string | null;
          image_url: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          name: string;
          category: string;
          price: number;
          cost?: number;
          stock?: number;
          units_sold?: number;
          low_stock_threshold?: number;
          sku?: string | null;
          barcode?: string | null;
          image_url?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          name?: string;
          category?: string;
          price?: number;
          cost?: number;
          stock?: number;
          units_sold?: number;
          low_stock_threshold?: number;
          sku?: string | null;
          barcode?: string | null;
          image_url?: string | null;
          is_active?: boolean;
        };
      };
      transactions: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          customer_id: string | null;
          customer_name: string | null;
          amount: number;
          payment_method: 'cash' | 'card' | 'mobile' | 'qr';
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          reference: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          customer_id?: string | null;
          customer_name?: string | null;
          amount: number;
          payment_method?: 'cash' | 'card' | 'mobile' | 'qr';
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          reference?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          customer_id?: string | null;
          customer_name?: string | null;
          amount?: number;
          payment_method?: 'cash' | 'card' | 'mobile' | 'qr';
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          reference?: string | null;
          notes?: string | null;
        };
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
      };
      customers: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          name: string;
          phone: string;
          email: string | null;
          address: string | null;
          notes: string | null;
          total_spent: number;
          visit_count: number;
          last_visit: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          name: string;
          phone: string;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          total_spent?: number;
          visit_count?: number;
          last_visit?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          total_spent?: number;
          visit_count?: number;
          last_visit?: string | null;
          is_active?: boolean;
        };
      };
      settings: {
        Row: {
          id: string;
          user_id: string;
          theme: 'light' | 'dark' | 'system';
          currency: string;
          language: string;
          notifications_push: boolean;
          notifications_email: boolean;
          notifications_sms: boolean;
          notifications_low_stock: boolean;
          notifications_sales: boolean;
          receipt_show_logo: boolean;
          receipt_show_address: boolean;
          receipt_show_phone: boolean;
          receipt_show_vat: boolean;
          payment_enable_qr: boolean;
          payment_enable_card: boolean;
          payment_default_method: 'cash' | 'card' | 'mobile';
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: 'light' | 'dark' | 'system';
          currency?: string;
          language?: string;
          notifications_push?: boolean;
          notifications_email?: boolean;
          notifications_sms?: boolean;
          notifications_low_stock?: boolean;
          notifications_sales?: boolean;
          receipt_show_logo?: boolean;
          receipt_show_address?: boolean;
          receipt_show_phone?: boolean;
          receipt_show_vat?: boolean;
          payment_enable_qr?: boolean;
          payment_enable_card?: boolean;
          payment_default_method?: 'cash' | 'card' | 'mobile';
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: 'light' | 'dark' | 'system';
          currency?: string;
          language?: string;
          notifications_push?: boolean;
          notifications_email?: boolean;
          notifications_sms?: boolean;
          notifications_low_stock?: boolean;
          notifications_sales?: boolean;
          receipt_show_logo?: boolean;
          receipt_show_address?: boolean;
          receipt_show_phone?: boolean;
          receipt_show_vat?: boolean;
          payment_enable_qr?: boolean;
          payment_enable_card?: boolean;
          payment_default_method?: 'cash' | 'card' | 'mobile';
        };
      };
      notifications: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          type: 'sale' | 'inventory' | 'payment' | 'customer' | 'system';
          title: string;
          message: string;
          read: boolean;
          action_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          type?: 'sale' | 'inventory' | 'payment' | 'customer' | 'system';
          title: string;
          message: string;
          read?: boolean;
          action_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          type?: 'sale' | 'inventory' | 'payment' | 'customer' | 'system';
          title?: string;
          message?: string;
          read?: boolean;
          action_url?: string | null;
        };
      };
      sms_campaigns: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          title: string;
          message: string;
          recipients: string[];
          status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
          scheduled_at: string | null;
          sent_count: number;
          failed_count: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          title: string;
          message: string;
          recipients?: string[];
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
          scheduled_at?: string | null;
          sent_count?: number;
          failed_count?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          title?: string;
          message?: string;
          recipients?: string[];
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
          scheduled_at?: string | null;
          sent_count?: number;
          failed_count?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      payment_method: 'cash' | 'card' | 'mobile' | 'qr';
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
      theme_type: 'light' | 'dark' | 'system';
    };
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export type TransactionItem = Database['public']['Tables']['transaction_items']['Row'];
export type TransactionItemInsert = Database['public']['Tables']['transaction_items']['Insert'];
export type TransactionItemUpdate = Database['public']['Tables']['transaction_items']['Update'];

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export type Settings = Database['public']['Tables']['settings']['Row'];
export type SettingsInsert = Database['public']['Tables']['settings']['Insert'];
export type SettingsUpdate = Database['public']['Tables']['settings']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type SmsCampaign = Database['public']['Tables']['sms_campaigns']['Row'];
export type SmsCampaignInsert = Database['public']['Tables']['sms_campaigns']['Insert'];
export type SmsCampaignUpdate = Database['public']['Tables']['sms_campaigns']['Update'];
