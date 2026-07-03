const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.vuqsfbhhgjpztoqmpmle:t0ox2lINBprp7f2L@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

const sql = `
CREATE TABLE IF NOT EXISTS restaurant_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INT NOT NULL DEFAULT 2,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spa_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    treatment VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rest_res_user_id ON restaurant_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_spa_book_user_id ON spa_bookings(user_id);

ALTER TABLE restaurant_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE spa_bookings ENABLE ROW LEVEL SECURITY;
`;

client.connect()
  .then(() => client.query(sql))
  .then(() => console.log('Successfully created new tables'))
  .catch(console.error)
  .finally(() => client.end());