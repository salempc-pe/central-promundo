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
  console.log("=== VERIFICACIÓN DE PERSISTENCIA REAL EN SUPABASE POSTGRESQL ===");

  // 1. Obtener un propietario existente para vincular
  const props = await sql`SELECT id, razon_social_o_nombre FROM propietarios LIMIT 1;`;
  if (props.length === 0) {
    throw new Error("No hay propietarios en la BD");
  }
  const propId = props[0].id;
  console.log(`✓ Propietario encontrado: ${props[0].razon_social_o_nombre} (${propId})`);

  // 2. Insertar nuevo terreno de prueba
  const testId = crypto.randomUUID();
  const testCodigo = `TR-TEST-${Date.now().toString().slice(-4)}`;
  const testDireccion = "Av. José Larco 883, Miraflores";
  const testDistrito = "Miraflores";
  const testLng = -77.028661;
  const testLat = -12.121054;
  const testPrecioTotal = 2850000;
  const testArea = 950;
  const testPrecioM2 = testPrecioTotal / testArea;

  console.log(`\n1. Insertando terreno de prueba [${testCodigo}]...`);
  await sql`
    INSERT INTO terrenos (
      id, codigo_interno, propietario_id, direccion, distrito,
      geom, latitud, longitud, area_m2, zonificacion,
      precio_total, precio_m2, moneda, estado_terreno, created_at, updated_at
    ) VALUES (
      ${testId}, ${testCodigo}, ${propId}, ${testDireccion}, ${testDistrito},
      ST_SetSRID(ST_MakePoint(${testLng}, ${testLat}), 4326),
      ${testLat.toString()}, ${testLng.toString()}, ${testArea.toString()}, 'RDA',
      ${testPrecioTotal.toString()}, ${testPrecioM2.toFixed(2)}, 'USD', 'Disponible',
      NOW(), NOW()
    );
  `;
  console.log(`✓ Terreno insertado con éxito en PostgreSQL con geometría PostGIS.`);

  // 3. Consultar terreno insertado
  console.log(`\n2. Consultando terreno desde la base de datos...`);
  const [created] = await sql`
    SELECT id, codigo_interno, direccion, distrito, estado_terreno, precio_total,
           ST_AsText(geom) as wkt_geom
    FROM terrenos
    WHERE id = ${testId};
  `;
  console.log("Datos recuperados de PostgreSQL:", {
    id: created.id,
    codigo: created.codigo_interno,
    direccion: created.direccion,
    distrito: created.distrito,
    estado: created.estado_terreno,
    precio: created.precio_total,
    geometria: created.wkt_geom
  });

  if (created.direccion !== testDireccion) {
    throw new Error("La dirección física no coincide!");
  }

  // 4. Modificar el terreno (simular cambio en la web que el usuario reportaba que rebotaba)
  console.log(`\n3. Actualizando estado a 'En Negociacion' y precio a 3,100,000 USD...`);
  const nuevoPrecio = 3100000;
  const nuevoEstado = "En Negociacion";
  await sql`
    UPDATE terrenos
    SET estado_terreno = ${nuevoEstado},
        precio_total = ${nuevoPrecio.toString()},
        updated_at = NOW()
    WHERE id = ${testId};
  `;
  console.log(`✓ Terreno actualizado en la BD.`);

  // 5. Re-consultar para verificar que NO rebote
  console.log(`\n4. Verificando que la actualización persiste en PostgreSQL...`);
  const [updated] = await sql`
    SELECT id, codigo_interno, estado_terreno, precio_total, updated_at
    FROM terrenos
    WHERE id = ${testId};
  `;

  console.log("Datos actualizados verificados:", {
    codigo: updated.codigo_interno,
    estado: updated.estado_terreno,
    precio: updated.precio_total,
    updatedAt: updated.updated_at
  });

  if (updated.estado_terreno !== nuevoEstado || Number(updated.precio_total) !== nuevoPrecio) {
    throw new Error("ERROR: La actualización rebotó o no persistió!");
  }
  console.log("✓ ÉXITO: Los cambios persisten correctamente en la base de datos sin rebotar.");

  // 6. Limpieza del registro de prueba
  console.log(`\n5. Limpiando registro de prueba...`);
  await sql`DELETE FROM terrenos WHERE id = ${testId};`;
  console.log(`✓ Registro de prueba eliminado cleanly.`);

  await sql.end();
  console.log("\n=== TODAS LAS PRUEBAS DE PERSISTENCIA PASARON EXITOSAMENTE ===");
}

run().catch(err => {
  console.error("Error en prueba de BD:", err);
  process.exit(1);
});
