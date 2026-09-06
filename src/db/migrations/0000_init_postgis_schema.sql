-- ==============================================================================
-- PROMUNDO SISTEMA - MIGRACIÓN INICIAL
-- PostgreSQL 15+ / Supabase con PostGIS
-- ==============================================================================

-- 1. HABILITAR EXTENSIÓN POSTGIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. CREACIÓN DE ENUMS
DO $$ BEGIN
    CREATE TYPE "rol_usuario" AS ENUM ('admin', 'broker_senior', 'broker_junior');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "tipo_documento" AS ENUM ('Certificado_Parametros', 'Partida_Registral', 'Plano_Catastral', 'Otros');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "moneda" AS ENUM ('USD', 'PEN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "estado_terreno" AS ENUM ('Disponible', 'En Negociacion', 'Vendido', 'Inactivo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "tipo_cliente" AS ENUM ('Constructora', 'Fondo_Inversion', 'Privado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "etapa_negociacion" AS ENUM ('Ficha_Enviada', 'En_Evaluacion', 'Visita_Realizada', 'LOI_Oferta', 'Due_Diligence', 'Cierre_Ganado', 'Descartado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "tipo_evento_bitacora" AS ENUM ('Nota', 'Llamada', 'Reunion', 'Cambio_Estado', 'Oferta_Presentada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "estado_pago_comision" AS ENUM ('Pendiente', 'Facturado', 'Cobrado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLA: usuarios
CREATE TABLE IF NOT EXISTS "usuarios" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "rol" "rol_usuario" NOT NULL DEFAULT 'broker_junior',
    "activo" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA: propietarios
CREATE TABLE IF NOT EXISTS "propietarios" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "razon_social_o_nombre" VARCHAR(255) NOT NULL,
    "tipo_doc" VARCHAR(20) DEFAULT 'DNI',
    "numero_doc" VARCHAR(30),
    "telefono" VARCHAR(50),
    "email" VARCHAR(255),
    "contacto_representante" VARCHAR(255),
    "notas_internas" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLA: terrenos (con campo GEOMETRY Point 4326)
CREATE TABLE IF NOT EXISTS "terrenos" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "codigo_interno" VARCHAR(50) NOT NULL UNIQUE,
    "propietario_id" UUID NOT NULL REFERENCES "propietarios"("id") ON DELETE RESTRICT,
    "direccion" VARCHAR(500) NOT NULL,
    "distrito" VARCHAR(100) NOT NULL,
    "referencia" TEXT,

    -- Geolocalización
    "latitud" NUMERIC(10, 7),
    "longitud" NUMERIC(10, 7),
    "geom" GEOMETRY(Point, 4326),

    -- Parámetros Técnicos y Urbanísticos
    "area_m2" NUMERIC(12, 2) NOT NULL,
    "frente_lineal_m" NUMERIC(8, 2),
    "fondo_promedio_m" NUMERIC(8, 2),
    "zonificacion" VARCHAR(50) NOT NULL,
    "altura_max_pisos" INTEGER,
    "coeficiente_edificacion" NUMERIC(6, 2),
    "area_libre_min_pct" NUMERIC(5, 2),
    "usos_permitidos" TEXT[],

    -- Comercial
    "precio_total" NUMERIC(14, 2) NOT NULL,
    "precio_m2" NUMERIC(10, 2) NOT NULL,
    "moneda" "moneda" NOT NULL DEFAULT 'USD',
    "estado_terreno" "estado_terreno" NOT NULL DEFAULT 'Disponible',

    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABLA: documentos_terreno
CREATE TABLE IF NOT EXISTS "documentos_terreno" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "terreno_id" UUID NOT NULL REFERENCES "terrenos"("id") ON DELETE CASCADE,
    "tipo_documento" "tipo_documento" NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "archivo_url" TEXT NOT NULL,
    "fecha_vencimiento" DATE,
    "es_confidencial" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABLA: clientes
CREATE TABLE IF NOT EXISTS "clientes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "razon_social" VARCHAR(255) NOT NULL,
    "tipo_cliente" "tipo_cliente" NOT NULL DEFAULT 'Constructora',
    "ticket_min" NUMERIC(14, 2),
    "ticket_max" NUMERIC(14, 2),
    "zonas_interes" TEXT[],
    "zonificaciones_interes" TEXT[],
    "altura_minima_interes" INTEGER,
    "contacto_nombre" VARCHAR(255),
    "telefono" VARCHAR(50),
    "email" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TABLA: negociaciones
CREATE TABLE IF NOT EXISTS "negociaciones" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "terreno_id" UUID NOT NULL REFERENCES "terrenos"("id") ON DELETE RESTRICT,
    "cliente_id" UUID NOT NULL REFERENCES "clientes"("id") ON DELETE RESTRICT,
    "broker_id" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE RESTRICT,
    "etapa" "etapa_negociacion" NOT NULL DEFAULT 'Ficha_Enviada',
    "monto_oferta" NUMERIC(14, 2),
    "probabilidad_cierre" INTEGER DEFAULT 10,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TABLA: bitacora_negociacion
CREATE TABLE IF NOT EXISTS "bitacora_negociacion" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "negociacion_id" UUID NOT NULL REFERENCES "negociaciones"("id") ON DELETE CASCADE,
    "usuario_id" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE RESTRICT,
    "tipo_evento" "tipo_evento_bitacora" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "archivo_adjunto_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TABLA: comisiones_cierres
CREATE TABLE IF NOT EXISTS "comisiones_cierres" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "negociacion_id" UUID NOT NULL UNIQUE REFERENCES "negociaciones"("id") ON DELETE RESTRICT,
    "monto_venta_final" NUMERIC(14, 2) NOT NULL,
    "pct_comision" NUMERIC(5, 2) NOT NULL,
    "monto_comision_total" NUMERIC(14, 2) NOT NULL,
    "comision_broker" NUMERIC(14, 2) NOT NULL,
    "comision_empresa" NUMERIC(14, 2) NOT NULL,
    "estado_pago" "estado_pago_comision" NOT NULL DEFAULT 'Pendiente',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES B-TREE Y ESPACIALES GIST PARA ALTO RENDIMIENTO
-- ==============================================================================

-- Índice espacial PostGIS para búsquedas por radio y bounding box
CREATE INDEX IF NOT EXISTS "terrenos_geom_gist_idx" ON "terrenos" USING GIST ("geom");

-- Índices de consulta frecuente para filtros acumulativos
CREATE INDEX IF NOT EXISTS "terrenos_distrito_idx" ON "terrenos" ("distrito");
CREATE INDEX IF NOT EXISTS "terrenos_zonificacion_idx" ON "terrenos" ("zonificacion");
CREATE INDEX IF NOT EXISTS "terrenos_estado_idx" ON "terrenos" ("estado_terreno");
CREATE INDEX IF NOT EXISTS "terrenos_area_idx" ON "terrenos" ("area_m2");
CREATE INDEX IF NOT EXISTS "terrenos_precio_m2_idx" ON "terrenos" ("precio_m2");
CREATE INDEX IF NOT EXISTS "terrenos_propietario_id_idx" ON "terrenos" ("propietario_id");

-- Índices de relaciones y pipeline
CREATE INDEX IF NOT EXISTS "documentos_terreno_terreno_id_idx" ON "documentos_terreno" ("terreno_id");
CREATE INDEX IF NOT EXISTS "documentos_terreno_tipo_idx" ON "documentos_terreno" ("tipo_documento");
CREATE INDEX IF NOT EXISTS "documentos_terreno_vencimiento_idx" ON "documentos_terreno" ("fecha_vencimiento");

CREATE INDEX IF NOT EXISTS "negociaciones_terreno_id_idx" ON "negociaciones" ("terreno_id");
CREATE INDEX IF NOT EXISTS "negociaciones_cliente_id_idx" ON "negociaciones" ("cliente_id");
CREATE INDEX IF NOT EXISTS "negociaciones_broker_id_idx" ON "negociaciones" ("broker_id");
CREATE INDEX IF NOT EXISTS "negociaciones_etapa_idx" ON "negociaciones" ("etapa");

CREATE INDEX IF NOT EXISTS "bitacora_negociacion_negociacion_id_idx" ON "bitacora_negociacion" ("negociacion_id");
CREATE INDEX IF NOT EXISTS "bitacora_negociacion_usuario_id_idx" ON "bitacora_negociacion" ("usuario_id");

-- ==============================================================================
-- TRIGGER PARA SINCRONIZAR AUTOMÁTICAMENTE 'geom' DESDE LAT/LNG
-- ==============================================================================
CREATE OR REPLACE FUNCTION sync_terrenos_geom()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitud IS NOT NULL AND NEW.longitud IS NOT NULL THEN
        NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitud, NEW.latitud), 4326);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_terrenos_geom ON "terrenos";
CREATE TRIGGER trigger_sync_terrenos_geom
BEFORE INSERT OR UPDATE OF latitud, longitud ON "terrenos"
FOR EACH ROW
EXECUTE FUNCTION sync_terrenos_geom();
