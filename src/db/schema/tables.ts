import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  numeric,
  integer,
  date,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { postgisGeometryPoint } from "./custom-types";
import {
  rolUsuarioEnum,
  estadoAccesoEnum,
  tipoDocumentoEnum,
  monedaEnum,
  estadoTerrenoEnum,
  tipoClienteEnum,
  etapaNegociacionEnum,
  tipoEventoBitacoraEnum,
  estadoPagoComisionEnum,
} from "./enums";

// 1. USUARIOS (Brokers y Administradores con Control de Acceso)
export const usuarios = pgTable(
  "usuarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authId: text("auth_id"), // ID de Supabase Auth
    nombre: varchar("nombre", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    avatarUrl: text("avatar_url"),
    rol: rolUsuarioEnum("rol").notNull().default("broker_junior"),
    estadoAcceso: estadoAccesoEnum("estado_acceso").notNull().default("pendiente"),
    fechaSolicitud: timestamp("fecha_solicitud", { withTimezone: true }).defaultNow().notNull(),
    fechaResolucion: timestamp("fecha_resolucion", { withTimezone: true }),
    resueltoPor: varchar("resuelto_por", { length: 255 }),
    notas: text("notas"),
    activo: boolean("activo").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("usuarios_email_idx").on(table.email),
    rolIdx: index("usuarios_rol_idx").on(table.rol),
    estadoAccesoIdx: index("usuarios_estado_acceso_idx").on(table.estadoAcceso),
    authIdIdx: index("usuarios_auth_id_idx").on(table.authId),
  })
);

// 2. PROPIETARIOS (Personas naturales o jurídicas titulares del suelo)
export const propietarios = pgTable(
  "propietarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    razonSocialONombre: varchar("razon_social_o_nombre", { length: 255 }).notNull(),
    tipoDoc: varchar("tipo_doc", { length: 20 }).default("DNI"), // DNI, RUC, CE, Pasaporte
    numeroDoc: varchar("numero_doc", { length: 30 }),
    telefono: varchar("telefono", { length: 50 }),
    email: varchar("email", { length: 255 }),
    contactoRepresentante: varchar("contacto_representante", { length: 255 }),
    notasInternas: text("notas_internas"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    numeroDocIdx: index("propietarios_numero_doc_idx").on(table.numeroDoc),
    nombreIdx: index("propietarios_nombre_idx").on(table.razonSocialONombre),
  })
);

// 3. TERRENOS (Inventario Técnico y Comercial con PostGIS)
export const terrenos = pgTable(
  "terrenos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    codigoInterno: varchar("codigo_interno", { length: 50 }).notNull().unique(),
    propietarioId: uuid("propietario_id")
      .references(() => propietarios.id, { onDelete: "restrict" })
      .notNull(),
    direccion: varchar("direccion", { length: 500 }).notNull(),
    distrito: varchar("distrito", { length: 100 }).notNull(),
    referencia: text("referencia"),

    // Coordenadas y geometría espacial PostGIS
    latitud: numeric("latitud", { precision: 10, scale: 7 }),
    longitud: numeric("longitud", { precision: 10, scale: 7 }),
    geom: postgisGeometryPoint("geom"),

    // Parámetros Técnicos y Urbanísticos
    areaM2: numeric("area_m2", { precision: 12, scale: 2 }).notNull(),
    frenteLinealM: numeric("frente_lineal_m", { precision: 8, scale: 2 }),
    fondoPromedioM: numeric("fondo_promedio_m", { precision: 8, scale: 2 }),
    zonificacion: varchar("zonificacion", { length: 50 }).notNull(), // RDA, RDM, CZ, CM, I1, etc.
    alturaMaxPisos: integer("altura_max_pisos"),
    coeficienteEdificacion: numeric("coeficiente_edificacion", { precision: 6, scale: 2 }),
    areaLibreMinPct: numeric("area_libre_min_pct", { precision: 5, scale: 2 }),
    usosPermitidos: text("usos_permitidos").array(), // Array de textos (ej. Residencial, Comercial, Mixto)

    // Parámetros Comerciales
    precioTotal: numeric("precio_total", { precision: 14, scale: 2 }).notNull(),
    precioM2: numeric("precio_m2", { precision: 10, scale: 2 }).notNull(),
    moneda: monedaEnum("moneda").notNull().default("USD"),
    estadoTerreno: estadoTerrenoEnum("estado_terreno").notNull().default("Disponible"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    codigoInternoIdx: uniqueIndex("terrenos_codigo_interno_uidx").on(table.codigoInterno),
    distritoIdx: index("terrenos_distrito_idx").on(table.distrito),
    zonificacionIdx: index("terrenos_zonificacion_idx").on(table.zonificacion),
    estadoIdx: index("terrenos_estado_idx").on(table.estadoTerreno),
    areaIdx: index("terrenos_area_idx").on(table.areaM2),
    precioM2Idx: index("terrenos_precio_m2_idx").on(table.precioM2),
    // Índice espacial GIST generado por SQL en migraciones
  })
);

