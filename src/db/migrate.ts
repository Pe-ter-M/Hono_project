// src/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema.js';
import { db } from './index.js';

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL!;
  
  // Disable prefetch for migrations
  const sql = postgres(connectionString, { max: 1 });
//   const db = drizzle(sql, { schema });

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log('Migrations completed!');

  await sql.end();
};

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});