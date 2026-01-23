-- ============================================================================
-- Subscriptions and Payments Tables
-- 
-- This migration adds:
-- 1. Stitch payment columns to existing subscriptions table
-- 2. payments table - Track all payments (subscriptions + customer purchases)
-- ============================================================================

-- ============================================================================
-- Add Stitch payment columns to existing subscriptions table
-- ============================================================================

DO $$ 
BEGIN
    -- Add stitch columns if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stitch_payment_id') THEN
        ALTER TABLE subscriptions ADD COLUMN stitch_payment_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stitch_payment_status') THEN
        ALTER TABLE subscriptions ADD COLUMN stitch_payment_status TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'cancelled_at') THEN
        ALTER TABLE subscriptions ADD COLUMN cancelled_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'cancel_reason') THEN
        ALTER TABLE subscriptions ADD COLUMN cancel_reason TEXT;
    END IF;
END $$;

-- Index for stitch payment lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stitch_payment_id ON subscriptions(stitch_payment_id);

-- ============================================================================
-- Payments Table
-- Tracks all payments (customer purchases, subscriptions, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Payment type
    type TEXT NOT NULL CHECK (type IN ('subscription', 'customer_payment', 'refund')),
    
    -- For customer payments
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_reference TEXT, -- e.g., "ORD-001"
    
    -- Amount (in cents)
    amount_cents INTEGER NOT NULL,
    platform_fee_cents INTEGER NOT NULL DEFAULT 0,
    merchant_amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'ZAR',
    
    -- Stitch payment details
    stitch_payment_id TEXT,
    stitch_payment_url TEXT,
    stitch_payment_status TEXT,
    external_reference TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    status_message TEXT,
    
    -- Disbursement (payout to merchant)
    disbursement_id TEXT,
    disbursement_status TEXT,
    disbursed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stitch_payment_id ON payments(stitch_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_reference ON payments(external_reference);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- ============================================================================
-- Updated_at Triggers
-- ============================================================================

-- Trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for payments
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their payments"
    ON payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert payments"
    ON payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their payments"
    ON payments FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- Initialize starter subscriptions for existing users
-- ============================================================================

-- Insert starter subscriptions for all existing profiles that don't have one
INSERT INTO subscriptions (user_id, plan_type, status, monthly_price)
SELECT id, 'starter', 'active', 0
FROM profiles
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions WHERE subscriptions.user_id = profiles.id
)
ON CONFLICT DO NOTHING;
