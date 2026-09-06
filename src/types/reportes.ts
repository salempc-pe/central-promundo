import { EtapaNegociacion } from "./negociaciones";

/**
 * Períodos predefinidos de análisis financiero y operativo.
 */
export type RangoPeriodoReporte =
  | "YTD" // Year to Date (Año en curso 2026)
  | "12M" // Últimos 12 meses móviles
  | "Q1" // Primer trimestre (Ene - Mar)
  | "Q2" // Segundo trimestre (Abr - Jun)
  | "Q3" // Tercer trimestre (Jul - Sep)
  | "Q4" // Cuarto trimestre (Oct - Dic)
  | "Historico"; // Todo el historial consolidado

/**
 * Filtros analíticos acumulativos para el motor de BI.
 */
export interface FiltroReportes {
  rangoPeriodo: RangoPeriodoReporte;
  brokerId?: string;
  distrito?: string[];
  zonificacion?: string[];
  fechaInicio?: string | Date;
  fechaFin?: string | Date;
}

/**
 * KPIs macro del negocio y rendimiento financiero (Banner de Dirección).
 */
export interface ReportesKpisGenerales {
  // Transaccional & Volumen
  volumenTotalTransaccionadoUSD: number; // Suma de ventas cerradas
  totalArancelesComisionUSD: number; // Arancel bruto total (3%)
  ticketPromedioTransaccionUSD: number; // Volumen cerrado / Nro de cierres
  diasPromedioCicloCierre: number; // Promedio días desde creación hasta cierre
  totalCierresConfirmados: number; // Cantidad de ventas cerradas

  // Pipeline Comercial & Conversión
  volumenPipelineActivoUSD: number; // Volumen nominal activo en negociación
  volumenPipelinePonderadoUSD: number; // Volumen ponderado por probabilidad de éxito
  tasaConversionPipelinePct: number; // % Cierres ganados / Total deals terminados (Ganados + Descartados)
  dealsActivosCount: number; // Cantidad de oportunidades vivas
  dealsEstancadosCount: number; // Oportunidades > 14 días en etapa actual

  // Absorción de Inventario de Suelo
  totalTerrenosInventario: number; // Terrenos totales evaluados
  totalTerrenosVendidos: number; // Lotes con venta cerrada
  tasaAbsorcionInventarioPct: number; // % Lotes vendidos sobre inventario
  areaTotalTransaccionadaM2: number; // Metros cuadrados de suelo colocados
  precioPromedioM2CerradoUSD: number; // Precio medio de cierre por m2

  // Tesorería & Margen Corporativo
  margenNetoPromundoUSD: number; // Margen corporativo de Promundo (Split 50%)
  honorariosLiquidadosBrokersUSD: number; // Honorarios efectivamente transferidos a brokers
  arancelEfectivoPromedioPct: number; // Promedio arancel comercial pactado (3.00%)
}

/**
 * Agregación cronológica mensual o trimestral para la curva de evolución.
 */
export interface EvolucionPeriodo {
  periodoId: string; // ej: "2026-05"
  label: string; // ej: "May 2026"
  mesNumero: number; // 1 - 12
  anio: number; // 2026
  volumenVentasUSD: number; // Volumen en USD vendido en el periodo
  arancelesUSD: number; // Honorarios brutos 3% generados
  margenPromundoUSD: number; // Margen neto empresa (50%)
  dealsCerrados: number; // Nro de cierres firmados
  dealsIniciados: number; // Nuevas oportunidades ingresadas
  areaM2Transaccionada: number; // Metros cuadrados colocados
}

/**
 * Indicadores individuales de desempeño por broker (League Table / Ranking).
 */
export interface RankingBrokerItem {
  brokerId: string;
  brokerNombre: string;
  brokerEmail: string;
  brokerRol: string;
  dealsAsignados: number; // Total de deals gestionados
  dealsActivos: number; // Deals actualmente en curso
  cierresGanados: number; // Cierres comerciales completados
  tasaConversionPct: number; // Cierres ganados / (Ganados + Descartados)
  volumenTransaccionadoUSD: number; // Volumen total colocado en USD
  comisionesGeneradasUSD: number; // Arancel bruto generado para la firma
  honorariosNetosBrokerUSD: number; // Líquido percibido por el broker (después de split y retención)
  ticketPromedioUSD: number; // Volumen / Cierres ganados
  diasPromedioCierre: number; // Días promedio para cerrar una venta
  cuotaObjetivoUSD: number; // Meta asignada de colocación
  cumplimientoCuotaPct: number; // % de cumplimiento de meta
}

/**
 * Matriz de absorción territorial por distrito y zonificación.
 */
export interface AbsorcionDistritoItem {
  distrito: string;
  totalLotes: number;
  lotesVendidos: number;
  lotesEnNegociacion: number;
  lotesDisponibles: number;
  tasaAbsorcionPct: number; // (Vendidos / Total) * 100
  areaTotalM2: number;
  areaVendidaM2: number;
  precioM2PromedioUSD: number; // Promedio ponderado de $/m2 ofertado o transaccionado
  volumenTotalTransaccionadoUSD: number; // Suma transaccionada en el distrito
  zonificacionesPrincipales: Array<{ zonificacion: string; cantidad: number }>;
}

/**
 * Desglose por etapa para el embudo de conversión.
 */
export interface EmbudoEtapaItem {
  etapa: EtapaNegociacion;
  label: string;
  shortLabel: string;
  orden: number;
  cantidadDeals: number;
  volumenUSD: number;
  volumenPonderadoUSD: number;
  diasPromedioEnEtapa: number;
  porcentajeDelTotal: number; // % de deals que ingresaron a esta etapa
  tasaConversionDesdeAnteriorPct: number; // % que avanzó desde la etapa inmediata previa
  tasaAbandonoPct: number; // % que no avanza o se estanca/descarta
  colorHex: string;
  colorBgClass: string;
  colorBorderClass: string;
}

/**
 * Expediente de reporte ejecutivo formal consolidado e imprimible.
 */
export interface ReporteEjecutivo {
  id: string;
  fechaGeneracion: string; // ISO String
  periodoAnalizado: string; // "Año 2026 - YTD", "Q2 2026", etc.
  filtros: FiltroReportes;
  kpis: ReportesKpisGenerales;
  evolucion: EvolucionPeriodo[];
  rankingBrokers: RankingBrokerItem[];
  absorcionMercado: AbsorcionDistritoItem[];
  embudo: EmbudoEtapaItem[];
  resumenEjecutivo: {
    diagnosticoGeneral: string;
    puntosClave: string[];
    oportunidadesDeMercado: string[];
    alertasRiesgoOperativo: string[];
  };
}
