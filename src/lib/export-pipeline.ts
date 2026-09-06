import { NegociacionCompleta, NegociacionFiltros, ETAPAS_CONFIG } from "@/types";

/**
 * Genera y descarga un archivo CSV estructurado (compatible con Microsoft Excel en español)
 * con el estado detallado del Pipeline de Negociaciones y balance de comisiones al 3%.
 */
export function exportarPipelineAExcel(
  negociaciones: NegociacionCompleta[],
  filtrosAplicados?: NegociacionFiltros
) {
  const headers = [
    "ID NEGOCIACIÓN",
    "CÓDIGO TERRENO",
    "DISTRITO",
    "DIRECCIÓN",
    "ZONIFICACIÓN",
    "ÁREA (M²)",
    "CONSTRUCTORA / CLIENTE",
    "TIPO CLIENTE",
    "CONTACTO CLIENTE",
    "BROKER RESPONSABLE",
    "ETAPA COMERCIAL",
    "DÍAS EN ETAPA",
    "ALERTA SLA",
    "MONTO OFERTA (USD)",
    "PROBABILIDAD (%)",
    "VALOR PONDERADO (USD)",
    "COMISIÓN PROMUNDO 3% (USD)",
    "FECHA INICIO",
    "ÚLTIMA ACTIVIDAD",
    "ÚLTIMA NOTA BITÁCORA",
  ];

  const rows = negociaciones.map((n) => {
    const config = ETAPAS_CONFIG[n.etapa as keyof typeof ETAPAS_CONFIG];
    const montoNum = Number(n.montoOferta || 0);
    const probNum = n.probabilidadCierre || 0;
    const ponderado = montoNum * (probNum / 100);
    const comision = montoNum * 0.03;

    let alertaSla = "NORMAL (0-7d)";
    if (n.diasEnEtapaActual > 14) alertaSla = "ESTANCADO (>14d)";
    else if (n.diasEnEtapaActual > 7) alertaSla = "ATENCIÓN (8-14d)";

    const ultimaNota = n.bitacora[0]?.descripcion || "Sin notas registradas";

    return [
      n.id,
      n.terreno.codigoInterno,
      n.terreno.distrito,
      `"${n.terreno.direccion.replace(/"/g, '""')}"`,
      n.terreno.zonificacion,
      Number(n.terreno.areaM2).toFixed(2),
      `"${n.cliente.razonSocial.replace(/"/g, '""')}"`,
      n.cliente.tipoCliente,
      `"${(n.cliente.contactoNombre || "N/A").replace(/"/g, '""')}"`,
      `"${n.broker.nombre.replace(/"/g, '""')}"`,
      `"${config ? config.label : n.etapa}"`,
      n.diasEnEtapaActual,
      alertaSla,
      montoNum.toFixed(2),
      `${probNum}%`,
      ponderado.toFixed(2),
      comision.toFixed(2),
      new Date(n.createdAt).toLocaleDateString("es-PE"),
      new Date(n.updatedAt).toLocaleDateString("es-PE"),
      `"${ultimaNota.replace(/"/g, '""')}"`,
    ];
  });

  // Totales
  const totalActivos = negociaciones.filter(
    (n) => n.etapa !== "Cierre_Ganado" && n.etapa !== "Descartado"
  );
  const sumNominal = totalActivos.reduce((sum, n) => sum + Number(n.montoOferta || 0), 0);
  const sumPonderado = totalActivos.reduce(
    (sum, n) => sum + Number(n.montoOferta || 0) * ((n.probabilidadCierre || 0) / 100),
    0
  );
  const sumComisiones = sumNominal * 0.03;

  const summaryRows = [
    [],
    ["--- RESUMEN FINANCIERO DEL PIPELINE ---"],
    ["TOTAL NEGOCIACIONES EXPORTADAS", negociaciones.length],
    ["DEALS ACTIVOS EN PROCESO", totalActivos.length],
    ["VOLUMEN TOTAL NOMINAL (USD)", sumNominal.toFixed(2)],
    ["VOLUMEN TOTAL PONDERADO (USD)", sumPonderado.toFixed(2)],
    ["COMISIÓN PROYECTADA AL 3% (USD)", sumComisiones.toFixed(2)],
    ["FECHA DE EMISIÓN DEL REPORTE", new Date().toLocaleString("es-PE")],
  ];

  const csvContent =
    "\uFEFF" + // BOM para que Excel en Windows/Mac reconozca caracteres latinos
    [
      headers.join(";"),
      ...rows.map((r) => r.join(";")),
      ...summaryRows.map((r) => r.join(";")),
    ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  link.setAttribute("href", url);
  link.setAttribute("download", `Promundo_Pipeline_Negociaciones_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
