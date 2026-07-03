import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// We use the Service Role Key for backend operations to bypass RLS
// Do NOT expose this key to the frontend.
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
