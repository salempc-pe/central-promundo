import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL, { prepare: false, ssl: 'require' });
async function checkUsers() {
  const u = await sql`SELECT id, nombre, email, rol, estado_acceso, activo FROM usuarios;`;
  console.log('USUARIOS:', u);
  const t = await sql`SELECT id, codigo_interno, distrito, direccion FROM terrenos;`;
  console.log('TOTAL TERRENOS:', t.length);
  const c = await sql`SELECT id, razon_social FROM clientes;`;
  console.log('CLIENTES:', c);
  await sql.end();
}
checkUsers().catch(console.error);
