import {
  ParametroUrbanisticoDistrital,
  ConfiguracionMatchingGlobal,
  GisInfraestructuraStatus,
  CapaCartograficaInfo,
} from "@/types/configuracion";
import { parametrosUrbanisticosNormativos } from "@/lib/constants/parametros-normativos";
import { registrarEventoAuditoria } from "@/lib/services/auditoria";

// Catálogo de Parámetros Urbanísticos Normativos
let memoryParametros: ParametroUrbanisticoDistrital[] = [
  ...parametrosUrbanisticosNormativos,
];

// Configuración global del Motor de Matching (Default balanceado institucional)
let memoryConfigMatching: ConfiguracionMatchingGlobal = {
  weights: {
    ticket: 30,
    zona: 25,
    zonificacion: 20,
    altura: 15,
    frenteArea: 10,
  },
  toleranciaPrecioPct: 15,
  toleranciaAlturaPisos: 2,
  bonusCpuVigente: 5,
  umbralesCompatibilidad: {
    prime: 80,
    alto: 65,
    medio: 50,
  },
  penalidadDistritoNoColindante: -20,
  autoTriggerEnCambioLote: true,
  updatedAt: new Date().toISOString(),
  updatedBy: "Paulo Salem",
};

// Capas cartográficas WMS/Vectoriales institucionales
let memoryCapasCartograficas: CapaCartograficaInfo[] = [
  {
    id: "CAPA-MML-ZONIF",
    nombre: "Zonificación Metropolitana (Planmet 2040)",
    tipo: "WMS",
    fuenteInstitucional: "Municipalidad Metropolitana de Lima - IDEP",
    urlEndpoint: "https://idep.mml.gob.pe/geoserver/wms",
    formato: "image/png",
    activa: true,
    latenciaMs: 14,
    estado: "ONLINE",
    nivelZoomRecomendado: { min: 11, max: 19 },
    ultimaSincronizacion: new Date().toISOString(),
  },
  {
    id: "CAPA-SUNARP-PREDIAL",
    nombre: "Límites Prediales Sunarp (Catastro Registral)",
    tipo: "WFS",
    fuenteInstitucional: "Superintendencia Nacional de los Registros Públicos",
    urlEndpoint: "https://geocatastro.sunarp.gob.pe/ows/wfs",
    formato: "application/json",
    activa: true,
    latenciaMs: 22,
    estado: "ONLINE",
    nivelZoomRecomendado: { min: 14, max: 20 },
    ultimaSincronizacion: new Date().toISOString(),
  },
  {
    id: "CAPA-IMP-METRO",
    nombre: "Líneas de Transporte Masivo (Metro L1/L2)",
    tipo: "VECTOR_TILES",
    fuenteInstitucional: "Instituto Metropolitano de Planificación (IMP)",
    urlEndpoint: "https://gis.imp.gob.pe/tiles/transporte",
    formato: "pbf",
    activa: true,
    latenciaMs: 11,
    estado: "ONLINE",
    nivelZoomRecomendado: { min: 10, max: 18 },
    ultimaSincronizacion: new Date().toISOString(),
  },
  {
    id: "CAPA-INDECI-RIESGOS",
    nombre: "Mapa de Riesgo Sísmico y Geotécnico (CISMID)",
    tipo: "GEOJSON",
    fuenteInstitucional: "Instituto Nacional de Defensa Civil (INDECI)",
    urlEndpoint: "https://sigrid.indeci.gob.pe/geoserver/riesgos",
    formato: "geojson",
    activa: false,
    latenciaMs: 35,
    estado: "ONLINE",
    nivelZoomRecomendado: { min: 11, max: 17 },
    ultimaSincronizacion: new Date().toISOString(),
  },
];

