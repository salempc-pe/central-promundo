import postgres from 'postgres';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: No connection string found in .env.local');
  process.exit(1);
}

console.log('Connecting to PostgreSQL Supabase for Terrenos & Propietarios seeding...');
const sql = postgres(connectionString, {
  prepare: false,
  ssl: 'require'
});

// UUID determinista a partir de un string (UUID v5 simulación determinista)
function deterministicUUID(namespace, name) {
  const hash = crypto.createHash('sha1').update(`${namespace}:${name}`).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '5' + hash.substring(13, 16), // version 5
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20), // variant RFC4122
    hash.substring(20, 32),
  ].join('-');
}

const NS_PROP = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const NS_TERR = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
const NS_CLI = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';

const propietariosSeed = [
  {
    code: 'prop-01',
    razonSocialONombre: 'Inversiones Inmobiliarias Balboa S.A.C.',
    tipoDoc: 'RUC',
    numeroDoc: '20549812341',
    telefono: '+51 984 120 440',
    email: 'gerencia@inversionesbalboa.pe',
    contactoRepresentante: 'Ing. Carlos Mendoza V.',
    notasInternas: 'Propietario directo. Trato ágil. Abiertos a canje del 15% en metros cuadrados construidos.',
  },
  {
    code: 'prop-02',
    razonSocialONombre: 'Sucesión Intestada Familia De La Cuba',
    tipoDoc: 'DNI',
    numeroDoc: '08451299',
    telefono: '+51 998 334 112',
    email: 'herederos.delacuba@gmail.com',
    contactoRepresentante: 'Dra. Patricia De La Cuba (Apoderada)',
    notasInternas: 'Poderes inscritos en SUNARP asiento C0004. 3 copropietarios de acuerdo con el precio de cierre.',
  },
  {
    code: 'prop-03',
    razonSocialONombre: 'Corporación Textil del Sur S.A.',
    tipoDoc: 'RUC',
    numeroDoc: '20109944321',
    telefono: '+51 971 880 021',
    email: 'activos@textildelsur.com',
    contactoRepresentante: 'Lic. Roberto Thorne',
    notasInternas: 'Desinversión de activos industriales en desuso. Listo para demolición inmediata.',
  },
  {
    code: 'prop-04',
    razonSocialONombre: 'Familia Miró Quesada & Asociados',
    tipoDoc: 'DNI',
    numeroDoc: '07889123',
    telefono: '+51 940 221 890',
    email: 'jmiroquesada@estudiomiro.com',
    contactoRepresentante: 'Dr. Jorge Miró Quesada',
    notasInternas: 'Exclusividad de corretaje firmada por 180 días. Solo fondos y constructoras A1.',
  },
  {
    code: 'prop-05',
    razonSocialONombre: 'Inmobiliaria & Constructora San Miguel Arcángel S.A.',
    tipoDoc: 'RUC',
    numeroDoc: '20601244589',
    telefono: '+51 955 410 782',
    email: 'desarrollo@sanmiguelarcangel.pe',
    contactoRepresentante: 'Arq. Gonzalo Velásquez',
    notasInternas: 'Lote acumulado con saneamiento físico-legal al 100%. Licencia de demolición aprobada.',
  },
];

