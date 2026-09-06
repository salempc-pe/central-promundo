import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: No connection string found in .env.local');
  process.exit(1);
}

console.log('Connecting to PostgreSQL Supabase for Auth & Access Control migration...');
const sql = postgres(connectionString, {
  prepare: false,
  ssl: 'require'
});

async function main() {
  try {
    console.log('1. Checking or creating estado_acceso enum...');
    await sql.unsafe(`
      DO $$ BEGIN
        CREATE TYPE "public"."estado_acceso" AS ENUM('pendiente', 'aprobado', 'denegado');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('2. Altering usuarios table to add access control columns...');
    await sql.unsafe(`
      ALTER TABLE "public"."usuarios" 
        ADD COLUMN IF NOT EXISTS "auth_id" text,
        ADD COLUMN IF NOT EXISTS "avatar_url" text,
        ADD COLUMN IF NOT EXISTS "estado_acceso" "public"."estado_acceso" NOT NULL DEFAULT 'pendiente',
        ADD COLUMN IF NOT EXISTS "fecha_solicitud" timestamp with time zone NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS "fecha_resolucion" timestamp with time zone,
        ADD COLUMN IF NOT EXISTS "resuelto_por" varchar(255),
        ADD COLUMN IF NOT EXISTS "notas" text;
    `);

    console.log('3. Creating indexes for fast lookups...');
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS "usuarios_estado_acceso_idx" ON "public"."usuarios" ("estado_acceso");
      CREATE INDEX IF NOT EXISTS "usuarios_auth_id_idx" ON "public"."usuarios" ("auth_id");
    `);

    console.log('4. Seeding/Upserting superadmin paulosalem8@gmail.com...');
    await sql.unsafe(`
      INSERT INTO "public"."usuarios" (
        "nombre",
        "email",
        "rol",
        "estado_acceso",
        "activo",
        "resuelto_por",
        "notas"
      ) VALUES (
        'Paulo Salem',
        'paulosalem8@gmail.com',
        'admin',
        'aprobado',
        true,
        'SYSTEM_INIT',
        'Superadministrador Principal del Sistema Promundo'
      )
      ON CONFLICT ("email") DO UPDATE SET
        "rol" = 'admin',
        "estado_acceso" = 'aprobado',
        "activo" = true;
    `);

    console.log('SUCCESS: Auth & Access Control migration applied successfully!');

    const currentUsers = await sql`
      SELECT id, nombre, email, rol, estado_acceso, activo
      FROM "public"."usuarios"
      ORDER BY created_at DESC;
    `;
    console.log('Current users in DB:', currentUsers);

  } catch (err) {
    console.error('Error applying auth migration:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
