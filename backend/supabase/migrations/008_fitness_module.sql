-- 008_fitness_module.sql

CREATE TABLE fitness_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_type VARCHAR(100) NOT NULL, -- e.g., 'Personal Training', 'Yoga Class', 'Gym Access'
    trainer_name VARCHAR(100),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration INT NOT NULL DEFAULT 60, -- duration in minutes
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fitness_book_user_id ON fitness_bookings(user_id);
CREATE INDEX idx_fitness_book_date ON fitness_bookings(booking_date);

-- RLS
ALTER TABLE fitness_bookings ENABLE ROW LEVEL SECURITY;

-- Optional: Create a trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fitness_bookings_modtime
    BEFORE UPDATE ON fitness_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
