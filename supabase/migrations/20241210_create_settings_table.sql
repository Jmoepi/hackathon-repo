-- Settings table migration
-- Run this in your Supabase SQL editor

-- Drop existing settings table if you want to recreate it
-- WARNING: This will delete all existing settings data
-- DROP TABLE IF EXISTS settings;

-- Create or update settings table with all required columns
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Theme and display
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  currency TEXT DEFAULT 'ZAR',
  language TEXT DEFAULT 'en',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  
  -- Notifications
  notifications_push BOOLEAN DEFAULT true,
  notifications_email BOOLEAN DEFAULT true,
  notifications_sms BOOLEAN DEFAULT false,
  notifications_low_stock BOOLEAN DEFAULT true,
  notifications_sales BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  
  -- Receipt settings
  receipt_show_logo BOOLEAN DEFAULT true,
  receipt_show_address BOOLEAN DEFAULT true,
  receipt_show_phone BOOLEAN DEFAULT true,
  receipt_show_vat BOOLEAN DEFAULT true,
  auto_generate_receipt BOOLEAN DEFAULT true,
  
  -- Payment settings
  payment_enable_qr BOOLEAN DEFAULT true,
  payment_enable_card BOOLEAN DEFAULT false,
  payment_default_method TEXT DEFAULT 'cash' CHECK (payment_default_method IN ('cash', 'card', 'mobile')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- Theme and display
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'theme') THEN
    ALTER TABLE settings ADD COLUMN theme TEXT DEFAULT 'system';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'currency') THEN
    ALTER TABLE settings ADD COLUMN currency TEXT DEFAULT 'ZAR';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'language') THEN
    ALTER TABLE settings ADD COLUMN language TEXT DEFAULT 'en';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'date_format') THEN
    ALTER TABLE settings ADD COLUMN date_format TEXT DEFAULT 'DD/MM/YYYY';
  END IF;
  
  -- Notifications
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'notifications_push') THEN
    ALTER TABLE settings ADD COLUMN notifications_push BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'notifications_email') THEN
    ALTER TABLE settings ADD COLUMN notifications_email BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'notifications_sms') THEN
    ALTER TABLE settings ADD COLUMN notifications_sms BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'notifications_low_stock') THEN
    ALTER TABLE settings ADD COLUMN notifications_low_stock BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'notifications_sales') THEN
    ALTER TABLE settings ADD COLUMN notifications_sales BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'sound_enabled') THEN
    ALTER TABLE settings ADD COLUMN sound_enabled BOOLEAN DEFAULT true;
  END IF;
  
  -- Receipt settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'receipt_show_logo') THEN
    ALTER TABLE settings ADD COLUMN receipt_show_logo BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'receipt_show_address') THEN
    ALTER TABLE settings ADD COLUMN receipt_show_address BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'receipt_show_phone') THEN
    ALTER TABLE settings ADD COLUMN receipt_show_phone BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'receipt_show_vat') THEN
    ALTER TABLE settings ADD COLUMN receipt_show_vat BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'auto_generate_receipt') THEN
    ALTER TABLE settings ADD COLUMN auto_generate_receipt BOOLEAN DEFAULT true;
  END IF;
  
  -- Payment settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'payment_enable_qr') THEN
    ALTER TABLE settings ADD COLUMN payment_enable_qr BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'payment_enable_card') THEN
    ALTER TABLE settings ADD COLUMN payment_enable_card BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'payment_default_method') THEN
    ALTER TABLE settings ADD COLUMN payment_default_method TEXT DEFAULT 'cash';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON settings;
DROP POLICY IF EXISTS "Users can update own settings" ON settings;

-- Create RLS policies
CREATE POLICY "Users can view own settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_settings_updated_at ON settings;
CREATE TRIGGER trigger_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();
