import {
  FiltroReportes,
  ReportesKpisGenerales,
  EvolucionPeriodo,
  RankingBrokerItem,
  AbsorcionDistritoItem,
  EmbudoEtapaItem,
  ReporteEjecutivo,
} from "@/types/reportes";
import { mockNegociacionesCompletas, mockUsuarios } from "@/lib/mock/negociaciones-seed";
import { mockTerrenosCompletos } from "@/lib/mock/terrenos-seed";
import { mockComisionesLiquidaciones } from "@/lib/mock/comisiones-seed";
import { ETAPAS_CONFIG, EtapaNegociacion } from "@/types/negociaciones";

/**
 * Aritmética financiera segura con redondeo a 2 decimales para evitar problemas IEEE 754.
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Filtra las negociaciones según el período y parámetros seleccionados.
 */
function filtrarNegociaciones(
  filtro?: FiltroReportes
) {
  let deals = [...mockNegociacionesCompletas];

  if (!filtro) return deals;

  if (filtro.brokerId && filtro.brokerId !== "todos") {
    deals = deals.filter((d) => d.broker.id === filtro.brokerId);
  }

  if (filtro.distrito && filtro.distrito.length > 0) {
    deals = deals.filter((d) => filtro.distrito!.includes(d.terreno.distrito));
  }

  if (filtro.zonificacion && filtro.zonificacion.length > 0) {
    deals = deals.filter((d) =>
      filtro.zonificacion!.includes(d.terreno.zonificacion)
    );
  }

  // Filtrado temporal
  if (filtro.rangoPeriodo && filtro.rangoPeriodo !== "Historico") {
    deals = deals.filter((d) => {
      const fecha = new Date(d.createdAt);
      const mes = fecha.getMonth(); // 0-indexed: 0=Ene, 7=Ago
      const anio = fecha.getFullYear();

      if (anio !== 2026) return false;

      switch (filtro.rangoPeriodo) {
        case "Q1":
          return mes >= 0 && mes <= 2;
        case "Q2":
          return mes >= 3 && mes <= 5;
        case "Q3":
          return mes >= 6 && mes <= 8;
        case "Q4":
          return mes >= 9 && mes <= 11;
        case "YTD":
        case "12M":
        default:
          return true;
      }
    });
  }

  return deals;
}

/**
 * Obtener KPIs generales y financieros para el banner de dirección.
 */
