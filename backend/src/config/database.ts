import { Pool } from 'pg';
import { env } from './env';

// Used for complex transactions (SERIALIZABLE isolation)
// and overlap queries that Supabase JS client cannot easily handle
export const pgPool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const getClient = async () => {
  const client = await pgPool.connect();
  return client;
};
