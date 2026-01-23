-- Migration: Update bank details columns for Stitch Money payments
-- Date: 2026-01-23
-- Description: Replace Paystack columns with Stitch Money columns for SA payments

-- Add new Stitch-compatible bank columns if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'current';

-- Add comments for clarity
COMMENT ON COLUMN profiles.bank_code IS 'Stitch Money bank ID (e.g., fnb, absa, capitec)';
COMMENT ON COLUMN profiles.bank_name IS 'Full bank name for display purposes';
COMMENT ON COLUMN profiles.account_number IS 'Bank account number for receiving payouts';
COMMENT ON COLUMN profiles.account_name IS 'Account holder name as registered with bank';
COMMENT ON COLUMN profiles.account_type IS 'Account type: current or savings';

-- Create index on bank_code for merchants with bank details
CREATE INDEX IF NOT EXISTS idx_profiles_bank_code 
ON profiles(bank_code) 
WHERE bank_code IS NOT NULL;

-- Drop old Paystack-specific columns if they exist and are no longer needed
-- (Uncomment these lines after confirming migration works)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS paystack_subaccount_code;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS bank_account_number;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS bank_account_name;
-- DROP INDEX IF EXISTS idx_profiles_paystack_subaccount_code;
