import {
  ComisionCierre,
  NegociacionCompleta,
  TerrenoCompleto,
  Cliente,
  Usuario,
} from "@/types";

/**
 * Estados del flujo operativo y tributario de liquidación de aranceles.
 */
export type EstadoLiquidacion =
  | "Pendiente" // Cierre ganado en minuta; pendiente emisión de factura comercial
  | "Facturado" // Factura electrónica emitida con IGV 18% y SPOT
  | "Cobrado" // Fondos acreditados en cuenta Promundo y detracción BN validada
  | "Liquidado"; // Comisión transferida al broker y comprobante de retención emitido

export type TipoComprobante =
  | "Factura"
  | "Boleta_Venta"
  | "Recibo_Honorarios"
  | "Liquidacion_Compra";

export type ModalidadPagoBroker =
  | "Transferencia_Bancaria"
  | "Cheque_Gerencia"
  | "Efectivo"
  | "Compensacion";

/**
 * Desglose tributario y financiero bajo normativa peruana (SUNAT SPOT 12% + IGV 18%).
 */
export interface DesgloseTributario {
  montoVentaFinalUSD: number;
  pctComision: number;
  comisionBrutaUSD: number; // Base imponible del arancel de corretaje
  montoIgvUSD: number; // 18% si factura empresa jurídica gravada
  montoTotalFacturadoUSD: number; // Base Imponible + IGV
  aplicaDetraccion: boolean;
  pctDetraccion: number; // 12% código SUNAT 022 (servicios empresariales)
  montoDetraccionUSD: number; // Aporte a Cta. Detracciones Banco de la Nación
  montoNetoCtaCteUSD: number; // 88% depositado en Cta. Cte. comercial Promundo

  // Split Interno
  pctSplitBroker: number; // Ej. 50.00%
  pctSplitEmpresa: number; // Ej. 50.00%
  comisionBrokerBrutaUSD: number; // Split sobre la base imponible sin IGV
  comisionEmpresaBrutaUSD: number; // Margen bruto Promundo

  // Retención Broker (4ta categoría / RxH)
  tipoComprobanteBroker: TipoComprobante;
  retencionIRBrokerPct: number; // 8% si emite RxH sin suspensión de 4ta categoría
  montoRetencionIRBrokerUSD: number; // Retención tributaria SUNAT
  montoNetoPagarBrokerUSD: number; // Líquido a transferir al broker
  margenNetoPromundoUSD: number; // Comisión empresa neta
}

/**
 * Entidad completa de Liquidación de Comisión con relaciones y trazabilidad bancaria.
 */
export interface ComisionLiquidacion
  extends Omit<ComisionCierre, "createdAt" | "updatedAt" | "estadoPago"> {
  createdAt: string | Date;
  updatedAt: string | Date;

  // Código correlativo para visualización rápida (ej. LIQ-001)
  codigoLiquidacion: string;

  // Estado de la liquidación en el dominio
  estadoLiquidacion: EstadoLiquidacion;
  estadoPago: "Pendiente" | "Facturado" | "Cobrado"; // Compatibilidad Drizzle ORM

  // Datos de Facturación Promundo -> Cliente/Propietario
  tipoComprobante: TipoComprobante;
  numeroFactura?: string | null;
  fechaFactura?: string | Date | null;
  fechaVencimientoFactura?: string | Date | null;
  rucEmisor: string;
  rucReceptor: string;
  razonSocialReceptor: string;
  montoFacturadoIGV: number;

  // SPOT Detracción SUNAT
  pctDetraccion: number;
  numeroConstanciaDetraccion?: string | null;
  fechaDetraccion?: string | Date | null;
  montoDetraccionUSD: number;
  montoDetraccionPEN: number; // Expresado en Soles al TC oficial

  // Cobranza Promundo
  fechaCobro?: string | Date | null;
  bancoEmpresa?: string | null;
  nroOperacionCobro?: string | null;
  montoCobradoNetoUSD: number;

  // Split y Liquidación Broker
  pctSplitBroker: number;
  pctSplitEmpresa: number;
  tipoComprobanteBroker?: TipoComprobante | null;
  numeroComprobanteBroker?: string | null;
  cuentaConSuspension1609?: boolean; // Suspensión de 4ta categoría (Form. 1609 SUNAT)
  retencionIRBrokerPct: number; // 8% o 0% si tiene suspensión
  montoRetencionIRBrokerUSD: number;
  montoNetoBrokerUSD: number;
  modalidadPagoBroker?: ModalidadPagoBroker | null;
  bancoBroker?: string | null;
  nroOperacionPagoBroker?: string | null;
  fechaPagoBroker?: string | Date | null;

  // Notas y observaciones de tesorería
  observaciones?: string | null;

  // Relaciones completas
  negociacion: NegociacionCompleta;
  terreno: TerrenoCompleto;
  cliente: Cliente;
  broker: Usuario;
}

/**
 * Filtros acumulativos para el módulo de comisiones.
 */
export interface ComisionFiltros {
  busqueda?: string;
  estado?: EstadoLiquidacion[];
  brokerId?: string[];
  clienteId?: string[];
  distrito?: string[];
  fechaDesde?: string | Date;
  fechaHasta?: string | Date;
  montoMin?: number;
  montoMax?: number;
}

/**
 * Métricas financieras y KPIs de tesorería estilo Bloomberg.
 */
export interface ComisionesKpis {
  volumenTotalVentasUSD: number;
  totalComisionesPactadasUSD: number;
  totalCobradoEnBancoUSD: number;
  totalFacturadoPorCobrarUSD: number;
  totalPendienteFacturacionUSD: number;
  totalLiquidadoBrokersUSD: number;
  totalPendienteLiquidacionBrokersUSD: number;
  margenNetoRetenidoPromundoUSD: number;
  totalCierres: number;
  porEstado: Record<
    EstadoLiquidacion,
    { count: number; totalComisionUSD: number }
  >;
}

/**
 * Inputs para mutaciones y transiciones de estado.
 */
export interface UpdateLiquidacionInput {
  id: string;
  nuevoEstado: EstadoLiquidacion;
  numeroFactura?: string;
  fechaFactura?: string | Date;
  fechaVencimientoFactura?: string | Date;
  numeroConstanciaDetraccion?: string;
  fechaDetraccion?: string | Date;
  bancoEmpresa?: string;
  nroOperacionCobro?: string;
  fechaCobro?: string | Date;
  tipoComprobanteBroker?: TipoComprobante;
  numeroComprobanteBroker?: string;
  cuentaConSuspension1609?: boolean;
  retencionIRBrokerPct?: number;
  modalidadPagoBroker?: ModalidadPagoBroker;
  bancoBroker?: string;
  nroOperacionPagoBroker?: string;
  fechaPagoBroker?: string | Date;
  observaciones?: string;
}
