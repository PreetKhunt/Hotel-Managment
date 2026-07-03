const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.vuqsfbhhgjpztoqmpmle:t0ox2lINBprp7f2L@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});
client.connect()
  .then(() => client.query('SELECT count(*) FROM rooms'))
  .then(res => console.log('Rooms count:', res.rows[0].count))
  .catch(e => console.error(e))
  .finally(() => client.end());