// Estado técnico de PostGIS DB
let memoryGisStatus: GisInfraestructuraStatus = {
  postgisVersion: "3.4.2 (PostgreSQL 15.4)",
  sridDefault: 4326,
  latenciaQueryMs: 12,
  estadoConexion: "OPTIMO",
  poolConexiones: {
    activas: 4,
    idle: 16,
    max: 20,
  },
  indicesGist: [
    {
      nombreTabla: "terrenos",
      nombreColumnaGeom: "geom",
      nombreIndice: "terrenos_geom_gist_idx",
      valido: true,
      tamanoBytes: "64 kB",
    },
  ],
  triggersEspaciales: [
    {
      nombre: "trg_sync_terrenos_geometry",
      tabla: "terrenos",
      evento: "BEFORE INSERT OR UPDATE (latitud, longitud)",
      activo: true,
      descripcion:
        "Sincroniza automáticamente ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)",
    },
  ],
  metricasUso: {
    totalGeometriasRegistradas: 18,
    geometriasValidasPct: 100.0,
    consultasDWithin24h: 342,
    ultimaVerificacion: new Date().toISOString(),
  },
};

// ==========================================
// 1. PARÁMETROS URBANÍSTICOS DISTRITALES
// ==========================================

export async function getParametrosUrbanisticos(filtro?: {
  distrito?: string;
  zonificacion?: string;
  busqueda?: string;
}): Promise<ParametroUrbanisticoDistrital[]> {
  let list = [...memoryParametros];

  if (!filtro) return list;

  if (filtro.distrito && filtro.distrito !== "todos") {
    list = list.filter((p) => p.distrito === filtro.distrito);
  }

  if (filtro.zonificacion && filtro.zonificacion !== "todas") {
    list = list.filter((p) => p.zonificacion === filtro.zonificacion);
  }

  if (filtro.busqueda && filtro.busqueda.trim() !== "") {
    const q = filtro.busqueda.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.distrito.toLowerCase().includes(q) ||
        p.zonificacion.toLowerCase().includes(q) ||
        p.ordenanzaReferencia.toLowerCase().includes(q) ||
        p.notasNormativas.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function updateParametroUrbanistico(
  id: string,
  input: Partial<ParametroUrbanisticoDistrital>,
  usuarioNombre: string = "Paulo Salem"
): Promise<ParametroUrbanisticoDistrital> {
  const index = memoryParametros.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Parámetro normativo con ID ${id} no encontrado.`);
  }

  const anterior = { ...memoryParametros[index] };
  const actualizado: ParametroUrbanisticoDistrital = {
    ...anterior,
    ...input,
    updatedAt: new Date().toISOString(),
    updatedBy: usuarioNombre,
  };

  memoryParametros[index] = actualizado;

  // Registrar auditoría forense
  registrarEventoAuditoria({
    usuarioNombre,
    modulo: "configuracion",
    tipoAccion: "ACTUALIZACION",
    severidad: "WARNING",
    entidadAfectada: "Parámetro Urbanístico",
    entidadId: id,
    descripcion: `Modificación de parámetros normativos para ${actualizado.zonificacion} en ${actualizado.distrito}.`,
    estadoAnterior: anterior,
    estadoNuevo: actualizado,
  });

  return actualizado;
}

// ==========================================
// 2. CALIBRACIÓN DEL MOTOR DE MATCHING
// ==========================================

export async function getConfiguracionMatching(): Promise<ConfiguracionMatchingGlobal> {
  return { ...memoryConfigMatching };
}

export async function updateConfiguracionMatching(
  input: ConfiguracionMatchingGlobal,
  usuarioNombre: string = "Paulo Salem"
): Promise<ConfiguracionMatchingGlobal> {
  const { ticket, zona, zonificacion, altura, frenteArea } = input.weights;
  const suma = ticket + zona + zonificacion + altura + frenteArea;

  if (suma !== 100) {
    throw new Error(
      `Error de calibración: la suma de las ponderaciones debe ser exactamente 100% (actual: ${suma}%).`
    );
  }

  const anterior = { ...memoryConfigMatching };
  const nuevaConfig: ConfiguracionMatchingGlobal = {
    ...input,
    updatedAt: new Date().toISOString(),
    updatedBy: usuarioNombre,
  };

  memoryConfigMatching = nuevaConfig;

  // Registrar auditoría forense
  registrarEventoAuditoria({
    usuarioNombre,
    modulo: "configuracion",
    tipoAccion: "ACTUALIZACION",
    severidad: "CRITICAL",
    entidadAfectada: "Motor de Matching",
    entidadId: "MATCHING-GLOBAL-CONFIG",
    descripcion: `Recalibración de pesos de afinidad: Ticket (${ticket}%), Zona (${zona}%), Zonif (${zonificacion}%), Altura (${altura}%), Frente/Área (${frenteArea}%).`,
    estadoAnterior: anterior,
    estadoNuevo: nuevaConfig,
  });

  return nuevaConfig;
}

export async function resetConfiguracionMatching(
  usuarioNombre: string = "Paulo Salem"
): Promise<ConfiguracionMatchingGlobal> {
  const defaultConfig: ConfiguracionMatchingGlobal = {
    weights: {
      ticket: 30,
      zona: 25,
      zonificacion: 20,
      altura: 15,
      frenteArea: 10,
    },
    toleranciaPrecioPct: 15,
    toleranciaAlturaPisos: 2,
    bonusCpuVigente: 5,
    umbralesCompatibilidad: {
      prime: 80,
      alto: 65,
      medio: 50,
    },
    penalidadDistritoNoColindante: -20,
    autoTriggerEnCambioLote: true,
    updatedAt: new Date().toISOString(),
    updatedBy: usuarioNombre,
  };

  return updateConfiguracionMatching(defaultConfig, usuarioNombre);
}

// ==========================================
// 3. MONITOR GIS & INFRAESTRUCTURA DB
// ==========================================

export async function getGisInfraestructuraStatus(): Promise<GisInfraestructuraStatus> {
  return { ...memoryGisStatus };
}

export async function ejecutarDiagnosticoGis(
  usuarioNombre: string = "Paulo Salem"
): Promise<GisInfraestructuraStatus> {
  // Simulación dinámica de latencia real entre 9ms y 14ms
  const nuevaLatencia = Math.floor(Math.random() * 5) + 9;

  memoryGisStatus = {
    ...memoryGisStatus,
    latenciaQueryMs: nuevaLatencia,
    metricasUso: {
      ...memoryGisStatus.metricasUso,
      consultasDWithin24h:
        memoryGisStatus.metricasUso.consultasDWithin24h + 1,
      ultimaVerificacion: new Date().toISOString(),
    },
  };

  // Registrar auditoría
  registrarEventoAuditoria({
    usuarioNombre,
    modulo: "gis",
    tipoAccion: "CALCULO",
    severidad: "INFO",
    entidadAfectada: "Infraestructura PostGIS",
    entidadId: "GIST-DIAGNOSTIC",
    descripcion: `Diagnóstico espacial completado: latencia ${nuevaLatencia}ms, índices GiST 100% íntegros (EPSG:4326).`,
    estadoAnterior: null,
    estadoNuevo: memoryGisStatus,
  });

  return { ...memoryGisStatus };
}

export async function getCapasCartograficas(): Promise<CapaCartograficaInfo[]> {
  return [...memoryCapasCartograficas];
}

export async function toggleCapaCartografica(
  id: string,
  activa: boolean,
  usuarioNombre: string = "Paulo Salem"
): Promise<CapaCartograficaInfo> {
  const index = memoryCapasCartograficas.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Capa cartográfica con ID ${id} no encontrada.`);
  }

  const anterior = { ...memoryCapasCartograficas[index] };
  const actualizada: CapaCartograficaInfo = {
    ...anterior,
    activa,
    ultimaSincronizacion: new Date().toISOString(),
  };

  memoryCapasCartograficas[index] = actualizada;

  registrarEventoAuditoria({
    usuarioNombre,
    modulo: "gis",
    tipoAccion: "ACTUALIZACION",
    severidad: "INFO",
    entidadAfectada: "Capa Cartográfica",
    entidadId: id,
    descripcion: `${activa ? "Activación" : "Desactivación"} de capa cartográfica '${actualizada.nombre}'.`,
    estadoAnterior: anterior,
    estadoNuevo: actualizada,
  });

  return actualizada;
}
