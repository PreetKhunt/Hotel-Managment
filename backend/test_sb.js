const { env } = require('./src/config/env');
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
sb.from('rooms').select('*').then(res => console.log('Rooms:', res.data.length));