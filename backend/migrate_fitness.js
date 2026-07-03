const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateFitness() {
  console.log('Running fitness module migration...');
  
  // We will execute a direct POST to rest/v1/rpc if we had a rpc function for executing SQL.
  // But since we are using pg pool, let's use the pg pool from the app.
  
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  const sql = `
    CREATE TABLE IF NOT EXISTS fitness_bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        booking_type VARCHAR(100) NOT NULL,
        trainer_name VARCHAR(100),
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        duration INT NOT NULL DEFAULT 60,
        special_requests TEXT,
        status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_fitness_book_user_id ON fitness_bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_fitness_book_date ON fitness_bookings(booking_date);

    ALTER TABLE fitness_bookings ENABLE ROW LEVEL SECURITY;

    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_fitness_bookings_modtime') THEN
        CREATE TRIGGER update_fitness_bookings_modtime
        BEFORE UPDATE ON fitness_bookings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END
    $$;
  `;

  try {
    await pool.query(sql);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

migrateFitness();
