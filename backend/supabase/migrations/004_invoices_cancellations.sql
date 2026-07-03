-- Migration 004: Invoices & Cancellations (Refund Policies)

-- 1. Add new columns to invoices
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS storage_path VARCHAR(255),
ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP WITH TIME ZONE;

-- 2. Refund Policies Table
CREATE TABLE IF NOT EXISTS refund_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID, -- NULL means global/default
    name VARCHAR(100) NOT NULL,
    cancellation_hours_before_checkin INT NOT NULL, -- e.g., 48 (hours before check-in)
    refund_percentage DECIMAL(5, 2) NOT NULL, -- e.g., 100.00, 50.00, 0.00
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to update timestamp
CREATE OR REPLACE FUNCTION update_refund_policies_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_refund_policies_modtime ON refund_policies;
CREATE TRIGGER update_refund_policies_modtime
    BEFORE UPDATE ON refund_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_refund_policies_modtime();

-- Insert default global refund policies (hotel_id = NULL)
-- Rule 1: Cancel > 48 hours before check-in = 100% refund
-- Rule 2: Cancel > 24 hours before check-in = 50% refund
-- Rule 3: Cancel <= 24 hours before check-in = 0% refund
INSERT INTO refund_policies (hotel_id, name, cancellation_hours_before_checkin, refund_percentage)
VALUES 
(NULL, 'Full Refund', 48, 100.00),
(NULL, 'Half Refund', 24, 50.00),
(NULL, 'No Refund', 0, 0.00);

-- 3. Add refund amount column to bookings (optional, tracking)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2) DEFAULT 0.00;

-- 4. RLS for Refund Policies
ALTER TABLE refund_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Refund policies are viewable by everyone" ON refund_policies
    FOR SELECT USING (true);
-- Admin can manage policies (to be restricted later)
CREATE POLICY "Refund policies are manageable by admins" ON refund_policies
    FOR ALL USING (true);
