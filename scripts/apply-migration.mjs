import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

console.log('Connecting to PostgreSQL Supabase...');
const sql = postgres(connectionString, {
  prepare: false,
  ssl: 'require'
});

async function main() {
  try {
    const migrationFile = path.resolve('src/db/migrations/0000_init_postgis_schema.sql');
    const sqlContent = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Applying 0000_init_postgis_schema.sql to Supabase...');
    await sql.unsafe(sqlContent);
    console.log('SUCCESS: All tables, PostGIS extensions, triggers and indexes created in Supabase!');
    
    // Verify tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('Tables in public schema:');
    tables.forEach(t => console.log(' - ' + t.table_name));
    
  } catch (err) {
    console.error('Error applying migration:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
