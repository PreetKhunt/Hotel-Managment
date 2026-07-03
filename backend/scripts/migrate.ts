import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    const migrationFile = path.join(__dirname, '../supabase/migrations/007_hotel_domain.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    await client.query(sql);
    console.log('Migration 007 applied successfully');
  } catch (error) {
    console.error('Migration failed', error);
  } finally {
    client.release();
    pool.end();
  }
}

run();