export async function getReportesKpisGenerales(
  filtro?: FiltroReportes
): Promise<ReportesKpisGenerales> {
  const deals = filtrarNegociaciones(filtro);
  const liquidaciones = [...mockComisionesLiquidaciones];

  const cierresGanados = deals.filter((d) => d.etapa === "Cierre_Ganado");
  const descartados = deals.filter((d) => d.etapa === "Descartado");
  const activos = deals.filter(
    (d) => d.etapa !== "Cierre_Ganado" && d.etapa !== "Descartado"
  );
  const estancados = activos.filter((d) => d.diasEnEtapaActual > 14);

  // Volumen cerrado de ventas y aranceles
  let volumenTotalTransaccionadoUSD = 0;
  let totalDiasCiclo = 0;

  cierresGanados.forEach((d) => {
    volumenTotalTransaccionadoUSD += parseFloat(d.montoOferta as string) || 0;
    totalDiasCiclo += d.diasTotales || 45;
  });

  const diasPromedioCicloCierre =
    cierresGanados.length > 0
      ? Math.round(totalDiasCiclo / cierresGanados.length)
      : 0;

  const totalArancelesComisionUSD = round2(
    volumenTotalTransaccionadoUSD * 0.03
  );
  const ticketPromedioTransaccionUSD =
    cierresGanados.length > 0
      ? round2(volumenTotalTransaccionadoUSD / cierresGanados.length)
      : 0;

  // Pipeline activo y ponderado
  let volumenPipelineActivoUSD = 0;
  let volumenPipelinePonderadoUSD = 0;

  activos.forEach((d) => {
    const monto = parseFloat(d.montoOferta as string) || 0;
    const prob = d.probabilidadCierre || 10;
    volumenPipelineActivoUSD += monto;
    volumenPipelinePonderadoUSD += monto * (prob / 100);
  });

  // Tasa de conversión (Win Rate)
  const terminados = cierresGanados.length + descartados.length;
  const tasaConversionPipelinePct =
    terminados > 0
      ? round2((cierresGanados.length / terminados) * 100)
      : 0;

  // Absorción de Suelo en Cartera
  const totalTerrenosInventario = mockTerrenosCompletos.length;
  const totalTerrenosVendidos = mockTerrenosCompletos.filter(
    (t) => t.estadoTerreno === "Vendido"
  ).length;
  const tasaAbsorcionInventarioPct = round2(
    (totalTerrenosVendidos / totalTerrenosInventario) * 100
  );

  let areaTotalTransaccionadaM2 = 0;
  cierresGanados.forEach((d) => {
    areaTotalTransaccionadaM2 += parseFloat(d.terreno.areaM2 as string) || 0;
  });

  const precioPromedioM2CerradoUSD =
    areaTotalTransaccionadaM2 > 0
      ? round2(volumenTotalTransaccionadoUSD / areaTotalTransaccionadaM2)
      : 0;

  // Tesorería & Splits
  const margenNetoPromundoUSD = round2(totalArancelesComisionUSD * 0.5);
  let honorariosLiquidadosBrokersUSD = 0;

  liquidaciones.forEach((l) => {
    if (l.estadoLiquidacion === "Liquidado") {
      honorariosLiquidadosBrokersUSD += l.montoNetoBrokerUSD || 0;
    }
  });

  return {
    volumenTotalTransaccionadoUSD: round2(volumenTotalTransaccionadoUSD),
    totalArancelesComisionUSD,
    ticketPromedioTransaccionUSD,
    diasPromedioCicloCierre,
    totalCierresConfirmados: cierresGanados.length,
    volumenPipelineActivoUSD: round2(volumenPipelineActivoUSD),
    volumenPipelinePonderadoUSD: round2(volumenPipelinePonderadoUSD),
    tasaConversionPipelinePct,
    dealsActivosCount: activos.length,
    dealsEstancadosCount: estancados.length,
    totalTerrenosInventario,
    totalTerrenosVendidos,
    tasaAbsorcionInventarioPct,
    areaTotalTransaccionadaM2: round2(areaTotalTransaccionadaM2),
    precioPromedioM2CerradoUSD,
    margenNetoPromundoUSD,
    honorariosLiquidadosBrokersUSD: round2(honorariosLiquidadosBrokersUSD),
    arancelEfectivoPromedioPct: 3.0,
  };
}

/**
 * Evolución cronológica mensual de transacciones y aranceles generados.
 */
export async function getEvolucionTemporal(
  filtro?: FiltroReportes
): Promise<EvolucionPeriodo[]> {
  // Serie mensual estándar consolidada para el año 2026 (Ene - Sep)
  const meses = [
    { id: "2026-01", label: "Ene 2026", mesNumero: 1, anio: 2026, venta: 3500000, m2: 2100 },
    { id: "2026-02", label: "Feb 2026", mesNumero: 2, anio: 2026, venta: 4200000, m2: 2450 },
    { id: "2026-03", label: "Mar 2026", mesNumero: 3, anio: 2026, venta: 5800000, m2: 3200 },
    { id: "2026-04", label: "Abr 2026", mesNumero: 4, anio: 2026, venta: 4100000, m2: 2800 },
    { id: "2026-05", label: "May 2026", mesNumero: 5, anio: 2026, venta: 6272000, m2: 3600 },
    { id: "2026-06", label: "Jun 2026", mesNumero: 6, anio: 2026, venta: 6650000, m2: 3800 },
    { id: "2026-07", label: "Jul 2026", mesNumero: 7, anio: 2026, venta: 7300000, m2: 4100 },
    { id: "2026-08", label: "Ago 2026", mesNumero: 8, anio: 2026, venta: 8872000, m2: 5200 },
    { id: "2026-09", label: "Sep 2026", mesNumero: 9, anio: 2026, venta: 3125000, m2: 1850 },
  ];

  let serie = meses;

  if (filtro?.rangoPeriodo) {
    switch (filtro.rangoPeriodo) {
      case "Q1":
        serie = meses.filter((m) => m.mesNumero >= 1 && m.mesNumero <= 3);
        break;
      case "Q2":
        serie = meses.filter((m) => m.mesNumero >= 4 && m.mesNumero <= 6);
        break;
      case "Q3":
        serie = meses.filter((m) => m.mesNumero >= 7 && m.mesNumero <= 9);
        break;
      case "Q4":
        serie = meses.filter((m) => m.mesNumero >= 10 && m.mesNumero <= 12);
        break;
      default:
        break;
    }
  }

  return serie.map((item) => {
    const arancel = round2(item.venta * 0.03);
    const margen = round2(arancel * 0.5);
    const cierres = Math.max(1, Math.round(item.venta / 3500000));
    const iniciados = cierres + Math.floor(Math.random() * 3) + 1;

    return {
      periodoId: item.id,
      label: item.label,
      mesNumero: item.mesNumero,
      anio: item.anio,
      volumenVentasUSD: item.venta,
      arancelesUSD: arancel,
      margenPromundoUSD: margen,
      dealsCerrados: cierres,
      dealsIniciados: iniciados,
      areaM2Transaccionada: item.m2,
    };
  });
}

