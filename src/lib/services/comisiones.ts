import {
  ComisionLiquidacion,
  ComisionFiltros,
  ComisionesKpis,
  EstadoLiquidacion,
  UpdateLiquidacionInput,
  DesgloseTributario,
  TipoComprobante,
} from "@/types/comisiones";
import { mockComisionesLiquidaciones } from "@/lib/mock/comisiones-seed";

// Store reactivo en memoria para simulación cliente/servidor
let memoryComisiones: ComisionLiquidacion[] = [
  ...mockComisionesLiquidaciones,
];

// Observadores para reactividad en tiempo real
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Error en notificador de comisiones:", e);
    }
  });
}

/**
 * Suscripción al store reactivo de liquidaciones.
 */
export function subscribeComisiones(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

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
 * Consulta y filtrado multi-criterio de liquidaciones.
 */
export async function getComisionesLiquidaciones(
  filtros?: ComisionFiltros
): Promise<ComisionLiquidacion[]> {
  let resultados = [...memoryComisiones];

  if (!filtros) return resultados;

  if (filtros.busqueda && filtros.busqueda.trim() !== "") {
    const q = filtros.busqueda.toLowerCase().trim();
    const normQ = q.replace("terr-", "tr-");
    resultados = resultados.filter((item) => {
      return (
        item.codigoLiquidacion.toLowerCase().includes(q) ||
        (item.numeroFactura && item.numeroFactura.toLowerCase().includes(q)) ||
        item.terreno.id.toLowerCase().includes(q) ||
        item.terreno.id.toLowerCase().includes(normQ) ||
        item.terreno.codigoInterno.toLowerCase().includes(q) ||
        item.terreno.distrito.toLowerCase().includes(q) ||
        item.terreno.direccion.toLowerCase().includes(q) ||
        item.cliente.razonSocial.toLowerCase().includes(q) ||
        item.broker.nombre.toLowerCase().includes(q)
      );
    });
  }

  if (filtros.estado && filtros.estado.length > 0) {
    resultados = resultados.filter((item) =>
      filtros.estado!.includes(item.estadoLiquidacion)
    );
  }

  if (filtros.brokerId && filtros.brokerId.length > 0) {
    resultados = resultados.filter((item) =>
      filtros.brokerId!.includes(item.broker.id)
    );
  }

  if (filtros.clienteId && filtros.clienteId.length > 0) {
    resultados = resultados.filter((item) =>
      filtros.clienteId!.includes(item.cliente.id)
    );
  }

  if (filtros.distrito && filtros.distrito.length > 0) {
    resultados = resultados.filter((item) =>
      filtros.distrito!.includes(item.terreno.distrito)
    );
  }

  if (filtros.montoMin !== undefined) {
    resultados = resultados.filter(
      (item) => parseFloat(item.montoComisionTotal as string) >= filtros.montoMin!
    );
  }

  if (filtros.montoMax !== undefined) {
    resultados = resultados.filter(
      (item) => parseFloat(item.montoComisionTotal as string) <= filtros.montoMax!
    );
  }

  return resultados;
}

/**
 * Obtener un expediente de liquidación por su ID o código correlativo.
 */
export async function getComisionLiquidacionById(
  id: string
): Promise<ComisionLiquidacion | null> {
  const item = memoryComisiones.find(
    (c) => c.id === id || c.codigoLiquidacion === id
  );
  return item || null;
}

/**
 * Cálculo de KPIs financieros estilo Bloomberg Terminal.
 */
export async function getComisionesKpis(
  filtros?: ComisionFiltros
): Promise<ComisionesKpis> {
  const dataset = await getComisionesLiquidaciones(filtros);

  let volumenTotalVentasUSD = 0;
  let totalComisionesPactadasUSD = 0;
  let totalCobradoEnBancoUSD = 0;
  let totalFacturadoPorCobrarUSD = 0;
  let totalPendienteFacturacionUSD = 0;
  let totalLiquidadoBrokersUSD = 0;
  let totalPendienteLiquidacionBrokersUSD = 0;
  let margenNetoRetenidoPromundoUSD = 0;

  const porEstado: Record<
    EstadoLiquidacion,
    { count: number; totalComisionUSD: number }
  > = {
    Pendiente: { count: 0, totalComisionUSD: 0 },
    Facturado: { count: 0, totalComisionUSD: 0 },
    Cobrado: { count: 0, totalComisionUSD: 0 },
    Liquidado: { count: 0, totalComisionUSD: 0 },
  };

  dataset.forEach((item) => {
    const venta = parseFloat(item.montoVentaFinal as string) || 0;
    const comision = parseFloat(item.montoComisionTotal as string) || 0;
    const comisionEmpresa = parseFloat(item.comisionEmpresa as string) || 0;
    const comisionBroker = parseFloat(item.comisionBroker as string) || 0;

    volumenTotalVentasUSD += venta;
    totalComisionesPactadasUSD += comision;

    // Conteo y agregación por estado
    if (porEstado[item.estadoLiquidacion]) {
      porEstado[item.estadoLiquidacion].count += 1;
      porEstado[item.estadoLiquidacion].totalComisionUSD += comision;
    }

    // Análisis de tesorería según estado
    if (item.estadoLiquidacion === "Pendiente") {
      totalPendienteFacturacionUSD += comision;
    } else if (item.estadoLiquidacion === "Facturado") {
      totalFacturadoPorCobrarUSD += item.montoCobradoNetoUSD || comision;
    } else if (item.estadoLiquidacion === "Cobrado") {
      totalCobradoEnBancoUSD += item.montoCobradoNetoUSD || comision;
      totalPendienteLiquidacionBrokersUSD += item.montoNetoBrokerUSD || comisionBroker;
      margenNetoRetenidoPromundoUSD += comisionEmpresa;
    } else if (item.estadoLiquidacion === "Liquidado") {
      totalCobradoEnBancoUSD += item.montoCobradoNetoUSD || comision;
      totalLiquidadoBrokersUSD += item.montoNetoBrokerUSD || comisionBroker;
      margenNetoRetenidoPromundoUSD += comisionEmpresa;
    }
  });

  return {
    volumenTotalVentasUSD: round2(volumenTotalVentasUSD),
    totalComisionesPactadasUSD: round2(totalComisionesPactadasUSD),
    totalCobradoEnBancoUSD: round2(totalCobradoEnBancoUSD),
    totalFacturadoPorCobrarUSD: round2(totalFacturadoPorCobrarUSD),
    totalPendienteFacturacionUSD: round2(totalPendienteFacturacionUSD),
    totalLiquidadoBrokersUSD: round2(totalLiquidadoBrokersUSD),
    totalPendienteLiquidacionBrokersUSD: round2(totalPendienteLiquidacionBrokersUSD),
    margenNetoRetenidoPromundoUSD: round2(margenNetoRetenidoPromundoUSD),
    totalCierres: dataset.length,
    porEstado: {
      Pendiente: {
        count: porEstado.Pendiente.count,
        totalComisionUSD: round2(porEstado.Pendiente.totalComisionUSD),
      },
      Facturado: {
        count: porEstado.Facturado.count,
        totalComisionUSD: round2(porEstado.Facturado.totalComisionUSD),
      },
      Cobrado: {
        count: porEstado.Cobrado.count,
        totalComisionUSD: round2(porEstado.Cobrado.totalComisionUSD),
      },
      Liquidado: {
        count: porEstado.Liquidado.count,
        totalComisionUSD: round2(porEstado.Liquidado.totalComisionUSD),
      },
    },
  };
}

/**
 * Transición y actualización de expediente de liquidación.
 */
export async function cambiarEstadoLiquidacion(
  input: UpdateLiquidacionInput
): Promise<ComisionLiquidacion> {
  const index = memoryComisiones.findIndex((c) => c.id === input.id);
  if (index === -1) {
    throw new Error(`Expediente de liquidación ${input.id} no encontrado.`);
  }

  const actual = memoryComisiones[index];
  const fechaActual = new Date().toISOString();

  // Mapeo a columna Drizzle 'estadoPago'
  let nuevoEstadoPago: "Pendiente" | "Facturado" | "Cobrado" = "Pendiente";
  if (input.nuevoEstado === "Facturado") {
    nuevoEstadoPago = "Facturado";
  } else if (
    input.nuevoEstado === "Cobrado" ||
    input.nuevoEstado === "Liquidado"
  ) {
    nuevoEstadoPago = "Cobrado";
  }

  const updated: ComisionLiquidacion = {
    ...actual,
    estadoLiquidacion: input.nuevoEstado,
    estadoPago: nuevoEstadoPago,
    updatedAt: fechaActual,

    // Facturación
    numeroFactura:
      input.numeroFactura !== undefined
        ? input.numeroFactura
        : actual.numeroFactura,
    fechaFactura:
      input.fechaFactura !== undefined
        ? input.fechaFactura
        : actual.fechaFactura,
    fechaVencimientoFactura:
      input.fechaVencimientoFactura !== undefined
        ? input.fechaVencimientoFactura
        : actual.fechaVencimientoFactura,

    // Detracción SPOT
    numeroConstanciaDetraccion:
      input.numeroConstanciaDetraccion !== undefined
        ? input.numeroConstanciaDetraccion
        : actual.numeroConstanciaDetraccion,
    fechaDetraccion:
      input.fechaDetraccion !== undefined
        ? input.fechaDetraccion
        : actual.fechaDetraccion,

    // Cobranza comercial Promundo
    bancoEmpresa:
      input.bancoEmpresa !== undefined
        ? input.bancoEmpresa
        : actual.bancoEmpresa,
    nroOperacionCobro:
      input.nroOperacionCobro !== undefined
        ? input.nroOperacionCobro
        : actual.nroOperacionCobro,
    fechaCobro:
      input.fechaCobro !== undefined ? input.fechaCobro : actual.fechaCobro,

    // Liquidación al broker
    tipoComprobanteBroker:
      input.tipoComprobanteBroker !== undefined
        ? input.tipoComprobanteBroker
        : actual.tipoComprobanteBroker,
    numeroComprobanteBroker:
      input.numeroComprobanteBroker !== undefined
        ? input.numeroComprobanteBroker
        : actual.numeroComprobanteBroker,
    cuentaConSuspension1609:
      input.cuentaConSuspension1609 !== undefined
        ? input.cuentaConSuspension1609
        : actual.cuentaConSuspension1609,
    retencionIRBrokerPct:
      input.retencionIRBrokerPct !== undefined
        ? input.retencionIRBrokerPct
        : actual.retencionIRBrokerPct,
    modalidadPagoBroker:
      input.modalidadPagoBroker !== undefined
        ? input.modalidadPagoBroker
        : actual.modalidadPagoBroker,
    bancoBroker:
      input.bancoBroker !== undefined ? input.bancoBroker : actual.bancoBroker,
    nroOperacionPagoBroker:
      input.nroOperacionPagoBroker !== undefined
        ? input.nroOperacionPagoBroker
        : actual.nroOperacionPagoBroker,
    fechaPagoBroker:
      input.fechaPagoBroker !== undefined
        ? input.fechaPagoBroker
        : actual.fechaPagoBroker,

    observaciones:
      input.observaciones !== undefined
        ? input.observaciones
        : actual.observaciones,
  };

  // Recalcular montos netos si cambiaron las condiciones del broker
  const comisionBrokerBruta = parseFloat(updated.comisionBroker as string) || 0;
  const retencionPct = updated.cuentaConSuspension1609
    ? 0
    : updated.retencionIRBrokerPct;
  const retencionMonto = round2(comisionBrokerBruta * (retencionPct / 100));
  updated.montoRetencionIRBrokerUSD = retencionMonto;
  updated.montoNetoBrokerUSD = round2(comisionBrokerBruta - retencionMonto);

  memoryComisiones[index] = updated;
  notifyListeners();
  return updated;
}

/**
 * Consulta de liquidaciones asignadas a un broker específico.
 */
export async function getLiquidacionesByBroker(
  brokerId: string
): Promise<ComisionLiquidacion[]> {
  return memoryComisiones.filter((c) => c.broker.id === brokerId);
}