const clientesSeed = [
  {
    code: 'cli-01',
    razonSocial: 'Grupo Lar Inmobiliaria Perú',
    tipoCliente: 'Constructora',
    ticketMin: 2000000.0,
    ticketMax: 8000000.0,
    zonasInteres: ['Miraflores', 'San Isidro', 'Jesús María', 'San Miguel', 'Surquillo'],
    zonificacionesInteres: ['RDA', 'CZ', 'RDM'],
    alturaMinimaInteres: 10,
    contactoNombre: 'Ing. Manuel De La Rosa',
    telefono: '+51 989 123 456',
    email: 'm.delarosa@grupolar.com',
  },
  {
    code: 'cli-02',
    razonSocial: 'Besco Proyectos Inmobiliarios',
    tipoCliente: 'Constructora',
    ticketMin: 3000000.0,
    ticketMax: 12000000.0,
    zonasInteres: ['San Miguel', 'Magdalena del Mar', 'Lince', 'Pueblo Libre'],
    zonificacionesInteres: ['RDA', 'CZ', 'CM'],
    alturaMinimaInteres: 12,
    contactoNombre: 'Lic. Andrea Ugarte',
    telefono: '+51 997 654 321',
    email: 'augarte@besco.com.pe',
  },
  {
    code: 'cli-03',
    razonSocial: 'Edifica Real Estate Fund',
    tipoCliente: 'Fondo_Inversion',
    ticketMin: 4000000.0,
    ticketMax: 20000000.0,
    zonasInteres: ['Miraflores', 'San Isidro', 'Barranco', 'San Borja'],
    zonificacionesInteres: ['RDA', 'CZ', 'CM'],
    alturaMinimaInteres: 15,
    contactoNombre: 'Econ. Fernando Zuzunaga',
    telefono: '+51 994 332 110',
    email: 'fzuzunaga@edifica.com.pe',
  },
  {
    code: 'cli-04',
    razonSocial: 'Viva Negocio Inmobiliario (Grupo Graña)',
    tipoCliente: 'Constructora',
    ticketMin: 1500000.0,
    ticketMax: 5000000.0,
    zonasInteres: ['Santiago de Surco', 'Chorrillos', 'Ate', 'San Borja'],
    zonificacionesInteres: ['RDM', 'RDA'],
    alturaMinimaInteres: 5,
    contactoNombre: 'Arq. Luis Felipe Morales',
    telefono: '+51 981 772 334',
    email: 'lfmorales@viva.com.pe',
  },
];

