import postgres from 'postgres';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: No database connection string found in .env.local");
  process.exit(1);
}

const sql = postgres(connectionString, {
  prepare: false,
  ssl: 'require'
});

// Deterministic UUID helper
function deterministicUUID(namespace, name) {
  const hash = crypto.createHash('sha1').update(`${namespace}:${name}`).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '5' + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20),
    hash.substring(20, 32),
  ].join('-');
}

const NS_DOC = '6ba7b813-9dad-11d1-80b4-00c04fd430c8';
const NS_NEG = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';
const NS_BIT = '6ba7b815-9dad-11d1-80b4-00c04fd430c8';
const NS_COM = '6ba7b816-9dad-11d1-80b4-00c04fd430c8';

const SAMPLE_PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

async function main() {
  console.log("=== INICIANDO SEMILLA INTEGRAL FIDUCIARIA EN SUPABASE POSTGRESQL ===");

  // 1. Asegurar usuarios brokers activos
  console.log("\n1. Verificando usuarios brokers en base de datos...");
  const existingUsers = await sql`SELECT id, email, nombre, rol, estado_acceso FROM usuarios;`;
  console.log(`✓ Usuarios existentes: ${existingUsers.length}`);

  // Obtener únicamente brokers reales registrados con cuenta Google OAuth
  const allBrokers = await sql`SELECT id, email, nombre, rol FROM usuarios WHERE estado_acceso = 'aprobado' AND activo = true AND auth_id IS NOT NULL;`;
  console.log(`✓ Total brokers reales aprobados listos: ${allBrokers.length}`);
  const pauloSalem = allBrokers.find(u => u.email === 'paulosalem8@gmail.com') || allBrokers[0];
  const oteloBroker = allBrokers.find(u => u.email === 'otelo.pet@gmail.com') || pauloSalem;
  const broker1 = oteloBroker;
  const broker2 = pauloSalem;
  const broker3 = oteloBroker;

  // 2. Obtener terrenos y clientes de la BD
  console.log("\n2. Obteniendo terrenos y clientes reales de PostgreSQL...");
  const terrenosRows = await sql`SELECT id, codigo_interno, distrito, direccion, precio_total, zonificacion FROM terrenos;`;
  const clientesRows = await sql`SELECT id, razon_social, tipo_cliente FROM clientes;`;
  console.log(`✓ Terrenos en BD: ${terrenosRows.length}`);
  console.log(`✓ Clientes en BD: ${clientesRows.length}`);

  if (terrenosRows.length === 0 || clientesRows.length === 0) {
    throw new Error("No hay terrenos o clientes en la base de datos.");
  }

  const terrMap = new Map(terrenosRows.map(t => [t.codigo_interno, t]));
  const cliMap = new Map(clientesRows.map(c => [c.razon_social, c]));

  // Helper para buscar terreno o fallback
  const getTerr = (code) => terrMap.get(code) || terrenosRows[Math.floor(Math.random() * terrenosRows.length)];
  const getCli = (name) => cliMap.get(name) || clientesRows[Math.floor(Math.random() * clientesRows.length)];

  // 3. Poblar Documentos de Terreno (documentos_terreno)
  console.log("\n3. Poblando documentos_terreno con metadatos reales de CPU y Partidas...");
  const docsData = [
    // CPU TR-MIRA-084
    {
      code: 'doc-mira-084-cpu',
      codigoInterno: 'TR-MIRA-084',
      tipo: 'Certificado_Parametros',
      nombre: 'CPU_Miraflores_Balboa_TR-MIRA-084.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: '2027-06-15',
      esConfidencial: false
    },
    {
      code: 'doc-mira-084-partida',
      codigoInterno: 'TR-MIRA-084',
      tipo: 'Partida_Registral',
      nombre: 'Partida_SUNARP_11094821_Balboa.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: null,
      esConfidencial: true
    },
    // CPU TR-SISI-019 (Por vencer: alerta fiduciaria en < 30 días)
    {
      code: 'doc-sisi-019-cpu',
      codigoInterno: 'TR-SISI-019',
      tipo: 'Certificado_Parametros',
      nombre: 'CPU_SanIsidro_Palmeras_TR-SISI-019.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: '2026-09-25', // Próximo a vencer
      esConfidencial: false
    },
    {
      code: 'doc-sisi-019-partida',
      codigoInterno: 'TR-SISI-019',
      tipo: 'Partida_Registral',
      nombre: 'Partida_SUNARP_SanIsidro_139044.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: null,
      esConfidencial: true
    },
    // CPU TR-SURC-020
    {
      code: 'doc-surc-020-cpu',
      codigoInterno: 'TR-SURC-020',
      tipo: 'Certificado_Parametros',
      nombre: 'CPU_Surco_Derby_TR-SURC-020.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: '2027-11-20',
      esConfidencial: false
    },
    {
      code: 'doc-surc-020-plano',
      codigoInterno: 'TR-SURC-020',
      tipo: 'Plano_Catastral',
      nombre: 'Plano_Catastral_Derby_Surco.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: null,
      esConfidencial: false
    },
    // CPU TR-BCO-045 (Vencido: alerta de auditoría)
    {
      code: 'doc-bco-045-cpu',
      codigoInterno: 'TR-BCO-045',
      tipo: 'Certificado_Parametros',
      nombre: 'CPU_Barranco_Osma_TR-BCO-045.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: '2026-08-10', // Vencido
      esConfidencial: false
    },
    {
      code: 'doc-bco-045-partida',
      codigoInterno: 'TR-BCO-045',
      tipo: 'Partida_Registral',
      nombre: 'Partida_SUNARP_Barranco_99401.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: null,
      esConfidencial: true
    },
    // CPU TR-SMIG-092
    {
      code: 'doc-smig-092-cpu',
      codigoInterno: 'TR-SMIG-092',
      tipo: 'Certificado_Parametros',
      nombre: 'CPU_SanMiguel_Costanera_TR-SMIG-092.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: '2028-02-14',
      esConfidencial: false
    },
    // CPU TR-JMAR-031
    {
      code: 'doc-jmar-031-cpu',
      codigoInterno: 'TR-JMAR-031',
      tipo: 'Certificado_Parametros',
      nombre: 'CPU_JesusMaria_Cuba_TR-JMAR-031.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: '2027-08-30',
      esConfidencial: false
    },
    // CPU TR-LINCE-015
    {
      code: 'doc-lince-015-cpu',
      codigoInterno: 'TR-LINCE-015',
      tipo: 'Certificado_Parametros',
      nombre: 'CPU_Lince_Arenales_TR-LINCE-015.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: '2027-10-18',
      esConfidencial: false
    },
    // CPU TR-SURQ-022 (Por vencer en 45 días)
    {
      code: 'doc-surq-022-cpu',
      codigoInterno: 'TR-SURQ-022',
      tipo: 'Certificado_Parametros',
      nombre: 'CPU_Surquillo_Angamos_TR-SURQ-022.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: '2026-10-15', // Por vencer
      esConfidencial: false
    },
    // Documentos para otros lotes
    {
      code: 'doc-magd-018-cpu',
      codigoInterno: 'TR-MAGD-018',
      tipo: 'Certificado_Parametros',
      nombre: 'CPU_Magdalena_Brasil_TR-MAGD-018.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: '2028-01-20',
      esConfidencial: false
    },
    {
      code: 'doc-pobl-027-cpu',
      codigoInterno: 'TR-POBL-027',
      tipo: 'Certificado_Parametros',
      nombre: 'CPU_PuebloLibre_Sucre_TR-POBL-027.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: '2027-04-12',
      esConfidencial: false
    },
    {
      code: 'doc-chor-011-cpu',
      codigoInterno: 'TR-CHOR-011',
      tipo: 'Certificado_Parametros',
      nombre: 'CPU_Chorrillos_Defensores_TR-CHOR-011.pdf',
      url: SAMPLE_PDF_URL,
      fechaVencimiento: '2027-09-05',
      esConfidencial: false
    }
  ];

  let docsInserted = 0;
  for (const d of docsData) {
    const t = getTerr(d.codigoInterno);
    if (!t) continue;
    const docId = deterministicUUID(NS_DOC, d.code);
    await sql`
      INSERT INTO documentos_terreno (
        id, terreno_id, tipo_documento, nombre_archivo, archivo_url, fecha_vencimiento, es_confidencial, created_at
      ) VALUES (
        ${docId}, ${t.id}, ${d.tipo}, ${d.nombre}, ${d.url}, ${d.fechaVencimiento}, ${d.esConfidencial}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        terreno_id = EXCLUDED.terreno_id,
        tipo_documento = EXCLUDED.tipo_documento,
        nombre_archivo = EXCLUDED.nombre_archivo,
        fecha_vencimiento = EXCLUDED.fecha_vencimiento,
        es_confidencial = EXCLUDED.es_confidencial;
    `;
    docsInserted++;
  }
  console.log(`✓ ${docsInserted} Documentos insertados/actualizados en PostgreSQL.`);

  // 4. Poblar Negociaciones del Pipeline Comercial (negociaciones)
  console.log("\n4. Poblando negociaciones del Pipeline Comercial...");

  const dealsDef = [
    // 1. Ficha_Enviada
    {
      code: 'deal-001',
      codigoInterno: 'TR-MIRA-084',
      clienteNombre: 'Grupo Lar Inmobiliaria Perú',
      brokerId: pauloSalem.id,
      etapa: 'Ficha_Enviada',
      montoOferta: '3100000.00',
      probabilidadCierre: 10,
    },
    // 2. En_Evaluacion
    {
      code: 'deal-002',
      codigoInterno: 'TR-SURC-020',
      clienteNombre: 'Besco Proyectos Inmobiliarios',
      brokerId: broker1.id,
      etapa: 'En_Evaluacion',
      montoOferta: '5600000.00',
      probabilidadCierre: 25,
    },
    // 3. Visita_Realizada
    {
      code: 'deal-003',
      codigoInterno: 'TR-SISI-019',
      clienteNombre: 'Edifica Real Estate Fund',
      brokerId: broker2.id,
      etapa: 'Visita_Realizada',
      montoOferta: '6800000.00',
      probabilidadCierre: 40,
    },
    // 4. LOI_Oferta
    {
      code: 'deal-004',
      codigoInterno: 'TR-JMAR-031',
      clienteNombre: 'Viva Negocio Inmobiliario (Grupo Graña)',
      brokerId: broker3.id,
      etapa: 'LOI_Oferta',
      montoOferta: '4250000.00',
      probabilidadCierre: 60,
    },
    // 5. Due_Diligence
    {
      code: 'deal-005',
      codigoInterno: 'TR-SMIG-092',
      clienteNombre: 'Grupo Lar Inmobiliaria Perú',
      brokerId: pauloSalem.id,
      etapa: 'Due_Diligence',
      montoOferta: '2900000.00',
      probabilidadCierre: 80,
    },
    // 6. Cierre_Ganado (Vendido con Comisión Liquidada)
    {
      code: 'deal-006',
      codigoInterno: 'TR-LINCE-015',
      clienteNombre: 'Besco Proyectos Inmobiliarios',
      brokerId: broker1.id,
      etapa: 'Cierre_Ganado',
      montoOferta: '2400000.00',
      probabilidadCierre: 100,
    },
    // 7. Cierre_Ganado (Vendido con Comisión Facturada)
    {
      code: 'deal-007',
      codigoInterno: 'TR-SURQ-022',
      clienteNombre: 'Edifica Real Estate Fund',
      brokerId: broker2.id,
      etapa: 'Cierre_Ganado',
      montoOferta: '3500000.00',
      probabilidadCierre: 100,
    },
    // 8. Descartado
    {
      code: 'deal-008',
      codigoInterno: 'TR-BCO-045',
      clienteNombre: 'Viva Negocio Inmobiliario (Grupo Graña)',
      brokerId: pauloSalem.id,
      etapa: 'Descartado',
      montoOferta: '1900000.00',
      probabilidadCierre: 0,
    },
    // 9. LOI_Oferta
    {
      code: 'deal-009',
      codigoInterno: 'TR-MAGD-018',
      clienteNombre: 'Grupo Lar Inmobiliaria Perú',
      brokerId: broker3.id,
      etapa: 'LOI_Oferta',
      montoOferta: '3800000.00',
      probabilidadCierre: 50,
    },
    // 10. En_Evaluacion
    {
      code: 'deal-010',
      codigoInterno: 'TR-POBL-027',
      clienteNombre: 'Besco Proyectos Inmobiliarios',
      brokerId: broker1.id,
      etapa: 'En_Evaluacion',
      montoOferta: '2150000.00',
      probabilidadCierre: 25,
    }
  ];

  let dealsInserted = 0;
  const createdDeals = [];

  for (const d of dealsDef) {
    const t = getTerr(d.codigoInterno);
    const c = getCli(d.clienteNombre);
    if (!t || !c) continue;

    const dealId = deterministicUUID(NS_NEG, d.code);
    await sql`
      INSERT INTO negociaciones (
        id, terreno_id, cliente_id, broker_id, etapa, monto_oferta, probabilidad_cierre, created_at, updated_at
      ) VALUES (
        ${dealId}, ${t.id}, ${c.id}, ${d.brokerId}, ${d.etapa}, ${d.montoOferta}, ${d.probabilidadCierre}, NOW() - INTERVAL '15 days', NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        terreno_id = EXCLUDED.terreno_id,
        cliente_id = EXCLUDED.cliente_id,
        broker_id = EXCLUDED.broker_id,
        etapa = EXCLUDED.etapa,
        monto_oferta = EXCLUDED.monto_oferta,
        probabilidad_cierre = EXCLUDED.probabilidad_cierre,
        updated_at = NOW();
    `;

    // Si la etapa es Cierre_Ganado, actualizar estado del terreno a 'Vendido' o 'En Negociacion' si está en proceso
    if (d.etapa === 'Cierre_Ganado') {
      await sql`UPDATE terrenos SET estado_terreno = 'Vendido' WHERE id = ${t.id};`;
    } else if (d.etapa !== 'Descartado') {
      await sql`UPDATE terrenos SET estado_terreno = 'En Negociacion' WHERE id = ${t.id} AND estado_terreno = 'Disponible';`;
    }

    createdDeals.push({ id: dealId, ...d });
    dealsInserted++;
  }
  console.log(`✓ ${dealsInserted} Negociaciones insertadas/actualizadas en PostgreSQL.`);

  // 5. Poblar Bitácora de Auditoría (bitacora_negociacion)
  console.log("\n5. Poblando bitacora_negociacion fiduciaria para cada deal...");
  let bitacorasInserted = 0;

  for (const deal of createdDeals) {
    const eventos = [
      {
        tipo: 'Nota',
        desc: `Inicio de prospección fiduciaria. Ficha técnica y análisis urbanístico enviados al comité de adquisiciones de ${deal.clienteNombre}.`,
        offsetDays: 14,
      },
      {
        tipo: 'Reunion',
        desc: `Reunión de sustentación con la gerencia de desarrollo. Evaluación de cabida preliminar y altura edificable según ordenanza distrital.`,
        offsetDays: 10,
      },
    ];

    if (['LOI_Oferta', 'Due_Diligence', 'Cierre_Ganado'].includes(deal.etapa)) {
      eventos.push({
        tipo: 'Oferta_Presentada',
        desc: `Presentación formal de Carta de Intención (LOI) con oferta no vinculante por USD $${Number(deal.montoOferta).toLocaleString()} sujeta a Due Diligence físico-legal.`,
        offsetDays: 7,
      });
    }

    if (['Due_Diligence', 'Cierre_Ganado'].includes(deal.etapa)) {
      eventos.push({
        tipo: 'Cambio_Estado',
        desc: `Aprobación de comité de inversiones y pase a Due Diligence. Revisión de antecedentes registrales SUNARP y certificado de parámetros.`,
        offsetDays: 4,
      });
    }

    if (deal.etapa === 'Cierre_Ganado') {
      eventos.push({
        tipo: 'Cambio_Estado',
        desc: `Firma de Minuta de Compraventa y elevación a Escritura Pública ante Notaría. Operación cerrada exitosamente.`,
        offsetDays: 1,
      });
    }

    if (deal.etapa === 'Descartado') {
      eventos.push({
        tipo: 'Cambio_Estado',
        desc: `Operación descartada por discrepancias en precio de suelo por metro cuadrado solicitado por el propietario frente a la tasa de absorción del desarrollador.`,
        offsetDays: 2,
      });
    }

    for (let i = 0; i < eventos.length; i++) {
      const ev = eventos[i];
      const bitId = deterministicUUID(NS_BIT, `${deal.code}-ev-${i}`);
      await sql`
        INSERT INTO bitacora_negociacion (
          id, negociacion_id, usuario_id, tipo_evento, descripcion, created_at
        ) VALUES (
          ${bitId}, ${deal.id}, ${deal.brokerId}, ${ev.tipo}, ${ev.desc}, NOW() - (${ev.offsetDays} || ' days')::INTERVAL
        )
        ON CONFLICT (id) DO UPDATE SET
          descripcion = EXCLUDED.descripcion,
          tipo_evento = EXCLUDED.tipo_evento;
      `;
      bitacorasInserted++;
    }
  }
  console.log(`✓ ${bitacorasInserted} Eventos de bitácora registrados en PostgreSQL.`);

  // 6. Poblar Comisiones y Liquidaciones (comisiones_cierres)
  console.log("\n6. Poblando comisiones_cierres para negociaciones ganadas...");
  const cierresGanados = createdDeals.filter(d => d.etapa === 'Cierre_Ganado');
  let comisionesInserted = 0;

  for (const c of cierresGanados) {
    const comId = deterministicUUID(NS_COM, `com-${c.code}`);
    const montoVenta = Number(c.montoOferta);
    const pctComision = 3.0; // 3.00% arancel estándar de corretaje corporativo
    const montoComision = (montoVenta * pctComision) / 100;
    const comisionBroker = montoComision * 0.45; // 45% al broker responsable
    const comisionEmpresa = montoComision * 0.55; // 55% a Promundo Central
    const estadoPago = c.code === 'deal-006' ? 'Cobrado' : 'Facturado';

    await sql`
      INSERT INTO comisiones_cierres (
        id, negociacion_id, monto_venta_final, pct_comision, monto_comision_total, comision_broker, comision_empresa, estado_pago, created_at, updated_at
      ) VALUES (
        ${comId}, ${c.id}, ${montoVenta.toFixed(2)}, ${pctComision.toFixed(2)}, ${montoComision.toFixed(2)}, ${comisionBroker.toFixed(2)}, ${comisionEmpresa.toFixed(2)}, ${estadoPago}, NOW() - INTERVAL '5 days', NOW()
      )
      ON CONFLICT (negociacion_id) DO UPDATE SET
        monto_venta_final = EXCLUDED.monto_venta_final,
        monto_comision_total = EXCLUDED.monto_comision_total,
        comision_broker = EXCLUDED.comision_broker,
        comision_empresa = EXCLUDED.comision_empresa,
        estado_pago = EXCLUDED.estado_pago,
        updated_at = NOW();
    `;
    comisionesInserted++;
  }
  console.log(`✓ ${comisionesInserted} Liquidaciones financieras en comisiones_cierres registradas en PostgreSQL.`);

  // 7. Resumen final de la Base de Datos
  console.log("\n=== RESUMEN DE INTEGRIDAD Y RECUENTO FINAL EN SUPABASE POSTGRESQL ===");
  const tables = ['usuarios', 'propietarios', 'terrenos', 'documentos_terreno', 'clientes', 'negociaciones', 'bitacora_negociacion', 'comisiones_cierres'];
  for (const t of tables) {
    const res = await sql.unsafe(`SELECT count(*) FROM "${t}";`);
    console.log(` - ${t.padEnd(25)}: ${res[0].count} registros`);
  }

  console.log("\n✓ ¡Semilla integral fiduciaria completada con éxito!");
  await sql.end();
}

main().catch(err => {
  console.error("ERROR FATAL en semilla de base de datos:", err);
  process.exit(1);
});
