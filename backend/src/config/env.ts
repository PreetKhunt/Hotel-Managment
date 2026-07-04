import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environmental variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  GOOGLE_CALLBACK_URL: z.string().url().default('http://localhost:5000/api/v1/auth/google/callback'),
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
});

// Prepare environment variables with smart defaults for production
const processEnv = { ...process.env };
if (processEnv.NODE_ENV === 'production' && !processEnv.GOOGLE_CALLBACK_URL) {
  processEnv.GOOGLE_CALLBACK_URL = 'https://hotel-managments.netlify.app/api/v1/auth/google/callback';
}

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
