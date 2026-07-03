const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.vuqsfbhhgjpztoqmpmle:t0ox2lINBprp7f2L@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});

async function getConstraints() {
  await client.connect();
  const queries = ['bookings', 'rooms', 'payments', 'users', 'reviews'];
  for (const table of queries) {
    const res = await client.query(`SELECT conname FROM pg_constraint WHERE conrelid = '${table}'::regclass;`);
    console.log(`Constraints for ${table}:`, res.rows);
  }
  await client.end();
}

getConstraints().catch(console.error);
