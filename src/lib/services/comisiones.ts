import {
  ComisionLiquidacion,
  ComisionFiltros,
  ComisionesKpis,
  EstadoLiquidacion,
  UpdateLiquidacionInput,
  DesgloseTributario,
  TipoComprobante,
} from "@/types/comisiones";
import {
  getComisionesAction,
  getComisionesKpisAction,
  updateEstadoComisionAction,
} from "@/lib/actions/comisiones-actions";

export * from "@/lib/actions/comisiones-actions";

/**
 * Aritmética financiera segura a 2 decimales para evitar desbordes IEEE-754.
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Motor de cálculo tributario y comercial bajo normativa peruana (SUNAT SPOT 12% + IGV 18%).
 */
export function calcularDesgloseFinanciero(
  montoVentaFinalUSD: number,
  pctComision: number = 3.0,
  pctSplitBroker: number = 50.0,
  tipoComprobanteBroker: TipoComprobante = "Recibo_Honorarios",
  cuentaConSuspension1609: boolean = false,
  pctDetraccion: number = 12.0
): DesgloseTributario {
  const comisionBrutaUSD = round2(montoVentaFinalUSD * (pctComision / 100));
  const montoIgvUSD = round2(comisionBrutaUSD * 0.18);
  const montoTotalFacturadoUSD = round2(comisionBrutaUSD + montoIgvUSD);

  // SPOT Detracción sobre el total facturado con IGV
  const montoDetraccionUSD = round2(
    montoTotalFacturadoUSD * (pctDetraccion / 100)
  );
  const montoNetoCtaCteUSD = round2(montoTotalFacturadoUSD - montoDetraccionUSD);

  // Splits calculados sobre la base imponible sin IGV
  const pctSplitEmpresa = round2(100 - pctSplitBroker);
  const comisionBrokerBrutaUSD = round2(
    comisionBrutaUSD * (pctSplitBroker / 100)
  );
  const comisionEmpresaBrutaUSD = round2(
    comisionBrutaUSD * (pctSplitEmpresa / 100)
  );

  // Retención IR 4ta Categoría (8%) si emite RxH y no tiene Form. 1609
  const aplicaRetencion =
    tipoComprobanteBroker === "Recibo_Honorarios" && !cuentaConSuspension1609;
  const retencionIRBrokerPct = aplicaRetencion ? 8.0 : 0.0;
  const montoRetencionIRBrokerUSD = aplicaRetencion
    ? round2(comisionBrokerBrutaUSD * (retencionIRBrokerPct / 100))
    : 0;
  const montoNetoPagarBrokerUSD = round2(
    comisionBrokerBrutaUSD - montoRetencionIRBrokerUSD
  );

  return {
    montoVentaFinalUSD,
    pctComision,
    comisionBrutaUSD,
    montoIgvUSD,
    montoTotalFacturadoUSD,
    aplicaDetraccion: true,
    pctDetraccion,
    montoDetraccionUSD,
    montoNetoCtaCteUSD,
    pctSplitBroker,
    pctSplitEmpresa,
    comisionBrokerBrutaUSD,
    comisionEmpresaBrutaUSD,
    tipoComprobanteBroker,
    retencionIRBrokerPct,
    montoRetencionIRBrokerUSD,
    montoNetoPagarBrokerUSD,
    margenNetoPromundoUSD: comisionEmpresaBrutaUSD,
  };
}

/**
 * Consulta y filtrado multi-criterio de liquidaciones conectado a PostgreSQL.
 */
export async function getComisionesLiquidaciones(
  filtros?: ComisionFiltros
): Promise<ComisionLiquidacion[]> {
  return getComisionesAction(filtros);
}

/**
 * Obtener un expediente de liquidación por su ID o código correlativo.
 */
export async function getComisionLiquidacionById(
  id: string
): Promise<ComisionLiquidacion | null> {
  const lista = await getComisionesAction();
  return (
    lista.find((c) => c.id === id || c.codigoLiquidacion === id) || null
  );
}

/**
 * Cálculo de KPIs financieros estilo Bloomberg Terminal directamente de PostgreSQL.
 */
export async function getComisionesKpis(
  filtros?: ComisionFiltros
): Promise<ComisionesKpis> {
  return getComisionesKpisAction(filtros);
}

/**
 * Transición y actualización de expediente de liquidación en PostgreSQL.
 */
export async function cambiarEstadoLiquidacion(
  input: UpdateLiquidacionInput
): Promise<{ success: boolean; error?: string }> {
  let nuevoEstadoPago: "Pendiente" | "Facturado" | "Cobrado" = "Pendiente";
  if (input.nuevoEstado === "Facturado") {
    nuevoEstadoPago = "Facturado";
  } else if (
    input.nuevoEstado === "Cobrado" ||
    input.nuevoEstado === "Liquidado"
  ) {
    nuevoEstadoPago = "Cobrado";
  }

  return updateEstadoComisionAction(input.id, nuevoEstadoPago);
}

/**
 * Consulta de liquidaciones asignadas a un broker específico.
 */
export async function getLiquidacionesByBroker(
  brokerId: string
): Promise<ComisionLiquidacion[]> {
  const lista = await getComisionesAction();
  return lista.filter((c) => c.broker.id === brokerId);
}
