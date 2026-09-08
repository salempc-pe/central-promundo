import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL, {
  prepare: false,
  ssl: 'require'
});

async function run() {
  console.log("=== INICIANDO SANEAMIENTO DE BROKERS Y REASIGNACIÓN FIDUCIARIA ===");

  // 1. Obtener usuario Paulo Salem y Otelo
  const realUsers = await sql`
    SELECT id, nombre, email FROM usuarios 
    WHERE auth_id IS NOT NULL AND estado_acceso = 'aprobado' AND activo = true;
  `;
  console.log("Usuarios reales con Google OAuth:", realUsers);

  const paulo = realUsers.find(u => u.email === 'paulosalem8@gmail.com');
  const otelo = realUsers.find(u => u.email === 'otelo.pet@gmail.com');

  if (!paulo) {
    throw new Error("No se encontró al superadministrador Paulo Salem!");
  }

  // 2. Identificar brokers ficticios (sin auth_id o con @promundo.pe)
  const fakeBrokers = await sql`
    SELECT id, nombre, email FROM usuarios 
    WHERE auth_id IS NULL OR email LIKE '%@promundo.pe';
  `;
  console.log("Brokers ficticios detectados para depurar:", fakeBrokers);

  if (fakeBrokers.length === 0) {
    console.log("No hay brokers ficticios en la base de datos.");
    await sql.end();
    return;
  }

  const fakeIds = fakeBrokers.map(b => b.id);

  // 3. Reasignar negociaciones
  const reneg = await sql`
    UPDATE negociaciones 
    SET broker_id = ${paulo.id}, updated_at = NOW()
    WHERE broker_id IN ${sql(fakeIds)}
    RETURNING id;
  `;
  console.log(`✓ Negociaciones reasignadas a Paulo Salem: ${reneg.length}`);

  // 4. Reasignar bitácoras
  const rebit = await sql`
    UPDATE bitacora_negociacion
    SET usuario_id = ${paulo.id}
    WHERE usuario_id IN ${sql(fakeIds)}
    RETURNING id;
  `;
  console.log(`✓ Eventos de bitácora reasignados a Paulo Salem: ${rebit.length}`);

  // 5. Eliminar brokers ficticios de la tabla usuarios
  const delUsers = await sql`
    DELETE FROM usuarios
    WHERE id IN ${sql(fakeIds)}
    RETURNING id, nombre, email;
  `;
  console.log(`✓ Brokers ficticios eliminados de usuarios:`, delUsers);

  // 6. Verificación final de usuarios
  const finalUsers = await sql`SELECT id, auth_id, nombre, email, rol, estado_acceso, activo FROM usuarios;`;
  console.log("=== USUARIOS FINALES EN BD ===");
  console.table(finalUsers);

  await sql.end();
}

run().catch(console.error);