// 4. DOCUMENTOS DE TERRENO (Certificados de Parámetros, Partidas, Planos)
export const documentosTerreno = pgTable(
  "documentos_terreno",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    terrenoId: uuid("terreno_id")
      .references(() => terrenos.id, { onDelete: "cascade" })
      .notNull(),
    tipoDocumento: tipoDocumentoEnum("tipo_documento").notNull(),
    nombreArchivo: varchar("nombre_archivo", { length: 255 }).notNull(),
    archivoUrl: text("archivo_url").notNull(),
    fechaVencimiento: date("fecha_vencimiento"),
    esConfidencial: boolean("es_confidencial").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    terrenoIdIdx: index("documentos_terreno_terreno_id_idx").on(table.terrenoId),
    tipoDocIdx: index("documentos_terreno_tipo_idx").on(table.tipoDocumento),
    fechaVencimientoIdx: index("documentos_terreno_vencimiento_idx").on(table.fechaVencimiento),
  })
);

// 5. CLIENTES (Constructoras, Fondos de Inversión y Compradores)
export const clientes = pgTable(
  "clientes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    razonSocial: varchar("razon_social", { length: 255 }).notNull(),
    tipoCliente: tipoClienteEnum("tipo_cliente").notNull().default("Constructora"),
    ticketMin: numeric("ticket_min", { precision: 14, scale: 2 }),
    ticketMax: numeric("ticket_max", { precision: 14, scale: 2 }),
    zonasInteres: text("zonas_interes").array(), // Lista de distritos/zonas de interés
    zonificacionesInteres: text("zonificaciones_interes").array(), // Lista de zonificaciones buscadas
    alturaMinimaInteres: integer("altura_minima_interes"),
    contactoNombre: varchar("contacto_nombre", { length: 255 }),
    telefono: varchar("telefono", { length: 50 }),
    email: varchar("email", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    razonSocialIdx: index("clientes_razon_social_idx").on(table.razonSocial),
    tipoClienteIdx: index("clientes_tipo_cliente_idx").on(table.tipoCliente),
  })
);

// 6. NEGOCIACIONES (Pipeline comercial)
export const negociaciones = pgTable(
  "negociaciones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    terrenoId: uuid("terreno_id")
      .references(() => terrenos.id, { onDelete: "restrict" })
      .notNull(),
    clienteId: uuid("cliente_id")
      .references(() => clientes.id, { onDelete: "restrict" })
      .notNull(),
    brokerId: uuid("broker_id")
      .references(() => usuarios.id, { onDelete: "restrict" })
      .notNull(),
    etapa: etapaNegociacionEnum("etapa").notNull().default("Ficha_Enviada"),
    montoOferta: numeric("monto_oferta", { precision: 14, scale: 2 }),
    probabilidadCierre: integer("probabilidad_cierre").default(10), // % estimado de 0 a 100
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    terrenoIdIdx: index("negociaciones_terreno_id_idx").on(table.terrenoId),
    clienteIdIdx: index("negociaciones_cliente_id_idx").on(table.clienteId),
    brokerIdIdx: index("negociaciones_broker_id_idx").on(table.brokerId),
    etapaIdx: index("negociaciones_etapa_idx").on(table.etapa),
  })
);

// 7. BITÁCORA DE NEGOCIACIÓN (Auditoría inmutable de eventos)
export const bitacoraNegociacion = pgTable(
  "bitacora_negociacion",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    negociacionId: uuid("negociacion_id")
      .references(() => negociaciones.id, { onDelete: "cascade" })
      .notNull(),
    usuarioId: uuid("usuario_id")
      .references(() => usuarios.id, { onDelete: "restrict" })
      .notNull(),
    tipoEvento: tipoEventoBitacoraEnum("tipo_evento").notNull(),
    descripcion: text("descripcion").notNull(),
    archivoAdjuntoUrl: text("archivo_adjunto_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    negociacionIdIdx: index("bitacora_negociacion_negociacion_id_idx").on(table.negociacionId),
    usuarioIdIdx: index("bitacora_negociacion_usuario_id_idx").on(table.usuarioId),
    createdAtIdx: index("bitacora_negociacion_created_at_idx").on(table.createdAt),
  })
);

// 8. COMISIONES Y CIERRES (Liquidación financiera)
export const comisionesCierres = pgTable(
  "comisiones_cierres",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    negociacionId: uuid("negociacion_id")
      .references(() => negociaciones.id, { onDelete: "restrict" })
      .notNull()
      .unique(),
    montoVentaFinal: numeric("monto_venta_final", { precision: 14, scale: 2 }).notNull(),
    pctComision: numeric("pct_comision", { precision: 5, scale: 2 }).notNull(), // ej. 3.00%
    montoComisionTotal: numeric("monto_comision_total", { precision: 14, scale: 2 }).notNull(),
    comisionBroker: numeric("comision_broker", { precision: 14, scale: 2 }).notNull(),
    comisionEmpresa: numeric("comision_empresa", { precision: 14, scale: 2 }).notNull(),
    estadoPago: estadoPagoComisionEnum("estado_pago").notNull().default("Pendiente"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    negociacionIdIdx: uniqueIndex("comisiones_cierres_negociacion_id_uidx").on(table.negociacionId),
    estadoPagoIdx: index("comisiones_cierres_estado_pago_idx").on(table.estadoPago),
  })
);
