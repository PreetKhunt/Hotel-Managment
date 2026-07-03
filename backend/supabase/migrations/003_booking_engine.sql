-- 003_booking_engine.sql

-- 1. Multi-Tenant Readiness (hotel_id)
-- Adding hotel_id (nullable for now, can be made NOT NULL later if multi-tenant)
ALTER TABLE users ADD COLUMN IF NOT EXISTS hotel_id UUID;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS hotel_id UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hotel_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS hotel_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hotel_id UUID;

-- 2. Room Lifecycle Updates
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_status_check;
ALTER TABLE rooms ADD CONSTRAINT rooms_status_check 
    CHECK (status IN ('available', 'reserved', 'occupied', 'cleaning', 'maintenance', 'blocked'));

-- 3. Booking Lifecycle Updates & Pricing/GST Support
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Update existing rows to conform to the new constraint
UPDATE bookings SET status = 'pending_payment' WHERE status = 'pending';

ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
    CHECK (status IN ('draft', 'pending_payment', 'payment_failed', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled', 'expired', 'refunded', 'no_show'));

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(50) UNIQUE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_price DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_charge DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS grand_total DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests TEXT;

-- 4. Payment Lifecycle Updates
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

-- Update existing rows to conform to the new constraint
UPDATE payments SET status = 'paid' WHERE status = 'success';

ALTER TABLE payments ADD CONSTRAINT payments_status_check 
    CHECK (status IN ('created', 'pending', 'authorized', 'captured', 'paid', 'failed', 'refunded'));

ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_response JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;

-- 5. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_url TEXT,
    subtotal DECIMAL(10, 2) NOT NULL,
    cgst_amount DECIMAL(10, 2) DEFAULT 0,
    sgst_amount DECIMAL(10, 2) DEFAULT 0,
    igst_amount DECIMAL(10, 2) DEFAULT 0,
    grand_total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'voided')),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 6. Enhanced Audit Logs
CREATE TABLE IF NOT EXISTS booking_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    previous_state VARCHAR(50),
    new_state VARCHAR(50),
    reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Indexes for Performance (EXISTS logic and quick lookups)
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_dates ON bookings(room_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_audit_logs_booking_id ON booking_audit_logs(booking_id);