const terrenosSeed = [
  {
    codigoInterno: 'TR-MIRA-084',
    propCode: 'prop-01',
    direccion: 'Av. Vasco Núñez de Balboa 640',
    distrito: 'Miraflores',
    referencia: 'A 2 cuadras del Malecón de la Reserva y Av. Larco',
    latitud: -12.1306,
    longitud: -77.0251,
    areaM2: 1250.0,
    frenteLinealM: 25.0,
    fondoPromedioM: 50.0,
    zonificacion: 'RDA',
    alturaMaxPisos: 10,
    coeficienteEdificacion: '5.50',
    areaLibreMinPct: '30.00',
    usosPermitidos: ['Residencial Multifamiliar', 'Vivienda Taller', 'Hotel Boutique'],
    precioTotal: 3125000.0,
    precioM2: 2500.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-SISI-019',
    propCode: 'prop-02',
    direccion: 'Calle Las Palmeras 435',
    distrito: 'San Isidro',
    referencia: 'A media cuadra de Av. Javier Prado Oeste y el Club El Golf',
    latitud: -12.0942,
    longitud: -77.0398,
    areaM2: 980.0,
    frenteLinealM: 20.0,
    fondoPromedioM: 49.0,
    zonificacion: 'RDA',
    alturaMaxPisos: 14,
    coeficienteEdificacion: '6.80',
    areaLibreMinPct: '35.00',
    usosPermitidos: ['Residencial Multifamiliar', 'Oficinas Administrativas'],
    precioTotal: 3136000.0,
    precioM2: 3200.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-SURC-052',
    propCode: 'prop-04',
    direccion: 'Av. Circunvalación del Golf Los Incas 180',
    distrito: 'Santiago de Surco',
    referencia: 'Frente a cancha de golf, zona Los Inkas / Camacho',
    latitud: -12.0872,
    longitud: -76.9634,
    areaM2: 2100.0,
    frenteLinealM: 35.0,
    fondoPromedioM: 60.0,
    zonificacion: 'RDA',
    alturaMaxPisos: 12,
    coeficienteEdificacion: '5.00',
    areaLibreMinPct: '40.00',
    usosPermitidos: ['Residencial Multifamiliar de Lujo'],
    precioTotal: 4620000.0,
    precioM2: 2200.0,
    moneda: 'USD',
    estadoTerreno: 'En Negociacion',
  },
  {
    codigoInterno: 'TR-BCO-011',
    propCode: 'prop-02',
    direccion: 'Av. Pedro de Osma 315',
    distrito: 'Barranco',
    referencia: 'Zona monumental tradicional, a pasos de la plaza de Barranco',
    latitud: -12.1492,
    longitud: -77.0215,
    areaM2: 780.0,
    frenteLinealM: 18.0,
    fondoPromedioM: 43.33,
    zonificacion: 'ZTE',
    alturaMaxPisos: 5,
    coeficienteEdificacion: '3.20',
    areaLibreMinPct: '35.00',
    usosPermitidos: ['Residencial', 'Comercial Cultural', 'Galería de Arte'],
    precioTotal: 1716000.0,
    precioM2: 2200.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-SMIG-033',
    propCode: 'prop-05',
    direccion: 'Av. Costanera 1420',
    distrito: 'San Miguel',
    referencia: 'Primera línea frente al mar, vista panorámica a la bahía',
    latitud: -12.0885,
    longitud: -77.0875,
    areaM2: 1850.0,
    frenteLinealM: 32.0,
    fondoPromedioM: 57.81,
    zonificacion: 'RDA',
    alturaMaxPisos: 15,
    coeficienteEdificacion: '7.00',
    areaLibreMinPct: '30.00',
    usosPermitidos: ['Residencial Multifamiliar', 'Comercio en Primer Piso'],
    precioTotal: 3145000.0,
    precioM2: 1700.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-JMA-027',
    propCode: 'prop-01',
    direccion: 'Av. San Felipe 850',
    distrito: 'Jesús María',
    referencia: 'Frente a universidad del Pacífico y cerca de Av. Salaverry',
    latitud: -12.0835,
    longitud: -77.0512,
    areaM2: 1400.0,
    frenteLinealM: 28.0,
    fondoPromedioM: 50.0,
    zonificacion: 'CZ',
    alturaMaxPisos: 18,
    coeficienteEdificacion: '8.00',
    areaLibreMinPct: '30.00',
    usosPermitidos: ['Residencial Mixto', 'Comercio Zonal', 'Oficinas'],
    precioTotal: 3500000.0,
    precioM2: 2500.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-MAG-018',
    propCode: 'prop-04',
    direccion: 'Jr. Bolognesi 620',
    distrito: 'Magdalena del Mar',
    referencia: 'A 3 cuadras de la plaza de Magdalena y Malecón Castagnola',
    latitud: -12.0915,
    longitud: -77.0705,
    areaM2: 920.0,
    frenteLinealM: 20.0,
    fondoPromedioM: 46.0,
    zonificacion: 'RDA',
    alturaMaxPisos: 12,
    coeficienteEdificacion: '5.80',
    areaLibreMinPct: '30.00',
    usosPermitidos: ['Residencial Multifamiliar'],
    precioTotal: 1748000.0,
    precioM2: 1900.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-LCE-041',
    propCode: 'prop-01',
    direccion: 'Av. Arequipa 2240',
    distrito: 'Lince',
    referencia: 'Eje financiero Av. Arequipa, frente a ciclovía y transporte integrado',
    latitud: -12.0845,
    longitud: -77.0345,
    areaM2: 1100.0,
    frenteLinealM: 22.0,
    fondoPromedioM: 50.0,
    zonificacion: 'CM',
    alturaMaxPisos: 20,
    coeficienteEdificacion: '9.00',
    areaLibreMinPct: '25.00',
    usosPermitidos: ['Comercio Metropolitano', 'Vivienda Multifamiliar', 'Oficinas'],
    precioTotal: 3080000.0,
    precioM2: 2800.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-SBOR-071',
    propCode: 'prop-04',
    direccion: 'Av. San Borja Sur 890',
    distrito: 'San Borja',
    referencia: 'Entre Av. Aviación y Av. San Luis, entorno residencial consolidado',
    latitud: -12.1012,
    longitud: -76.9938,
    areaM2: 1050.0,
    frenteLinealM: 21.0,
    fondoPromedioM: 50.0,
    zonificacion: 'RDM',
    alturaMaxPisos: 8,
    coeficienteEdificacion: '4.50',
    areaLibreMinPct: '35.00',
    usosPermitidos: ['Residencial Multifamiliar de Media Densidad'],
    precioTotal: 2310000.0,
    precioM2: 2200.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-SURQ-015',
    propCode: 'prop-03',
    direccion: 'Av. Tomás Marsano 940',
    distrito: 'Surquillo',
    referencia: 'Límite directo con Miraflores (zona Open Plaza / Aurora)',
    latitud: -12.1135,
    longitud: -77.0162,
    areaM2: 1350.0,
    frenteLinealM: 26.0,
    fondoPromedioM: 51.92,
    zonificacion: 'CZ',
    alturaMaxPisos: 15,
    coeficienteEdificacion: '7.50',
    areaLibreMinPct: '30.00',
    usosPermitidos: ['Residencial Multifamiliar', 'Comercial Mixto'],
    precioTotal: 3105000.0,
    precioM2: 2300.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-ATE-090',
    propCode: 'prop-03',
    direccion: 'Av. Nicolás Ayllón 3850',
    distrito: 'Ate',
    referencia: 'Frente a estación de Línea 2 del Metro de Lima',
    latitud: -12.0545,
    longitud: -76.9452,
    areaM2: 4500.0,
    frenteLinealM: 60.0,
    fondoPromedioM: 75.0,
    zonificacion: 'I1',
    alturaMaxPisos: 12,
    coeficienteEdificacion: '6.00',
    areaLibreMinPct: '30.00',
    usosPermitidos: ['Vivienda de Interés Social', 'Comercio Industrial', 'Logística Ligera'],
    precioTotal: 4050000.0,
    precioM2: 900.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-PLIB-022',
    propCode: 'prop-05',
    direccion: 'Av. Sucre 480',
    distrito: 'Pueblo Libre',
    referencia: 'A 2 cuadras del Hospital Santa Rosa y plaza Bolívar',
    latitud: -12.0765,
    longitud: -77.0628,
    areaM2: 890.0,
    frenteLinealM: 19.5,
    fondoPromedioM: 45.64,
    zonificacion: 'RDA',
    alturaMaxPisos: 10,
    coeficienteEdificacion: '5.20',
    areaLibreMinPct: '30.00',
    usosPermitidos: ['Residencial Multifamiliar'],
    precioTotal: 1513000.0,
    precioM2: 1700.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-CHO-064',
    propCode: 'prop-02',
    direccion: 'Av. Huunlas 710',
    distrito: 'Chorrillos',
    referencia: 'Zona consolidada cerca al Malecón Grau y Escuela Militar',
    latitud: -12.1645,
    longitud: -77.0245,
    areaM2: 1600.0,
    frenteLinealM: 30.0,
    fondoPromedioM: 53.33,
    zonificacion: 'RDM',
    alturaMaxPisos: 7,
    coeficienteEdificacion: '3.80',
    areaLibreMinPct: '35.00',
    usosPermitidos: ['Residencial Multifamiliar'],
    precioTotal: 2080000.0,
    precioM2: 1300.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-LMOL-039',
    propCode: 'prop-04',
    direccion: 'Av. La Molina 2680',
    distrito: 'La Molina',
    referencia: 'Cerca a Molicentro, zona Rinconada / La Planicie',
    latitud: -12.0882,
    longitud: -76.9215,
    areaM2: 3200.0,
    frenteLinealM: 45.0,
    fondoPromedioM: 71.11,
    zonificacion: 'RDM',
    alturaMaxPisos: 4,
    coeficienteEdificacion: '2.50',
    areaLibreMinPct: '45.00',
    usosPermitidos: ['Residencial de Baja y Media Densidad', 'Condominio'],
    precioTotal: 4480000.0,
    precioM2: 1400.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-SISI-058',
    propCode: 'prop-01',
    direccion: 'Av. Javier Prado Este 560',
    distrito: 'San Isidro',
    referencia: 'Centro Financiero San Isidro, frente a sede Interbank',
    latitud: -12.0912,
    longitud: -77.0255,
    areaM2: 1750.0,
    frenteLinealM: 30.0,
    fondoPromedioM: 58.33,
    zonificacion: 'CM',
    alturaMaxPisos: 22,
    coeficienteEdificacion: '10.00',
    areaLibreMinPct: '20.00',
    usosPermitidos: ['Oficinas Prime A+', 'Hotel Corporativo', 'Comercio'],
    precioTotal: 7000000.0,
    precioM2: 4000.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-MIRA-092',
    propCode: 'prop-02',
    direccion: 'Calle Alcanfores 840',
    distrito: 'Miraflores',
    referencia: 'A pasos del Parque Reducto N°2 y estación Benavides Metropolitano',
    latitud: -12.1265,
    longitud: -77.0232,
    areaM2: 850.0,
    frenteLinealM: 18.0,
    fondoPromedioM: 47.22,
    zonificacion: 'RDA',
    alturaMaxPisos: 10,
    coeficienteEdificacion: '5.50',
    areaLibreMinPct: '30.00',
    usosPermitidos: ['Residencial Multifamiliar'],
    precioTotal: 2380000.0,
    precioM2: 2800.0,
    moneda: 'USD',
    estadoTerreno: 'En Negociacion',
  },
  {
    codigoInterno: 'TR-SURC-088',
    propCode: 'prop-05',
    direccion: 'Av. Primavera 1540',
    distrito: 'Santiago de Surco',
    referencia: 'Chacarilla del Estanque, frente a centro financiero Chacarilla',
    latitud: -12.1125,
    longitud: -76.9895,
    areaM2: 1950.0,
    frenteLinealM: 33.0,
    fondoPromedioM: 59.09,
    zonificacion: 'CZ',
    alturaMaxPisos: 12,
    coeficienteEdificacion: '6.20',
    areaLibreMinPct: '30.00',
    usosPermitidos: ['Comercio Zonal', 'Residencial Multifamiliar', 'Consultorios Médicos'],
    precioTotal: 5070000.0,
    precioM2: 2600.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
  {
    codigoInterno: 'TR-CAL-005',
    propCode: 'prop-03',
    direccion: 'Av. Elmer Faucett 2840',
    distrito: 'Callao',
    referencia: 'A 5 minutos del Aeropuerto Internacional Jorge Chávez',
    latitud: -12.0295,
    longitud: -77.1085,
    areaM2: 5200.0,
    frenteLinealM: 70.0,
    fondoPromedioM: 74.29,
    zonificacion: 'I1',
    alturaMaxPisos: 8,
    coeficienteEdificacion: '4.80',
    areaLibreMinPct: '30.00',
    usosPermitidos: ['Almacenes Logísticos', 'Centro de Distribución', 'Oficinas'],
    precioTotal: 4160000.0,
    precioM2: 800.0,
    moneda: 'USD',
    estadoTerreno: 'Disponible',
  },
];

async function seed() {
  try {
    console.log('1. Seeding Propietarios...');
    const propMap = new Map();
    for (const p of propietariosSeed) {
      const id = deterministicUUID(NS_PROP, p.code);
      propMap.set(p.code, id);

      await sql`
        INSERT INTO "public"."propietarios" (
          id, razon_social_o_nombre, tipo_doc, numero_doc, telefono, email, contacto_representante, notas_internas
        ) VALUES (
          ${id}, ${p.razonSocialONombre}, ${p.tipoDoc}, ${p.numeroDoc}, ${p.telefono}, ${p.email}, ${p.contactoRepresentante}, ${p.notasInternas}
        )
        ON CONFLICT (id) DO UPDATE SET
          razon_social_o_nombre = EXCLUDED.razon_social_o_nombre,
          tipo_doc = EXCLUDED.tipo_doc,
          numero_doc = EXCLUDED.numero_doc,
          telefono = EXCLUDED.telefono,
          email = EXCLUDED.email,
          contacto_representante = EXCLUDED.contacto_representante,
          notas_internas = EXCLUDED.notas_internas;
      `;
    }
    console.log(`✓ ${propietariosSeed.length} Propietarios upserted successfully.`);

    console.log('2. Seeding Clientes...');
    for (const c of clientesSeed) {
      const id = deterministicUUID(NS_CLI, c.code);
      await sql`
        INSERT INTO "public"."clientes" (
          id, razon_social, tipo_cliente, ticket_min, ticket_max, zonas_interes, zonificaciones_interes, altura_minima_interes, contacto_nombre, telefono, email
        ) VALUES (
          ${id}, ${c.razonSocial}, ${c.tipoCliente}, ${c.ticketMin}, ${c.ticketMax}, ${c.zonasInteres}, ${c.zonificacionesInteres}, ${c.alturaMinimaInteres}, ${c.contactoNombre}, ${c.telefono}, ${c.email}
        )
        ON CONFLICT (id) DO UPDATE SET
          razon_social = EXCLUDED.razon_social,
          ticket_min = EXCLUDED.ticket_min,
          ticket_max = EXCLUDED.ticket_max,
          zonas_interes = EXCLUDED.zonas_interes,
          zonificaciones_interes = EXCLUDED.zonificaciones_interes,
          contacto_nombre = EXCLUDED.contacto_nombre;
      `;
    }
    console.log(`✓ ${clientesSeed.length} Clientes upserted successfully.`);

    console.log('3. Seeding Terrenos with PostGIS Point geometries...');
    for (const t of terrenosSeed) {
      const id = deterministicUUID(NS_TERR, t.codigoInterno);
      const propId = propMap.get(t.propCode);

      await sql`
        INSERT INTO "public"."terrenos" (
          id, codigo_interno, propietario_id, direccion, distrito, referencia,
          latitud, longitud, geom,
          area_m2, frente_lineal_m, fondo_promedio_m, zonificacion, altura_max_pisos,
          coeficiente_edificacion, area_libre_min_pct, usos_permitidos,
          precio_total, precio_m2, moneda, estado_terreno
        ) VALUES (
          ${id}, ${t.codigoInterno}, ${propId}, ${t.direccion}, ${t.distrito}, ${t.referencia},
          ${t.latitud}, ${t.longitud}, ST_SetSRID(ST_MakePoint(${t.longitud}, ${t.latitud}), 4326),
          ${t.areaM2}, ${t.frenteLinealM}, ${t.fondoPromedioM}, ${t.zonificacion}, ${t.alturaMaxPisos},
          ${t.coeficienteEdificacion}, ${t.areaLibreMinPct}, ${t.usosPermitidos},
          ${t.precioTotal}, ${t.precioM2}, ${t.moneda}, ${t.estadoTerreno}
        )
        ON CONFLICT (codigo_interno) DO UPDATE SET
          direccion = EXCLUDED.direccion,
          distrito = EXCLUDED.distrito,
          referencia = EXCLUDED.referencia,
          latitud = EXCLUDED.latitud,
          longitud = EXCLUDED.longitud,
          geom = EXCLUDED.geom,
          area_m2 = EXCLUDED.area_m2,
          frente_lineal_m = EXCLUDED.frente_lineal_m,
          fondo_promedio_m = EXCLUDED.fondo_promedio_m,
          zonificacion = EXCLUDED.zonificacion,
          altura_max_pisos = EXCLUDED.altura_max_pisos,
          coeficiente_edificacion = EXCLUDED.coeficiente_edificacion,
          area_libre_min_pct = EXCLUDED.area_libre_min_pct,
          usos_permitidos = EXCLUDED.usos_permitidos,
          precio_total = EXCLUDED.precio_total,
          precio_m2 = EXCLUDED.precio_m2,
          moneda = EXCLUDED.moneda,
          estado_terreno = EXCLUDED.estado_terreno;
      `;
    }
    console.log(`✓ ${terrenosSeed.length} Terrenos with PostGIS geometries upserted successfully.`);

    const check = await sql`
      SELECT 
        (SELECT count(*) FROM "public"."propietarios") as propietarios_count,
        (SELECT count(*) FROM "public"."terrenos") as terrenos_count,
        (SELECT count(*) FROM "public"."clientes") as clientes_count;
    `;
    console.log('CURRENT_DB_COUNTS:', check[0]);

  } catch (err) {
    console.error('Error in seed script:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();
