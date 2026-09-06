import { TerrenoCompleto, Cliente, Usuario } from "@/types";

/** Criterios evaluados en el motor de afinidad */
export type CriterioMatching =
  | "ticket"
  | "zona"
  | "zonificacion"
  | "altura"
  | "frenteArea";

/** Configuración de ponderaciones de los 5 criterios (deben sumar 100%) */
export interface MatchingWeights {
  ticket: number;     // por defecto: 30%
  zona: number;       // por defecto: 25%
  zonificacion: number; // por defecto: 20%
  altura: number;     // por defecto: 15%
  frenteArea: number; // por defecto: 10%
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  ticket: 30,
  zona: 25,
  zonificacion: 20,
  altura: 15,
  frenteArea: 10,
};

/** Severidad de brecha (Gap) detectada */
export type MatchingGapTipo = "optimo" | "alerta" | "critico" | "incompatible";

/** Brecha analítica cuantitativa o cualitativa */
export interface MatchingGap {
  criterio: CriterioMatching;
  tipo: MatchingGapTipo;
  mensaje: string;
  delta?: {
    esperado: number | string;
    actual: number | string;
    diferenciaPct?: number;
  };
}

/** Desglose detallado de puntuación obtenida */
export interface MatchingScoreBreakdown {
  scoreTotal: number; // 0 - 100
  ticketScore: number;
  zonaScore: number;
  zonifScore: number;
  alturaScore: number;
  frenteAreaScore: number;
  bonusCpuVigente: number; // +5 pts si tiene CPU vigente
  cumplimiento: {
    ticket: boolean;
    zona: boolean;
    zonificacion: boolean;
    altura: boolean;
    frenteArea: boolean;
    cpuVigente: boolean;
  };
}

export type NivelCompatibilidad = "Prime" | "Alto" | "Medio" | "Bajo" | "Descartado";

/** Resultado completo de evaluación entre un Terreno y un Comprador */
export interface MatchEvaluationResult {
  id: string; // `${terrenoId}_${clienteId}`
  terrenoId: string;
  clienteId: string;
  terreno: TerrenoCompleto;
  cliente: Cliente;
  scoreMatch: number; // 0 - 100%
  nivelCompatibilidad: NivelCompatibilidad;
  breakdown: MatchingScoreBreakdown;
  gaps: MatchingGap[];
  razones: string[];
  recomendacionComercial: string;
}

/** Modo de visualización en la pantalla central de Matching */
export type MatchingViewMode = "terreno" | "cliente" | "matriz";

/** Filtros de consulta del motor de matching */
export interface MatchingFiltros {
  busqueda?: string;
  distrito?: string[];
  zonificacion?: string[];
  tipoCliente?: string[];
  scoreMinimo?: number; // ej: 60, 70, 80
  soloDisponibles?: boolean;
}

/** Celda individual de la matriz de calor NxM */
export interface MatchingMatrixCell {
  terrenoId: string;
  clienteId: string;
  score: number;
  nivel: NivelCompatibilidad;
  gapsCount: number;
  criticosCount: number;
}

/** Datos completos de la matriz NxM */
export interface MatchingMatrixData {
  terrenos: TerrenoCompleto[];
  clientes: Cliente[];
  matriz: Record<string, Record<string, MatchingMatrixCell>>; // [terrenoId][clienteId]
  kpis: MatchingKpis;
  timestamp: number;
}

/** KPIs globales del motor de matching */
export interface MatchingKpis {
  totalTerrenosEvaluados: number;
  totalConstructorasEvaluadas: number;
  matchesPrime: number;         // Score >= 80%
  matchesViables: number;       // Score 65% - 79%
  lotesConMatchViable: number;  // Terrenos con al menos 1 comprador >= 70%
  constructorasActivasConMatch: number;
  volumenPotencialPipelineUSD: number; // Suma de precios de lotes con match >= 80%
  coberturaInventarioPct: number;      // % de lotes con match >= 70%
}
