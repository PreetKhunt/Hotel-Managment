-- Hospitality Hub Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'guest' CHECK (role IN ('guest', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Rooms Table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INT NOT NULL,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    description TEXT,
    long_description TEXT,
    size INT DEFAULT 300,
    bed_type VARCHAR(50) DEFAULT 'Queen Bed',
    floor INT DEFAULT 1,
    amenities JSONB DEFAULT '["Free WiFi", "Air Conditioning"]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Services Table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_out_after_check_in CHECK (check_out > check_in)
);

-- 5. Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    razorpay_signature VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES for Performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX idx_reviews_room_id ON reviews(room_id);

-- ROW LEVEL SECURITY (RLS)
-- We will handle most business logic via the backend Service Role Key, 
-- so we can enable RLS to deny direct public access from the frontend.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow unrestricted access for the Service Role Key (Express Backend)
-- By default, service_role bypasses RLS, so no policies needed for the backend.
-- We do NOT want anon/public access since the Next.js frontend calls the Express API.


-- 7. Restaurant Reservations
CREATE TABLE restaurant_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INT NOT NULL DEFAULT 2,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Spa Bookings
CREATE TABLE spa_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    treatment VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rest_res_user_id ON restaurant_reservations(user_id);
CREATE INDEX idx_spa_book_user_id ON spa_bookings(user_id);

ALTER TABLE restaurant_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE spa_bookings ENABLE ROW LEVEL SECURITY;