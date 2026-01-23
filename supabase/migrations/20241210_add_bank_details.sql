-- Add bank account fields to profiles table for Paystack split payments
-- Run this migration in your Supabase SQL editor

-- Add columns for Paystack subaccount (for receiving split payments)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paystack_subaccount_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account_name TEXT;

-- Add index for faster lookups by subaccount code
CREATE INDEX IF NOT EXISTS idx_profiles_paystack_subaccount_code 
ON profiles(paystack_subaccount_code) 
WHERE paystack_subaccount_code IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.paystack_subaccount_code IS 'Paystack subaccount code for receiving split payments';
COMMENT ON COLUMN profiles.bank_code IS 'Bank code for the merchant''s bank';
COMMENT ON COLUMN profiles.bank_account_number IS 'Bank account number for receiving payments';
COMMENT ON COLUMN profiles.bank_account_name IS 'Verified name on the bank account';
