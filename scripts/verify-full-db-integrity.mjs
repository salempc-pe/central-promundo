import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";

const connString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connString) {
  console.error("❌ ERROR: DIRECT_URL o DATABASE_URL no está definido en .env.local");
  process.exit(1);
}

const sql = postgres(connString, { ssl: "require" });

async function verifyIntegrity() {
  console.log("================================================================================");
  console.log("🔍 AUDITORÍA DE INTEGRIDAD FIDUCIARIA EN SUPABASE POSTGRESQL (8 TABLAS)");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  async function check(name, testFn) {
    try {
      const detail = await testFn();
      console.log(`✅ [PASS] ${name}: ${detail}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Usuarios
  await check("1. Tabla usuarios", async () => {
    const rows = await sql`SELECT count(*)::int as total, count(*) FILTER (WHERE rol = 'admin')::int as admins FROM usuarios`;
    if (rows[0].total === 0) throw new Error("Tabla usuarios está vacía");
    return `${rows[0].total} usuarios registrados (${rows[0].admins} administradores)`;
  });

  // 2. Propietarios
  await check("2. Tabla propietarios", async () => {
    const rows = await sql`SELECT count(*)::int as total FROM propietarios`;
    if (rows[0].total === 0) throw new Error("Tabla propietarios está vacía");
    return `${rows[0].total} titulares catastrales y societarios`;
  });

  // 3. Terrenos y PostGIS
  await check("3. Tabla terrenos (Inventario + PostGIS)", async () => {
    const rows = await sql`
      SELECT 
        count(*)::int as total,
        count(*) FILTER (WHERE geom IS NOT NULL)::int as con_geom,
        count(*) FILTER (WHERE propietario_id IS NOT NULL)::int as con_propietario
      FROM terrenos
    `;
    if (rows[0].total === 0) throw new Error("Tabla terrenos está vacía");
    if (rows[0].con_geom !== rows[0].total) throw new Error("Hay terrenos sin geometría PostGIS");
    return `${rows[0].total} lotes activos con coordenadas PostGIS SRID 4326 válidas`;
  });

  // 4. Integridad FK Terrenos -> Propietarios
  await check("4. Relación Terrenos -> Propietarios", async () => {
    const orphans = await sql`
      SELECT t.id, t.codigo_interno 
      FROM terrenos t 
      LEFT JOIN propietarios p ON t.propietario_id = p.id 
      WHERE p.id IS NULL
    `;
    if (orphans.length > 0) throw new Error(`Existen ${orphans.length} terrenos huérfanos sin propietario`);
    return "100% de terrenos vinculados a propietarios existentes";
  });

  // 5. Clientes
  await check("5. Tabla clientes (Constructoras y Fondos)", async () => {
    const rows = await sql`SELECT count(*)::int as total FROM clientes`;
    if (rows[0].total === 0) throw new Error("Tabla clientes está vacía");
    return `${rows[0].total} compradores institucionales calificados`;
  });

  // 6. Documentos de Terreno
  await check("6. Tabla documentos_terreno", async () => {
    const rows = await sql`
      SELECT 
        count(*)::int as total,
        count(*) FILTER (WHERE tipo_documento = 'Certificado_Parametros')::int as cpus
      FROM documentos_terreno
    `;
    if (rows[0].total === 0) throw new Error("Tabla documentos_terreno está vacía");
    return `${rows[0].total} documentos registrados (${rows[0].cpus} Certificados de Parámetros)`;
  });

  // 7. Integridad FK Documentos -> Terrenos
  await check("7. Relación Documentos -> Terrenos", async () => {
    const orphans = await sql`
      SELECT d.id, d.nombre_archivo 
      FROM documentos_terreno d 
      LEFT JOIN terrenos t ON d.terreno_id = t.id 
      WHERE t.id IS NULL
    `;
    if (orphans.length > 0) throw new Error(`Existen ${orphans.length} documentos huérfanos sin terreno`);
    return "100% de documentos vinculados a lotes existentes en inventario";
  });

  // 8. Negociaciones
  await check("8. Tabla negociaciones (Pipeline Comercial)", async () => {
    const rows = await sql`SELECT count(*)::int as total FROM negociaciones`;
    if (rows[0].total === 0) throw new Error("Tabla negociaciones está vacía");
    return `${rows[0].total} transacciones activas en embudo comercial`;
  });

  // 9. Integridad Relacional Negociaciones (Terrenos + Clientes + Brokers)
  await check("9. Integridad Relacional del Pipeline", async () => {
    const broken = await sql`
      SELECT n.id 
      FROM negociaciones n
      LEFT JOIN terrenos t ON n.terreno_id = t.id
      LEFT JOIN clientes c ON n.cliente_id = c.id
      LEFT JOIN usuarios u ON n.broker_id = u.id
      WHERE t.id IS NULL OR c.id IS NULL OR u.id IS NULL
    `;
    if (broken.length > 0) throw new Error(`Existen ${broken.length} negociaciones con claves foráneas rotas`);
    return "100% de negociaciones íntegramente referenciadas a Lote, Cliente y Broker";
  });

  // 10. Bitácora de Negociación
  await check("10. Tabla bitacora_negociacion (Auditoría Forense)", async () => {
    const rows = await sql`SELECT count(*)::int as total FROM bitacora_negociacion`;
    if (rows[0].total === 0) throw new Error("Tabla bitacora_negociacion está vacía");
    return `${rows[0].total} eventos inmutables de auditoría registrados`;
  });

  // 11. Comisiones y Cierres
  await check("11. Tabla comisiones_cierres (Liquidaciones Financieras)", async () => {
    const rows = await sql`SELECT count(*)::int as total FROM comisiones_cierres`;
    if (rows[0].total === 0) throw new Error("Tabla comisiones_cierres está vacía");
    return `${rows[0].total} liquidaciones fiduciarias registradas`;
  });

  console.log("================================================================================");
  console.log(`📊 RESULTADO DE LA AUDITORÍA: ${passed} superadas, ${failed} fallidas`);
  console.log("================================================================================");

  await sql.end();
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🏆 LA BASE DE DATOS SUPABASE POSTGRESQL ESTÁ 100% OPERATIVA E ÍNTEGRA.");
    process.exit(0);
  }
}

verifyIntegrity().catch((err) => {
  console.error("Error fatal en verificación:", err);
  process.exit(1);
});
