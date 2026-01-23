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
          business_description: string | null;
          business_address: string | null;
          business_city: string | null;
          business_province: string | null;
          business_postal_code: string | null;
          business_phone: string | null;
          vat_number: string | null;
          receipt_header: string | null;
          receipt_footer: string | null;
          // Bank details for Stitch Money payments
          bank_code: string | null;
          bank_name: string | null;
          account_number: string | null;
          account_name: string | null;
          account_type: string | null;
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
          business_description?: string | null;
          business_address?: string | null;
          business_city?: string | null;
          business_province?: string | null;
          business_postal_code?: string | null;
          business_phone?: string | null;
          vat_number?: string | null;
          receipt_header?: string | null;
          receipt_footer?: string | null;
          // Bank details for Stitch Money payments
          bank_code?: string | null;
          bank_name?: string | null;
          account_number?: string | null;
          account_name?: string | null;
          account_type?: string | null;
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
          business_description?: string | null;
          business_address?: string | null;
          business_city?: string | null;
          business_province?: string | null;
          business_postal_code?: string | null;
          business_phone?: string | null;
          vat_number?: string | null;
          receipt_header?: string | null;
          receipt_footer?: string | null;
          // Bank details for Stitch Money payments
          bank_code?: string | null;
          bank_name?: string | null;
          account_number?: string | null;
          account_name?: string | null;
          account_type?: string | null;
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
      // ============================================================================
      // SUBSCRIPTIONS
      // ============================================================================
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: 'starter' | 'growth' | 'pro' | 'custom' | 'trial';
          bundle_id: string | null;
          monthly_price: number;
          status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
          trial_ends_at: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          payment_provider: string | null;
          payment_reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type: 'starter' | 'growth' | 'pro' | 'custom' | 'trial';
          bundle_id?: string | null;
          monthly_price: number;
          status?: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
          trial_ends_at?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          payment_provider?: string | null;
          payment_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: 'starter' | 'growth' | 'pro' | 'custom' | 'trial';
          bundle_id?: string | null;
          monthly_price?: number;
          status?: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
          trial_ends_at?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          payment_provider?: string | null;
          payment_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_services: {
        Row: {
          id: string;
          subscription_id: string;
          service_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          service_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          service_id?: string;
          created_at?: string;
        };
      };
      // ============================================================================
      // BOOKINGS
      // ============================================================================
      booking_services: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          category: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          category?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          category?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff_members: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          role: string | null;
          avatar_url: string | null;
          is_active: boolean;
          working_hours: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          working_hours?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          working_hours?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string | null;
          staff_id: string | null;
          service_id: string | null;
          customer_name: string;
          customer_phone: string | null;
          customer_email: string | null;
          service_name: string;
          staff_name: string | null;
          scheduled_at: string;
          duration_minutes: number;
          price: number;
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          notes: string | null;
          reminder_sent: boolean;
          reminder_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id?: string | null;
          staff_id?: string | null;
          service_id?: string | null;
          customer_name: string;
          customer_phone?: string | null;
          customer_email?: string | null;
          service_name: string;
          staff_name?: string | null;
          scheduled_at: string;
          duration_minutes?: number;
          price?: number;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          notes?: string | null;
          reminder_sent?: boolean;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_id?: string | null;
          staff_id?: string | null;
          service_id?: string | null;
          customer_name?: string;
          customer_phone?: string | null;
          customer_email?: string | null;
          service_name?: string;
          staff_name?: string | null;
          scheduled_at?: string;
          duration_minutes?: number;
          price?: number;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          notes?: string | null;
          reminder_sent?: boolean;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // ============================================================================
      // ORDERS
      // ============================================================================
      menu_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          price: number;
          category: string | null;
          image_url: string | null;
          is_available: boolean;
          preparation_time_minutes: number;
          allergens: string[] | null;
          is_vegetarian: boolean;
          is_vegan: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          price: number;
          category?: string | null;
          image_url?: string | null;
          is_available?: boolean;
          preparation_time_minutes?: number;
          allergens?: string[] | null;
          is_vegetarian?: boolean;
          is_vegan?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          category?: string | null;
          image_url?: string | null;
          is_available?: boolean;
          preparation_time_minutes?: number;
          allergens?: string[] | null;
          is_vegetarian?: boolean;
          is_vegan?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string | null;
          order_number: string;
          customer_name: string | null;
          customer_phone: string | null;
          order_type: 'dine_in' | 'takeaway' | 'delivery';
          table_number: string | null;
          subtotal: number;
          tax: number;
          delivery_fee: number;
          discount: number;
          total: number;
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
          payment_status: 'unpaid' | 'paid' | 'refunded';
          payment_method: string | null;
          estimated_ready_at: string | null;
          ready_at: string | null;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id?: string | null;
          order_number?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          order_type?: 'dine_in' | 'takeaway' | 'delivery';
          table_number?: string | null;
          subtotal?: number;
          tax?: number;
          delivery_fee?: number;
          discount?: number;
          total?: number;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
          payment_status?: 'unpaid' | 'paid' | 'refunded';
          payment_method?: string | null;
          estimated_ready_at?: string | null;
          ready_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_id?: string | null;
          order_number?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          order_type?: 'dine_in' | 'takeaway' | 'delivery';
          table_number?: string | null;
          subtotal?: number;
          tax?: number;
          delivery_fee?: number;
          discount?: number;
          total?: number;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
          payment_status?: 'unpaid' | 'paid' | 'refunded';
          payment_method?: string | null;
          estimated_ready_at?: string | null;
          ready_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string | null;
          name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes: string | null;
          modifiers: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id?: string | null;
          name: string;
          quantity?: number;
          unit_price: number;
          total_price: number;
          notes?: string | null;
          modifiers?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          menu_item_id?: string | null;
          name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          notes?: string | null;
          modifiers?: Json;
          created_at?: string;
        };
      };
      // ============================================================================
      // DELIVERIES
      // ============================================================================
      drivers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          email: string | null;
          vehicle_type: string;
          vehicle_registration: string | null;
          is_active: boolean;
          is_available: boolean;
          current_location: Json | null;
          rating: number;
          completed_deliveries: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          email?: string | null;
          vehicle_type?: string;
          vehicle_registration?: string | null;
          is_active?: boolean;
          is_available?: boolean;
          current_location?: Json | null;
          rating?: number;
          completed_deliveries?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          vehicle_type?: string;
          vehicle_registration?: string | null;
          is_active?: boolean;
          is_available?: boolean;
          current_location?: Json | null;
          rating?: number;
          completed_deliveries?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      deliveries: {
        Row: {
          id: string;
          user_id: string;
          order_id: string | null;
          driver_id: string | null;
          tracking_number: string;
          pickup_address: string;
          pickup_lat: number | null;
          pickup_lng: number | null;
          delivery_address: string;
          delivery_lat: number | null;
          delivery_lng: number | null;
          recipient_name: string;
          recipient_phone: string;
          status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
          scheduled_pickup_at: string | null;
          picked_up_at: string | null;
          estimated_delivery_at: string | null;
          delivered_at: string | null;
          delivery_fee: number;
          distance_km: number | null;
          delivery_photo_url: string | null;
          signature_url: string | null;
          delivery_notes: string | null;
          customer_rating: number | null;
          customer_feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id?: string | null;
          driver_id?: string | null;
          tracking_number?: string;
          pickup_address: string;
          pickup_lat?: number | null;
          pickup_lng?: number | null;
          delivery_address: string;
          delivery_lat?: number | null;
          delivery_lng?: number | null;
          recipient_name: string;
          recipient_phone: string;
          status?: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
          scheduled_pickup_at?: string | null;
          picked_up_at?: string | null;
          estimated_delivery_at?: string | null;
          delivered_at?: string | null;
          delivery_fee?: number;
          distance_km?: number | null;
          delivery_photo_url?: string | null;
          signature_url?: string | null;
          delivery_notes?: string | null;
          customer_rating?: number | null;
          customer_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_id?: string | null;
          driver_id?: string | null;
          tracking_number?: string;
          pickup_address?: string;
          pickup_lat?: number | null;
          pickup_lng?: number | null;
          delivery_address?: string;
          delivery_lat?: number | null;
          delivery_lng?: number | null;
          recipient_name?: string;
          recipient_phone?: string;
          status?: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
          scheduled_pickup_at?: string | null;
          picked_up_at?: string | null;
          estimated_delivery_at?: string | null;
          delivered_at?: string | null;
          delivery_fee?: number;
          distance_km?: number | null;
          delivery_photo_url?: string | null;
          signature_url?: string | null;
          delivery_notes?: string | null;
          customer_rating?: number | null;
          customer_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      delivery_status_history: {
        Row: {
          id: string;
          delivery_id: string;
          status: string;
          location: Json | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          delivery_id: string;
          status: string;
          location?: Json | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          delivery_id?: string;
          status?: string;
          location?: Json | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      // ============================================================================
      // INVOICES
      // ============================================================================
      invoices: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string | null;
          invoice_number: string;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string | null;
          customer_address: string | null;
          customer_vat_number: string | null;
          issue_date: string;
          due_date: string;
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          discount: number;
          total: number;
          amount_paid: number;
          balance_due: number;
          status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled';
          notes: string | null;
          terms: string | null;
          footer: string | null;
          payment_method: string | null;
          paid_at: string | null;
          sent_at: string | null;
          viewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id?: string | null;
          invoice_number?: string;
          customer_name: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          customer_address?: string | null;
          customer_vat_number?: string | null;
          issue_date?: string;
          due_date: string;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          discount?: number;
          total?: number;
          amount_paid?: number;
          balance_due?: number;
          status?: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled';
          notes?: string | null;
          terms?: string | null;
          footer?: string | null;
          payment_method?: string | null;
          paid_at?: string | null;
          sent_at?: string | null;
          viewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_id?: string | null;
          invoice_number?: string;
          customer_name?: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          customer_address?: string | null;
          customer_vat_number?: string | null;
          issue_date?: string;
          due_date?: string;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          discount?: number;
          total?: number;
          amount_paid?: number;
          balance_due?: number;
          status?: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled';
          notes?: string | null;
          terms?: string | null;
          footer?: string | null;
          payment_method?: string | null;
          paid_at?: string | null;
          sent_at?: string | null;
          viewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price: number;
          total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          created_at?: string;
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
      subscription_status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
      booking_status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
      order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
      delivery_status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
      invoice_status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled';
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

// Subscriptions
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

export type SubscriptionService = Database['public']['Tables']['subscription_services']['Row'];
export type SubscriptionServiceInsert = Database['public']['Tables']['subscription_services']['Insert'];
export type SubscriptionServiceUpdate = Database['public']['Tables']['subscription_services']['Update'];

// Bookings
export type BookingService = Database['public']['Tables']['booking_services']['Row'];
export type BookingServiceInsert = Database['public']['Tables']['booking_services']['Insert'];
export type BookingServiceUpdate = Database['public']['Tables']['booking_services']['Update'];

export type StaffMember = Database['public']['Tables']['staff_members']['Row'];
export type StaffMemberInsert = Database['public']['Tables']['staff_members']['Insert'];
export type StaffMemberUpdate = Database['public']['Tables']['staff_members']['Update'];

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

// Orders
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert'];
export type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update'];

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update'];

// Deliveries
export type Driver = Database['public']['Tables']['drivers']['Row'];
export type DriverInsert = Database['public']['Tables']['drivers']['Insert'];
export type DriverUpdate = Database['public']['Tables']['drivers']['Update'];

export type Delivery = Database['public']['Tables']['deliveries']['Row'];
export type DeliveryInsert = Database['public']['Tables']['deliveries']['Insert'];
export type DeliveryUpdate = Database['public']['Tables']['deliveries']['Update'];

export type DeliveryStatusHistory = Database['public']['Tables']['delivery_status_history']['Row'];
export type DeliveryStatusHistoryInsert = Database['public']['Tables']['delivery_status_history']['Insert'];
export type DeliveryStatusHistoryUpdate = Database['public']['Tables']['delivery_status_history']['Update'];

// Invoices
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];

export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
export type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert'];
export type InvoiceItemUpdate = Database['public']['Tables']['invoice_items']['Update'];
