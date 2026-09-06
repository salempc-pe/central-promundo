import { ReporteEjecutivo } from "@/types/reportes";

/**
 * Genera y descarga un archivo CSV analítico estructurado (compatible con Microsoft Excel en español con separador ';')
 * con la sábana consolidada de métricas BI, ranking de brokers, absorción de suelo y embudo comercial.
 */
export function exportarReportesAExcel(reporte: ReporteEjecutivo) {
  const { kpis, evolucion, rankingBrokers, absorcionMercado, embudo } = reporte;

  const formatUSD = (n: number) => n.toFixed(2);

  const lines: string[] = [
    "\uFEFF=== PROMUNDO LAND INTELLIGENCE - INFORME EJECUTIVO DE RENDIMIENTO & BI ===",
    `CÓDIGO DE INFORME;${reporte.id}`,
    `PERÍODO EVALUADO;${reporte.periodoAnalizado}`,
    `FECHA DE EMISIÓN;${new Date(reporte.fechaGeneracion).toLocaleString("es-PE")}`,
    "",
    "--- 1. RESUMEN MACRO & KPIS DE DIRECCIÓN ---",
    `Volumen Total Transaccionado en Suelo (USD);${formatUSD(kpis.volumenTotalTransaccionadoUSD)}`,
    `Aranceles Brutos Generados (3% Promundo) (USD);${formatUSD(kpis.totalArancelesComisionUSD)}`,
    `Margen Neto Retenido por la Agencia (50%) (USD);${formatUSD(kpis.margenNetoPromundoUSD)}`,
    `Honorarios Liquidados a Brokers (USD);${formatUSD(kpis.honorariosLiquidadosBrokersUSD)}`,
    `Ticket Promedio por Lote Transaccionado (USD);${formatUSD(kpis.ticketPromedioTransaccionUSD)}`,
    `Ciclo Promedio de Venta (Días Teaser a Minuta);${kpis.diasPromedioCicloCierre}`,
    `Total de Ventas Cerradas (Minuta / Escritura);${kpis.totalCierresConfirmados}`,
    `Tasa de Conversión Global del Pipeline (%);${kpis.tasaConversionPipelinePct}%`,
    `Volumen Activo en Pipeline Comercial (USD);${formatUSD(kpis.volumenPipelineActivoUSD)}`,
    `Volumen Ponderado por Probabilidad (USD);${formatUSD(kpis.volumenPipelinePonderadoUSD)}`,
    `Oportunidades en Negociación Viva;${kpis.dealsActivosCount}`,
    `Oportunidades Estancadas (>14 días en etapa);${kpis.dealsEstancadosCount}`,
    `Tasa de Absorción de Inventario de Suelo (%);${kpis.tasaAbsorcionInventarioPct}%`,
    `Metros Cuadrados de Suelo Colocados (m²);${formatUSD(kpis.areaTotalTransaccionadaM2)}`,
    `Precio Promedio Ponderado por m² Cerrado (USD/m²);${formatUSD(kpis.precioPromedioM2CerradoUSD)}`,
    "",
    "--- 2. EVOLUCIÓN CRONOLÓGICA MENSUAL ---",
    "PERÍODO;AÑO;VENTA TOTAL SUELO (USD);ARANCEL COMISIÓN 3% (USD);MARGEN EMPRESA (USD);CIERRES FIRMADOS;NUEVOS DEALS;ÁREA ABSORBIDA (M²)",
    ...evolucion.map(
      (e) =>
        `"${e.label}";${e.anio};${formatUSD(e.volumenVentasUSD)};${formatUSD(
          e.arancelesUSD
        )};${formatUSD(e.margenPromundoUSD)};${e.dealsCerrados};${
          e.dealsIniciados
        };${formatUSD(e.areaM2Transaccionada)}`
    ),
    "",
    "--- 3. LEAGUE TABLE / RANKING DE BROKERS ---",
    "POSICIÓN;BROKER;ROL;DEALS ASIGNADOS;DEALS ACTIVOS;CIERRES GANADOS;WIN RATE (%);VOLUMEN COLOCADO (USD);ARANCEL BRUTO (USD);HONORARIO NETO BROKER (USD);TICKET PROMEDIO (USD);DÍAS CICLO;CUOTA ASIGNADA (USD);CUMPLIMIENTO CUOTA (%)",
    ...rankingBrokers.map(
      (b, idx) =>
        `#${idx + 1};"${b.brokerNombre}";"${b.brokerRol.replace(
          "_",
          " "
        )}";${b.dealsAsignados};${b.dealsActivos};${b.cierresGanados};${
          b.tasaConversionPct
        }%;${formatUSD(b.volumenTransaccionadoUSD)};${formatUSD(
          b.comisionesGeneradasUSD
        )};${formatUSD(b.honorariosNetosBrokerUSD)};${formatUSD(
          b.ticketPromedioUSD
        )};${b.diasPromedioCierre};${formatUSD(b.cuotaObjetivoUSD)};${
          b.cumplimientoCuotaPct
        }%`
    ),
    "",
    "--- 4. MATRIZ DE ABSORCIÓN TERRITORIAL DE SUELO EN LIMA ---",
    "DISTRITO;TOTAL LOTES;LOTES VENDIDOS;EN NEGOCIACIÓN;DISPONIBLES;TASA ABSORCIÓN (%);ÁREA TOTAL (M²);ÁREA VENDIDA (M²);PRECIO MEDIO (USD/M²);VOLUMEN TRANSACCIONADO (USD);ZONIFICACIONES PREDOMINANTES",
    ...absorcionMercado.map(
      (a) =>
        `"${a.distrito}";${a.totalLotes};${a.lotesVendidos};${
          a.lotesEnNegociacion
        };${a.lotesDisponibles};${a.tasaAbsorcionPct}%;${formatUSD(
          a.areaTotalM2
        )};${formatUSD(a.areaVendidaM2)};${formatUSD(
          a.precioM2PromedioUSD
        )};${formatUSD(a.volumenTotalTransaccionadoUSD)};"${a.zonificacionesPrincipales
          .map((z) => `${z.zonificacion} (${z.cantidad})`)
          .join(", ")}"`
    ),
    "",
    "--- 5. EMBUDO DE CONVERSIÓN COMERCIAL (FUNNEL) ---",
    "ORDEN;ETAPA COMERCIAL;CANTIDAD DEALS;VOLUMEN NOMINAL (USD);VOLUMEN PONDERADO (USD);DÍAS PROMEDIO EN ETAPA;% DEL TOTAL;TASA RETENCIÓN DESDE ANTERIOR (%);TASA ABANDONO (%)",
    ...embudo.map(
      (em) =>
        `${em.orden};"${em.label}";${em.cantidadDeals};${formatUSD(
          em.volumenUSD
        )};${formatUSD(em.volumenPonderadoUSD)};${
          em.diasPromedioEnEtapa
        };${em.porcentajeDelTotal}%;${em.tasaConversionDesdeAnteriorPct}%;${
          em.tasaAbandonoPct
        }%`
    ),
    "",
    "--- 6. DIAGNÓSTICO ESTRATÉGICO PARA COMITÉ DE INVERSIÓN ---",
    `Diagnóstico General;"${reporte.resumenEjecutivo.diagnosticoGeneral.replace(
      /"/g,
      '""'
    )}"`,
    ...reporte.resumenEjecutivo.puntosClave.map(
      (p, i) => `Punto Clave #${i + 1};"${p.replace(/"/g, '""')}"`
    ),
    ...reporte.resumenEjecutivo.oportunidadesDeMercado.map(
      (o, i) => `Oportunidad #${i + 1};"${o.replace(/"/g, '""')}"`
    ),
    ...reporte.resumenEjecutivo.alertasRiesgoOperativo.map(
      (a, i) => `Alerta de Riesgo #${i + 1};"${a.replace(/"/g, '""')}"`
    ),
  ];

  const csvContent = lines.join("\r\n");
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
    `Promundo_Informe_BI_Ejecutivo_${timestamp}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
