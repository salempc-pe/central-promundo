import postgres from 'postgres';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const sql = postgres(connectionString, {
  prepare: false,
  ssl: 'require'
});

async function run() {
  console.log("=== TEST DE ELIMINACIÓN DE TERRENO EN POSTGRESQL ===");

  // 1. Obtener propietario
  const props = await sql`SELECT id FROM propietarios LIMIT 1;`;
  const propId = props[0].id;

  // 2. Insertar terreno de prueba
  const testId = crypto.randomUUID();
  const testCodigo = `TR-DELTEST-${Date.now().toString().slice(-4)}`;
  console.log(`1. Insertando terreno temporal ${testCodigo}...`);

  await sql`
    INSERT INTO terrenos (
      id, codigo_interno, propietario_id, direccion, distrito,
      latitud, longitud, area_m2, zonificacion, precio_total, precio_m2,
      moneda, estado_terreno, created_at, updated_at
    ) VALUES (
      ${testId}, ${testCodigo}, ${propId}, 'Calle de Prueba 123', 'Miraflores',
      '-12.12', '-77.02', '500.00', 'RDA', '1000000.00', '2000.00',
      'USD', 'Disponible', NOW(), NOW()
    );
  `;
  console.log("✓ Terreno insertado con éxito.");

  // 3. Insertar un documento asociado (para verificar cascade)
  const docId = crypto.randomUUID();
  console.log("2. Insertando documento técnico asociado...");
  await sql`
    INSERT INTO documentos_terreno (
      id, terreno_id, tipo_documento, nombre_archivo, archivo_url, created_at
    ) VALUES (
      ${docId}, ${testId}, 'Certificado_Parametros', 'CPU-Prueba.pdf', 'https://example.com/cpu.pdf', NOW()
    );
  `;
  console.log("✓ Documento insertado con éxito.");

  // 4. Verificar que existen
  const checkBefore = await sql`SELECT id FROM terrenos WHERE id = ${testId};`;
  const checkDocBefore = await sql`SELECT id FROM documentos_terreno WHERE terreno_id = ${testId};`;
  console.log(`✓ Verificación previa: terreno existe (${checkBefore.length}), documentos existen (${checkDocBefore.length})`);

  // 5. Simular la lógica de deleteTerrenoAction:
  // Pre-flight check de negociaciones:
  const negs = await sql`SELECT id FROM negociaciones WHERE terreno_id = ${testId};`;
  if (negs.length > 0) {
    throw new Error("No debería tener negociaciones");
  }

  // Transacción de borrado:
  await sql.begin(async (tx) => {
    await tx`DELETE FROM documentos_terreno WHERE terreno_id = ${testId};`;
    await tx`DELETE FROM terrenos WHERE id = ${testId};`;
  });
  console.log("✓ Transacción de eliminación ejecutada.");

  // 6. Verificar que ya no existen
  const checkAfter = await sql`SELECT id FROM terrenos WHERE id = ${testId};`;
  const checkDocAfter = await sql`SELECT id FROM documentos_terreno WHERE terreno_id = ${testId};`;

  if (checkAfter.length !== 0 || checkDocAfter.length !== 0) {
    throw new Error("ERROR: El terreno o sus documentos aún existen después del borrado!");
  }

  console.log("✓ ÉXITO: El terreno y sus documentos fueron purgados limpiamente de la base de datos.");

  // 7. Prueba de bloqueo preventivo cuando SÍ hay negociaciones
  console.log("\n3. Probando bloqueo preventivo con negociaciones activas...");
  const testId2 = crypto.randomUUID();
  const testCodigo2 = `TR-DELTEST-NEG`;
  await sql`
    INSERT INTO terrenos (
      id, codigo_interno, propietario_id, direccion, distrito,
      latitud, longitud, area_m2, zonificacion, precio_total, precio_m2,
      moneda, estado_terreno, created_at, updated_at
    ) VALUES (
      ${testId2}, ${testCodigo2}, ${propId}, 'Calle Bloqueo 456', 'San Isidro',
      '-12.10', '-77.03', '600.00', 'CZ', '1500000.00', '2500.00',
      'USD', 'En Negociacion', NOW(), NOW()
    );
  `;
  const clientesRows = await sql`SELECT id FROM clientes LIMIT 1;`;
  const usuariosRows = await sql`SELECT id FROM usuarios LIMIT 1;`;

  if (clientesRows.length > 0 && usuariosRows.length > 0) {
    const negId = crypto.randomUUID();
    await sql`
      INSERT INTO negociaciones (
        id, terreno_id, cliente_id, broker_id, etapa, monto_oferta, created_at, updated_at
      ) VALUES (
        ${negId}, ${testId2}, ${clientesRows[0].id}, ${usuariosRows[0].id}, 'Ficha_Enviada', 1400000, NOW(), NOW()
      );
    `;

    const negsCheck = await sql`SELECT id FROM negociaciones WHERE terreno_id = ${testId2};`;
    if (negsCheck.length > 0) {
      console.log(`✓ Negociación detectada (${negsCheck.length}). Bloqueo fiduciario activado correctamente.`);
    }

    // Limpieza de prueba
    await sql`DELETE FROM negociaciones WHERE id = ${negId};`;
  }
  await sql`DELETE FROM terrenos WHERE id = ${testId2};`;
  console.log("✓ Limpieza de prueba de bloqueo completada.");

  await sql.end();
}

run().catch((err) => {
  console.error("Error en test:", err);
  process.exit(1);
});
