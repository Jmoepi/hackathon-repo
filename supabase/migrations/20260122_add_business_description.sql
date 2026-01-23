-- Add business_description column to profiles table
-- Run this in your Supabase SQL editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.business_description IS 'Description of the business and what they sell';
