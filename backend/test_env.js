const express = require('express');
const { env } = require('./src/config/env');
const { supabase } = require('./src/config/supabase');
console.log('SUPABASE URL:', env.SUPABASE_URL);
console.log('Is Service Role?', env.SUPABASE_SERVICE_ROLE_KEY.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'));
supabase.from('rooms').select('*').then(res => console.log('Rooms:', res.data.length)).catch(console.error);