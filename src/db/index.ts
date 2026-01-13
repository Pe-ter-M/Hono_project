import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test';

// Disable prefetch as it's not supported for "Transaction" pool mode
export const client = postgres(connectionString, { 
  max: 1, // Important: set max connections to 1 for Drizzle migrations
});

export const db = drizzle(client, { schema });