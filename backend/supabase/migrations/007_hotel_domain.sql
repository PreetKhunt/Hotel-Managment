-- Migration: 007_hotel_domain.sql
-- Description: Adds Hotel domain and Configuration Table to prepare for multi-tenancy.

-- 1. Create Hotels Table
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    gst_number VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(10) DEFAULT 'USD',
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    logo_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Hotel Settings Table
CREATE TABLE IF NOT EXISTS public.hotel_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    hotel_name VARCHAR(255) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    gst_percentage DECIMAL(5, 2) DEFAULT 0.00,
    check_in_time TIME DEFAULT '14:00:00',
    check_out_time TIME DEFAULT '11:00:00',
    maximum_booking_days INTEGER DEFAULT 30,
    free_cancellation_hours INTEGER DEFAULT 24,
    invoice_prefix VARCHAR(10) DEFAULT 'INV-',
    booking_prefix VARCHAR(10) DEFAULT 'BKG-',
    support_email VARCHAR(255),
    support_phone VARCHAR(50),
    logo_url TEXT,
    feature_flags JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hotel_id) -- One settings row per hotel
);

-- 3. Add Updated_At Triggers
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_hotels ON public.hotels;
CREATE TRIGGER set_timestamp_hotels
BEFORE UPDATE ON public.hotels
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_hotel_settings ON public.hotel_settings;
CREATE TRIGGER set_timestamp_hotel_settings
BEFORE UPDATE ON public.hotel_settings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 4. Seed Default Hotel
INSERT INTO public.hotels (id, name, status, timezone, currency)
VALUES ('00000000-0000-0000-0000-000000000001', 'Hospitality Hub Default Hotel', 'active', 'UTC', 'USD')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hotel_settings (hotel_id, hotel_name, currency, timezone, gst_percentage)
VALUES ('00000000-0000-0000-0000-000000000001', 'Hospitality Hub Default Hotel', 'USD', 'UTC', 18.00)
ON CONFLICT (hotel_id) DO NOTHING;