/**
 * Ranking de Brokers (League Table) con cálculo de cumplimiento de cuota.
 */
export async function getRankingBrokers(
  filtro?: FiltroReportes
): Promise<RankingBrokerItem[]> {
  const deals = filtrarNegociaciones(filtro);
  const liquidaciones = [...mockComisionesLiquidaciones];

  const ranking = mockUsuarios.map((broker) => {
    const dealsBroker = deals.filter((d) => d.broker.id === broker.id);
    const ganados = dealsBroker.filter((d) => d.etapa === "Cierre_Ganado");
    const descartados = dealsBroker.filter((d) => d.etapa === "Descartado");
    const activos = dealsBroker.filter(
      (d) => d.etapa !== "Cierre_Ganado" && d.etapa !== "Descartado"
    );

    // Sumar volumen de cierres ganados
    let volumenTransaccionadoUSD = 0;
    let diasAcumulados = 0;

    ganados.forEach((d) => {
      volumenTransaccionadoUSD += parseFloat(d.montoOferta as string) || 0;
      diasAcumulados += d.diasTotales || 45;
    });

    const comisionesGeneradasUSD = round2(volumenTransaccionadoUSD * 0.03);

    // Liquidaciones del broker
    let honorariosNetosBrokerUSD = 0;
    liquidaciones
      .filter((l) => l.broker.id === broker.id)
      .forEach((l) => {
        honorariosNetosBrokerUSD += l.montoNetoBrokerUSD || 0;
      });

    const ticketPromedioUSD =
      ganados.length > 0 ? round2(volumenTransaccionadoUSD / ganados.length) : 0;
    const diasPromedioCierre =
      ganados.length > 0 ? Math.round(diasAcumulados / ganados.length) : 0;

    const terminados = ganados.length + descartados.length;
    const tasaConversionPct =
      terminados > 0 ? round2((ganados.length / terminados) * 100) : 0;

    // Cuota asignada: Senior $15M USD, Junior $8M USD
    const cuotaObjetivoUSD =
      broker.rol === "broker_senior" ? 15000000 : 8000000;
    const cumplimientoCuotaPct = round2(
      (volumenTransaccionadoUSD / cuotaObjetivoUSD) * 100
    );

    return {
      brokerId: broker.id,
      brokerNombre: broker.nombre,
      brokerEmail: broker.email,
      brokerRol: broker.rol,
      dealsAsignados: dealsBroker.length,
      dealsActivos: activos.length,
      cierresGanados: ganados.length,
      tasaConversionPct,
      volumenTransaccionadoUSD: round2(volumenTransaccionadoUSD),
      comisionesGeneradasUSD,
      honorariosNetosBrokerUSD: round2(honorariosNetosBrokerUSD),
      ticketPromedioUSD,
      diasPromedioCierre,
      cuotaObjetivoUSD,
      cumplimientoCuotaPct,
    };
  });

  // Ordenar de mayor a menor volumen transaccionado
  return ranking.sort(
    (a, b) => b.volumenTransaccionadoUSD - a.volumenTransaccionadoUSD
  );
}

/**
 * Matriz de absorción territorial de suelo por distrito de Lima.
 */
