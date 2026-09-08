import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL, { prepare: false, ssl: 'require' });
async function checkUsers() {
  const u = await sql`SELECT id, auth_id, nombre, email, rol, estado_acceso, activo FROM usuarios;`;
  console.log('USUARIOS:', u);
  const t = await sql`SELECT id, codigo_interno, distrito, direccion FROM terrenos;`;
  console.log('TOTAL TERRENOS:', t.length);
  const c = await sql`SELECT id, razon_social FROM clientes;`;
  console.log('CLIENTES:', c);
  const n = await sql`SELECT id, terreno_id, cliente_id, broker_id, etapa, monto_oferta FROM negociaciones;`;
  console.log('NEGOCIACIONES SQL RAW:', n.length);
  await sql.end();

  // Test Drizzle query
  const { drizzle } = await import('drizzle-orm/postgres-js');
  const schema = await import('../src/db/schema.ts');
  const client2 = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL, { prepare: false, ssl: 'require' });
  const db = drizzle(client2, { schema });
  try {
    const rows = await db.query.negociaciones.findMany({
      with: {
        terreno: {
          with: {
            propietario: true,
            documentos: true,
          },
        },
        cliente: true,
        broker: true,
        bitacoras: {
          with: {
            usuario: true,
          },
          orderBy: [schema.bitacoraNegociacion.createdAt],
        },
        comision: true,
      },
      orderBy: [schema.negociaciones.updatedAt],
    });
    console.log('DRIZZLE ROWS FOUND:', rows.length);
  } catch (err) {
    console.error('DRIZZLE QUERY ERROR:', err);
  } finally {
    await client2.end();
  }
}
checkUsers().catch(console.error);
