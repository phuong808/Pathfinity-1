import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

// Get DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is missing!');
  console.error('Available env vars:', Object.keys(process.env).sort());
  console.error('DATABASE_URL value:', JSON.stringify(databaseUrl));
}

// Create connection - provide a better error message
const sql = neon(databaseUrl || '');
export const db = drizzle(sql, { schema });