export async function getAbsorcionMercado(
  filtro?: FiltroReportes
): Promise<AbsorcionDistritoItem[]> {
  const terrenos = [...mockTerrenosCompletos];
  const deals = filtrarNegociaciones(filtro);

  // Extraer lista única de distritos
  const distritos = Array.from(new Set(terrenos.map((t) => t.distrito))).sort();

  return distritos.map((distrito) => {
    const lotesDistrito = terrenos.filter((t) => t.distrito === distrito);
    const vendidos = lotesDistrito.filter(
      (t) => t.estadoTerreno === "Vendido"
    );
    const enNegociacion = lotesDistrito.filter(
      (t) => t.estadoTerreno === "En Negociacion"
    );
    const disponibles = lotesDistrito.filter(
      (t) => t.estadoTerreno === "Disponible"
    );

    const tasaAbsorcionPct = round2(
      (vendidos.length / lotesDistrito.length) * 100
    );

    let areaTotalM2 = 0;
    let areaVendidaM2 = 0;
    let precioM2Sum = 0;
    let volumenVendidoUSD = 0;

    lotesDistrito.forEach((t) => {
      const area = parseFloat(t.areaM2 as string) || 0;
      const precioM2 = parseFloat(t.precioM2 as string) || 0;
      areaTotalM2 += area;
      precioM2Sum += precioM2;

      if (t.estadoTerreno === "Vendido") {
        areaVendidaM2 += area;
        volumenVendidoUSD += parseFloat(t.precioTotal as string) || 0;
      }
    });

    const precioM2PromedioUSD =
      lotesDistrito.length > 0
        ? round2(precioM2Sum / lotesDistrito.length)
        : 0;

    // Zonificaciones predominantes
    const zoniMap: Record<string, number> = {};
    lotesDistrito.forEach((t) => {
      zoniMap[t.zonificacion] = (zoniMap[t.zonificacion] || 0) + 1;
    });

    const zonificacionesPrincipales = Object.entries(zoniMap).map(
      ([zonificacion, cantidad]) => ({ zonificacion, cantidad })
    );

    return {
      distrito,
      totalLotes: lotesDistrito.length,
      lotesVendidos: vendidos.length,
      lotesEnNegociacion: enNegociacion.length,
      lotesDisponibles: disponibles.length,
      tasaAbsorcionPct,
      areaTotalM2: round2(areaTotalM2),
      areaVendidaM2: round2(areaVendidaM2),
      precioM2PromedioUSD,
      volumenTotalTransaccionadoUSD: round2(volumenVendidoUSD),
      zonificacionesPrincipales,
    };
  });
}

/**
 * Análisis del Embudo de Conversión Comercial (Funnel) de 7 etapas.
 */
export async function getEmbudoConversion(
  filtro?: FiltroReportes
): Promise<EmbudoEtapaItem[]> {
  const deals = filtrarNegociaciones(filtro);
  const totalDeals = deals.length || 1;

  const etapasOrden: {
    etapa: EtapaNegociacion;
    orden: number;
    colorHex: string;
    bgClass: string;
    borderClass: string;
  }[] = [
    { etapa: "Ficha_Enviada", orden: 1, colorHex: "#64748b", bgClass: "bg-slate-100", borderClass: "border-slate-300" },
    { etapa: "En_Evaluacion", orden: 2, colorHex: "#3b82f6", bgClass: "bg-blue-50", borderClass: "border-blue-300" },
    { etapa: "Visita_Realizada", orden: 3, colorHex: "#6366f1", bgClass: "bg-indigo-50", borderClass: "border-indigo-300" },
    { etapa: "LOI_Oferta", orden: 4, colorHex: "#f59e0b", bgClass: "bg-amber-50", borderClass: "border-amber-300" },
    { etapa: "Due_Diligence", orden: 5, colorHex: "#a855f7", bgClass: "bg-purple-50", borderClass: "border-purple-300" },
    { etapa: "Cierre_Ganado", orden: 6, colorHex: "#10b981", bgClass: "bg-emerald-50", borderClass: "border-emerald-300" },
  ];

  let dealsAcumuladosPrevios = totalDeals;

  return etapasOrden.map((config, idx) => {
    const etapaConfig = ETAPAS_CONFIG[config.etapa];
    const dealsEtapa = deals.filter((d) => d.etapa === config.etapa);

    let volumenUSD = 0;
    let volumenPonderadoUSD = 0;
    let diasTotal = 0;

    dealsEtapa.forEach((d) => {
      const monto = parseFloat(d.montoOferta as string) || 0;
      const prob = d.probabilidadCierre || etapaConfig.probabilidadDefault;
      volumenUSD += monto;
      volumenPonderadoUSD += monto * (prob / 100);
      diasTotal += d.diasEnEtapaActual || 5;
    });

    const diasPromedioEnEtapa =
      dealsEtapa.length > 0 ? Math.round(diasTotal / dealsEtapa.length) : 0;
    const porcentajeDelTotal = round2((dealsEtapa.length / totalDeals) * 100);

    const tasaConversionDesdeAnteriorPct =
      dealsAcumuladosPrevios > 0
        ? round2((dealsEtapa.length / dealsAcumuladosPrevios) * 100)
        : 100;

    const tasaAbandonoPct =
      idx > 0 ? Math.max(0, round2(100 - tasaConversionDesdeAnteriorPct)) : 0;

    dealsAcumuladosPrevios = dealsEtapa.length;

    return {
      etapa: config.etapa,
      label: etapaConfig.label,
      shortLabel: etapaConfig.shortLabel,
      orden: config.orden,
      cantidadDeals: dealsEtapa.length,
      volumenUSD: round2(volumenUSD),
      volumenPonderadoUSD: round2(volumenPonderadoUSD),
      diasPromedioEnEtapa,
      porcentajeDelTotal,
      tasaConversionDesdeAnteriorPct,
      tasaAbandonoPct,
      colorHex: config.colorHex,
      colorBgClass: config.bgClass,
      colorBorderClass: config.borderClass,
    };
  });
}

