import { ComisionLiquidacion, ComisionFiltros } from "@/types/comisiones";

/**
 * Genera y descarga un archivo CSV estructurado (compatible con Microsoft Excel en español con separador ';')
 * con la sábana completa de liquidaciones, tributación peruana (IGV 18%, SPOT 12% SUNAT) y balances a brokers.
 */
export function exportarComisionesAExcel(
  liquidaciones: ComisionLiquidacion[],
  filtrosAplicados?: ComisionFiltros
) {
  const headers = [
    "CÓDIGO LIQUIDACIÓN",
    "ESTADO LIQUIDACIÓN",
    "CÓDIGO TERRENO",
    "DISTRITO",
    "DIRECCIÓN TERRENO",
    "ZONIFICACIÓN",
    "ÁREA M²",
    "CONSTRUCTORA / CLIENTE",
    "RUC CLIENTE",
    "BROKER RESPONSABLE",
    "MONTO VENTA FINAL (USD)",
    "ARANCEL (%)",
    "COMISIÓN BRUTA (USD)",
    "N° FACTURA COMERCIAL",
    "FECHA FACTURA",
    "FECHA VENCIMIENTO",
    "TOTAL FACTURADO CON IGV 18% (USD)",
    "DETRACCIÓN SPOT 12% (USD)",
    "DETRACCIÓN SPOT (SOLES PEN)",
    "N° CONSTANCIA BANCO NACIÓN",
    "NETO EN CUENTA CORRIENTE (USD)",
    "BANCO COBRO PROMUNDO",
    "N° OPERACIÓN COBRO",
    "FECHA COBRO BANCO",
    "SPLIT EMPRESA (%)",
    "MARGEN BRUTO PROMUNDO (USD)",
    "SPLIT BROKER (%)",
    "COMISIÓN BRUTA BROKER (USD)",
    "TIPO COMPROBANTE BROKER",
    "N° COMPROBANTE BROKER",
    "SUSPENSIÓN 4TA CAT (FORM. 1609)",
    "RETENCIÓN IR 4TA CAT (8%) (USD)",
    "NETO TRANSFERIDO BROKER (USD)",
    "BANCO BROKER",
    "N° OPERACIÓN PAGO BROKER",
    "FECHA PAGO BROKER",
    "OBSERVACIONES AUDITORÍA",
  ];

  const rows = liquidaciones.map((l) => {
    const venta = Number(l.montoVentaFinal || 0);
    const comisionBruta = Number(l.montoComisionTotal || 0);
    const margenEmpresa = Number(l.comisionEmpresa || 0);
    const comisionBroker = Number(l.comisionBroker || 0);

    return [
      l.codigoLiquidacion,
      `"${l.estadoLiquidacion}"`,
      l.terreno.codigoInterno,
      l.terreno.distrito,
      `"${l.terreno.direccion.replace(/"/g, '""')}"`,
      l.terreno.zonificacion,
      Number(l.terreno.areaM2).toFixed(2),
      `"${l.cliente.razonSocial.replace(/"/g, '""')}"`,
      l.rucReceptor,
      `"${l.broker.nombre.replace(/"/g, '""')}"`,
      venta.toFixed(2),
      `${l.pctComision}%`,
      comisionBruta.toFixed(2),
      l.numeroFactura ? `"${l.numeroFactura}"` : "NO EMITIDA",
      l.fechaFactura
        ? new Date(l.fechaFactura).toLocaleDateString("es-PE")
        : "-",
      l.fechaVencimientoFactura
        ? new Date(l.fechaVencimientoFactura).toLocaleDateString("es-PE")
        : "-",
      l.montoFacturadoIGV.toFixed(2),
      l.montoDetraccionUSD.toFixed(2),
      l.montoDetraccionPEN.toFixed(2),
      l.numeroConstanciaDetraccion
        ? `"${l.numeroConstanciaDetraccion}"`
        : "PENDIENTE",
      l.montoCobradoNetoUSD.toFixed(2),
      l.bancoEmpresa ? `"${l.bancoEmpresa}"` : "-",
      l.nroOperacionCobro ? `"${l.nroOperacionCobro}"` : "-",
      l.fechaCobro
        ? new Date(l.fechaCobro).toLocaleDateString("es-PE")
        : "-",
      `${l.pctSplitEmpresa}%`,
      margenEmpresa.toFixed(2),
      `${l.pctSplitBroker}%`,
      comisionBroker.toFixed(2),
      l.tipoComprobanteBroker || "NO REGISTRADO",
      l.numeroComprobanteBroker ? `"${l.numeroComprobanteBroker}"` : "-",
      l.cuentaConSuspension1609 ? "SÍ (RET. 0%)" : "NO (RET. 8%)",
      l.montoRetencionIRBrokerUSD.toFixed(2),
      l.montoNetoBrokerUSD.toFixed(2),
      l.bancoBroker ? `"${l.bancoBroker}"` : "-",
      l.nroOperacionPagoBroker ? `"${l.nroOperacionPagoBroker}"` : "-",
      l.fechaPagoBroker
        ? new Date(l.fechaPagoBroker).toLocaleDateString("es-PE")
        : "-",
      `"${(l.observaciones || "Sin observaciones").replace(/"/g, '""')}"`,
    ];
  });

  // Cálculo de balances consolidados para el bloque inferior
  const sumVenta = liquidaciones.reduce(
    (sum, l) => sum + Number(l.montoVentaFinal || 0),
    0
  );
  const sumComisionTotal = liquidaciones.reduce(
    (sum, l) => sum + Number(l.montoComisionTotal || 0),
    0
  );
  const sumFacturadoConIGV = liquidaciones.reduce(
    (sum, l) => sum + Number(l.montoFacturadoIGV || 0),
    0
  );
  const sumDetraccionSPOT = liquidaciones.reduce(
    (sum, l) => sum + Number(l.montoDetraccionUSD || 0),
    0
  );
  const sumCobradoNeto = liquidaciones
    .filter((l) => l.estadoLiquidacion === "Cobrado" || l.estadoLiquidacion === "Liquidado")
    .reduce((sum, l) => sum + Number(l.montoCobradoNetoUSD || 0), 0);
  const sumFacturadoPorCobrar = liquidaciones
    .filter((l) => l.estadoLiquidacion === "Facturado")
    .reduce((sum, l) => sum + Number(l.montoCobradoNetoUSD || 0), 0);
  const sumMargenEmpresa = liquidaciones.reduce(
    (sum, l) => sum + Number(l.comisionEmpresa || 0),
    0
  );
  const sumLiquidadoBrokers = liquidaciones
    .filter((l) => l.estadoLiquidacion === "Liquidado")
    .reduce((sum, l) => sum + Number(l.montoNetoBrokerUSD || 0), 0);

  const summaryRows = [
    [],
    ["=== BALANCE CONSOLIDADO DE CORRETAJE & TESORERÍA (PROMUNDO S.A.C.) ==="],
    ["TOTAL EXPEDIENTES EXPORTADOS", liquidaciones.length],
    ["VOLUMEN TOTAL TRANSACCIONADO EN SUELO (USD)", sumVenta.toFixed(2)],
    ["TOTAL ARANCELES BRUTOS DE INTERMEDIACIÓN (USD)", sumComisionTotal.toFixed(2)],
    ["TOTAL FACTURADO CON IGV 18% (USD)", sumFacturadoConIGV.toFixed(2)],
    ["TOTAL APORTE DETRACCIÓN SPOT BANCO DE LA NACIÓN (USD)", sumDetraccionSPOT.toFixed(2)],
    ["TOTAL FONDOS EFECTIVAMENTE COBRADOS EN BANCO (USD)", sumCobradoNeto.toFixed(2)],
    ["CUENTAS POR COBRAR COMERCIALES (FACTURADO) (USD)", sumFacturadoPorCobrar.toFixed(2)],
    ["MARGEN BRUTO CORPORATIVO PROMUNDO (USD)", sumMargenEmpresa.toFixed(2)],
    ["TOTAL ARANCELES EFECTIVAMENTE LIQUIDADOS A BROKERS (USD)", sumLiquidadoBrokers.toFixed(2)],
    ["TIPO DE CAMBIO SUNAT SPOT REFERENCIAL", "3.750 PEN / USD"],
    ["FECHA DE GENERACIÓN DEL REPORTE", new Date().toLocaleString("es-PE")],
  ];

  const csvContent =
    "\uFEFF" + // BOM UTF-8 para Excel en Windows/Mac
    [
      headers.join(";"),
      ...rows.map((r) => r.join(";")),
      ...summaryRows.map((r) => r.join(";")),
    ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `Promundo_Liquidaciones_Comisiones_${timestamp}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
