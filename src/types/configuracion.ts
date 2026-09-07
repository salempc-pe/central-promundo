import { MatchingWeights } from "./matching";

export type ZonificacionTipo =
  | "RDB"
  | "RDM"
  | "RDA"
  | "RDMA"
  | "VT"
  | "CV"
  | "CZ"
  | "CM"
  | "CI"
  | "CE"
  | "I1"
  | "I2"
  | "I3"
  | "I4"
  | "OU"
  | "ZRE"
  | "ZTE"
  | "E"
  | "H"
  | "ZRP"
  | "CH";

export interface IncentivoSostenible {
  activo: boolean;
  alturaAdicionalPisos: number;
  areaLibreReducidaPct: number;
  normaRef: string;
}

export interface ParametroUrbanisticoDistrital {
  id: string;
  distrito: string;
  zonificacion: ZonificacionTipo | string;
  alturaMaxPisos: number;
  alturaMaxMetros: number;
  coeficienteEdificacion: number;
  areaLibreMinPct: number;
  frenteMinimoM: number;
  loteMinimoM2: number;
  estacionamientosRequeridos: string;
  ordenanzaReferencia: string;
  fechaAprobacion: string;
  vigencia: boolean;
  incentivoViviendaSostenible?: IncentivoSostenible;
  notasNormativas: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ConfiguracionMatchingGlobal {
  weights: MatchingWeights;
  toleranciaPrecioPct: number; // ej: 15%
  toleranciaAlturaPisos: number; // ej: 2 pisos
  bonusCpuVigente: number; // ej: 5 puntos
  umbralesCompatibilidad: {
    prime: number; // >= 80
    alto: number; // >= 65
    medio: number; // >= 50
  };
  penalidadDistritoNoColindante: number; // ej: -20
  autoTriggerEnCambioLote: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface PostgisIndiceGist {
  nombreTabla: string;
  nombreColumnaGeom: string;
  nombreIndice: string;
  valido: boolean;
  tamanoBytes: string;
}

export interface PostgisTriggerEspacial {
  nombre: string;
  tabla: string;
  evento: string;
  activo: boolean;
  descripcion: string;
}

export interface GisInfraestructuraStatus {
  postgisVersion: string;
  sridDefault: number; // 4326 (WGS84)
  latenciaQueryMs: number;
  estadoConexion: "OPTIMO" | "DEGRADADO" | "ERROR";
  poolConexiones: {
    activas: number;
    idle: number;
    max: number;
  };
  indicesGist: PostgisIndiceGist[];
  triggersEspaciales: PostgisTriggerEspacial[];
  metricasUso: {
    totalGeometriasRegistradas: number;
    geometriasValidasPct: number;
    consultasDWithin24h: number;
    ultimaVerificacion: string;
  };
}

export interface CapaCartograficaInfo {
  id: string;
  nombre: string;
  tipo: "WMS" | "WFS" | "VECTOR_TILES" | "GEOJSON";
  fuenteInstitucional: string; // ej. "MML - Planmet 2040", "Sunarp IDEP"
  urlEndpoint: string;
  formato: string;
  activa: boolean;
  latenciaMs: number;
  estado: "ONLINE" | "LATENCIA_ALTA" | "OFFLINE";
  nivelZoomRecomendado: { min: number; max: number };
  ultimaSincronizacion: string;
}

export type ConfiguracionTabId = "parametros" | "matching" | "gis";