/**
 * Genera el informe ejecutivo formal consolidado para comités de inversión.
 */
export async function getReporteEjecutivo(
  filtro?: FiltroReportes
): Promise<ReporteEjecutivo> {
  const [kpis, evolucion, rankingBrokers, absorcionMercado, embudo] =
    await Promise.all([
      getReportesKpisGenerales(filtro),
      getEvolucionTemporal(filtro),
      getRankingBrokers(filtro),
      getAbsorcionMercado(filtro),
      getEmbudoConversion(filtro),
    ]);

  // Diagnóstico sintético automático
  const mejorBroker = rankingBrokers[0];
  const distritoTop = absorcionMercado.reduce((max, d) =>
    d.volumenTotalTransaccionadoUSD > max.volumenTotalTransaccionadoUSD ? d : max
  , absorcionMercado[0]);

  const puntosClave = [
    `Volumen transaccionado consolidado alcanza los $${(kpis.volumenTotalTransaccionadoUSD / 1000000).toFixed(2)}M USD con aranceles devengados de $${(kpis.totalArancelesComisionUSD / 1000).toFixed(1)}K USD.`,
    `Tasa de conversión global del pipeline comercial se sitúa en un robusto ${kpis.tasaConversionPipelinePct}% con ciclo medio de cierre en ${kpis.diasPromedioCicloCierre} días.`,
    `Liderazgo comercial encabezado por ${mejorBroker ? mejorBroker.brokerNombre : "el equipo"} con $${((mejorBroker?.volumenTransaccionadoUSD || 0) / 1000000).toFixed(2)}M USD colocados (${mejorBroker?.cumplimientoCuotaPct}% de su cuota).`,
    `Fuerte tracción inmobiliaria concentrada en ${distritoTop ? distritoTop.distrito : "Lima Metropolitana"} con una absorción de ${distritoTop ? distritoTop.tasaAbsorcionPct : 0}% sobre inventario.`,
  ];

  const oportunidadesDeMercado = [
    "Déficit de suelo residencial multifamiliar de alta densidad (RDA) en San Isidro y Miraflores genera presiones al alza en precios por m².",
    "Pipeline activo de $17.5M USD nominales con 4 oportunidades avanzadas en etapa de Due Diligence listas para firma de minuta en Q3.",
    "Potencial de colocación de predios industriales y logísticos en el eje Faucett/Callao con tickets superiores a $4.0M USD.",
  ];

  const alertasRiesgoOperativo = [
    `${kpis.dealsEstancadosCount} oportunidades activas registran más de 14 días en su etapa actual, requiriendo revisión de SLA con la constructora.`,
    "Tres certificados de parámetros urbanísticos (CPU) de la cartera entran en su ventana crítica de vencimiento a 36 meses bajo Ley 29090.",
  ];

  return {
    id: `REP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
    fechaGeneracion: new Date().toISOString(),
    periodoAnalizado:
      filtro?.rangoPeriodo === "YTD"
        ? "Año 2026 (YTD)"
        : filtro?.rangoPeriodo || "Consolidado 2026",
    filtros: filtro || { rangoPeriodo: "YTD" },
    kpis,
    evolucion,
    rankingBrokers,
    absorcionMercado,
    embudo,
    resumenEjecutivo: {
      diagnosticoGeneral:
        "La actividad comercial de Promundo Sistema refleja un ritmo de colocación de suelo acelerado en Lima Metropolitana, superando las metas trimestrales de absorción con alta retención de margen de intermediación institucional.",
      puntosClave,
      oportunidadesDeMercado,
      alertasRiesgoOperativo,
    },
  };
}
