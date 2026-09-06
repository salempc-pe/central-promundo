import {
  TerrenoCompleto,
  Cliente,
  ClientMatchResult,
  MatchEvaluationResult,
  MatchingWeights,
  DEFAULT_MATCHING_WEIGHTS,
  MatchingGap,
  MatchingScoreBreakdown,
  NivelCompatibilidad,
  MatchingFiltros,
  MatchingMatrixCell,
  MatchingMatrixData,
  MatchingKpis,
} from "@/types";
import { mockClientesCompradores, mockTerrenosCompletos } from "@/lib/mock/terrenos-seed";

// ============================================================================
// CLÚSTERES INMOBILIARIOS DE LIMA METROPOLITANA
// ============================================================================

export const CLUSTER_LIMA_TOP = [
  "miraflores",
  "san isidro",
  "san borja",
  "santiago de surco",
  "surco",
  "barranco",
  "la molina",
];

export const CLUSTER_LIMA_MODERNA = [
  "jesús maría",
  "jesus maria",
  "lince",
  "magdalena del mar",
  "magdalena",
  "san miguel",
  "pueblo libre",
  "surquillo",
];

export const CLUSTER_LIMA_CENTRO_ESTE = [
  "cercado de lima",
  "lima",
  "breña",
  "la victoria",
  "ate",
  "santa anita",
  "san luis",
];

export const CLUSTER_CALLAO = ["callao", "bellavista", "la perla", "la punta", "carmen de la legua"];

function sonDistritosColindantes(distritoA: string, distritoB: string): boolean {
  const dA = distritoA.toLowerCase().trim();
  const dB = distritoB.toLowerCase().trim();
  if (dA === dB) return true;

  const clusters = [CLUSTER_LIMA_TOP, CLUSTER_LIMA_MODERNA, CLUSTER_LIMA_CENTRO_ESTE, CLUSTER_CALLAO];
  for (const cluster of clusters) {
    const hasA = cluster.some((d) => d === dA || dA.includes(d));
    const hasB = cluster.some((d) => d === dB || dB.includes(d));
    if (hasA && hasB) return true;
  }
  return false;
}

// ============================================================================
// EVALUADOR CUANTITATIVO UNITARIO (LOTE ↔ COMPRADOR)
// ============================================================================

export function evaluarMatch(
  terreno: TerrenoCompleto,
  cliente: Cliente,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): MatchEvaluationResult {
  const id = `${terreno.id}_${cliente.id}`;
  const precio = Number(terreno.precioTotal) || 0;
  const altura = terreno.alturaMaxPisos || 0;
  const frente = Number(terreno.frenteLinealM) || 0;
  const area = Number(terreno.areaM2) || 0;
  const distrito = (terreno.distrito || "").toLowerCase().trim();
  const zonif = (terreno.zonificacion || "").toUpperCase().trim();

  const ticketMin = cliente.ticketMin ? Number(cliente.ticketMin) : 0;
  const ticketMax = cliente.ticketMax ? Number(cliente.ticketMax) : Infinity;
  const reqAltura = cliente.alturaMinimaInteres || 0;
  const zonasInteres = (cliente.zonasInteres || []).map((z) => z.toLowerCase().trim());
  const zonifInteres = (cliente.zonificacionesInteres || []).map((z) => z.toUpperCase().trim());

  const gaps: MatchingGap[] = [];
  const razones: string[] = [];

  // 1. TICKET FINANCIERO (Peso: weights.ticket)
  let ticketRatio = 0;
  let ticketCumplido = false;

  if (precio >= ticketMin * 0.95 && precio <= ticketMax * 1.05) {
    // Rango ideal
    ticketRatio = 1.0;
    ticketCumplido = true;
    razones.push("Presupuesto de inversión 100% compatible");
    gaps.push({
      criterio: "ticket",
      tipo: "optimo",
      mensaje: `Precio ($${precio.toLocaleString("en-US")}) alineado con rango objetivo ($${ticketMin.toLocaleString("en-US")} - $${ticketMax.toLocaleString("en-US")})`,
    });
  } else if (precio < ticketMin * 0.95) {
    // Por debajo del ticket mínimo: fácilmente absorbible
    ticketRatio = 0.7;
    ticketCumplido = true;
    razones.push("Precio menor al ticket mínimo (Ticket de rápida absorción)");
    gaps.push({
      criterio: "ticket",
      tipo: "optimo",
      mensaje: `Ticket por debajo del mínimo ($${ticketMin.toLocaleString("en-US")}). Oportunidad de absorción sin apalancamiento elevado.`,
      delta: { esperado: ticketMin, actual: precio },
    });
  } else {
    // Excede el ticket máximo
    const exceso = precio - ticketMax;
    const excesoPct = (exceso / ticketMax) * 100;

    if (excesoPct <= 10) {
      ticketRatio = 0.4;
      ticketCumplido = false;
      razones.push(`Excede presupuesto en +${excesoPct.toFixed(1)}% (Margen negociable con broker)`);
      gaps.push({
        criterio: "ticket",
        tipo: "alerta",
        mensaje: `Precio supera ticket máx por $${exceso.toLocaleString("en-US")} (+${excesoPct.toFixed(1)}%). Viable con descuento de cierre.`,
        delta: { esperado: ticketMax, actual: precio, diferenciaPct: Math.round(excesoPct) },
      });
    } else {
      ticketRatio = 0;
      ticketCumplido = false;
      gaps.push({
        criterio: "ticket",
        tipo: "critico",
        mensaje: `Precio excede presupuesto máximo en +${excesoPct.toFixed(1)}% ($${exceso.toLocaleString("en-US")}). Supera capacidad financiera establecida.`,
        delta: { esperado: ticketMax, actual: precio, diferenciaPct: Math.round(excesoPct) },
      });
    }
  }
  const ticketScore = Math.round(weights.ticket * ticketRatio);

  // 2. UBICACIÓN / DISTRITOS DIANA (Peso: weights.zona)
  let zonaRatio = 0;
  let zonaCumplida = false;

  const matchZonaDirecta = zonasInteres.some((z) => z === distrito || distrito.includes(z) || z.includes(distrito));
  if (matchZonaDirecta) {
    zonaRatio = 1.0;
    zonaCumplida = true;
    razones.push(`Distrito prioritario de inversión (${terreno.distrito})`);
    gaps.push({
      criterio: "zona",
      tipo: "optimo",
      mensaje: `Ubicación directa en distrito prioritario: ${terreno.distrito}`,
    });
  } else {
    const matchColindante = zonasInteres.some((z) => sonDistritosColindantes(distrito, z));
    if (matchColindante) {
      zonaRatio = 0.5;
      zonaCumplida = false;
      razones.push(`Distrito colindante en mismo clúster comercial (${terreno.distrito})`);
      gaps.push({
        criterio: "zona",
        tipo: "alerta",
        mensaje: `Lote en ${terreno.distrito} (Colindante con zonas objetivo del comprador)`,
      });
    } else {
      zonaRatio = 0;
      zonaCumplida = false;
      gaps.push({
        criterio: "zona",
        tipo: "incompatible",
        mensaje: `Ubicación (${terreno.distrito}) fuera de las zonas objetivo declaradas`,
      });
    }
  }
  const zonaScore = Math.round(weights.zona * zonaRatio);

  // 3. ZONIFICACIÓN Y USOS (Peso: weights.zonificacion)
  let zonifRatio = 0;
  let zonifCumplida = false;

  const matchZonifDirecta = zonifInteres.length === 0 || zonifInteres.includes(zonif);
  if (matchZonifDirecta) {
    zonifRatio = 1.0;
    zonifCumplida = true;
    razones.push(`Zonificación objetivo (${zonif})`);
    gaps.push({
      criterio: "zonificacion",
      tipo: "optimo",
      mensaje: `Zonificación ${zonif} coincide con la cartera buscada`,
    });
  } else if (
    (zonifInteres.includes("RDM") && (zonif === "RDA" || zonif === "CZ")) ||
    (zonifInteres.includes("RDA") && zonif === "CZ")
  ) {
    // Mayor densidad absorbente
    zonifRatio = 0.85;
    zonifCumplida = true;
    razones.push(`Zonificación ${zonif} de mayor absorción residencial`);
    gaps.push({
      criterio: "zonificacion",
      tipo: "optimo",
      mensaje: `Zonificación ${zonif} supera o absorbe el requerimiento inicial (${zonifInteres.join(", ")})`,
    });
  } else {
    zonifRatio = 0;
    zonifCumplida = false;
    gaps.push({
      criterio: "zonificacion",
      tipo: "incompatible",
      mensaje: `Zonificación ${zonif} difiere de requerimientos (${zonifInteres.join(", ") || "No especificado"})`,
    });
  }
  const zonifScore = Math.round(weights.zonificacion * zonifRatio);

  // 4. ALTURA NORMATIVA EN PISOS (Peso: weights.altura)
  let alturaRatio = 0;
  let alturaCumplida = false;

  if (reqAltura === 0 || altura >= reqAltura) {
    alturaRatio = 1.0;
    alturaCumplida = true;
    if (reqAltura > 0) {
      razones.push(`Cumple cabida de altura (Permite ${altura} pisos vs ${reqAltura} mín.)`);
      gaps.push({
        criterio: "altura",
        tipo: "optimo",
        mensaje: `Altura normativa (${altura} pisos) satisface el requerimiento (mínimo ${reqAltura} pisos)`,
      });
    }
  } else {
    const deficit = reqAltura - altura;
    if (deficit <= 2) {
      alturaRatio = 0.65;
      alturaCumplida = false;
      razones.push(`Déficit menor de altura (-${deficit} piso${deficit > 1 ? "s" : ""}, subsanable con azotea verde/retiro)`);
      gaps.push({
        criterio: "altura",
        tipo: "alerta",
        mensaje: `Permite ${altura} pisos (requiere ${reqAltura}). Brecha de -${deficit} piso(s) negociable.`,
        delta: { esperado: reqAltura, actual: altura },
      });
    } else {
      alturaRatio = 0;
      alturaCumplida = false;
      gaps.push({
        criterio: "altura",
        tipo: "critico",
        mensaje: `Permite ${altura} pisos pero la constructora requiere un mínimo de ${reqAltura} pisos (-${deficit} pisos). Cabida insuficiente.`,
        delta: { esperado: reqAltura, actual: altura },
      });
    }
  }
  const alturaScore = Math.round(weights.altura * alturaRatio);

  // 5. GEOMETRÍA Y FRENTE LINEAL (Peso: weights.frenteArea)
  let frenteRatio = 0;
  let frenteCumplido = false;

  if (frente >= 15.0) {
    frenteRatio = 1.0;
    frenteCumplido = true;
    razones.push(`Frente óptimo de ${frente.toFixed(1)}m (Apto para rampa vehicular doble)`);
    gaps.push({
      criterio: "frenteArea",
      tipo: "optimo",
      mensaje: `Frente lineal de ${frente.toFixed(1)}m (Óptimo para doble sótano vehicular sin cuello de botella)`,
    });
  } else if (frente >= 11.0) {
    frenteRatio = 0.6;
    frenteCumplido = true;
    gaps.push({
      criterio: "frenteArea",
      tipo: "alerta",
      mensaje: `Frente lineal de ${frente.toFixed(1)}m (Requiere rampa simple con semáforo o montacoches)`,
      delta: { esperado: 15.0, actual: frente },
    });
  } else if (frente > 0) {
    frenteRatio = 0.2;
    frenteCumplido = false;
    gaps.push({
      criterio: "frenteArea",
      tipo: "critico",
      mensaje: `Frente estrecho de ${frente.toFixed(1)}m (< 11.00m). Restringe diseño de sótanos y lobby.`,
      delta: { esperado: 15.0, actual: frente },
    });
  } else {
    frenteRatio = 0.5;
    frenteCumplido = false;
  }
  const frenteAreaScore = Math.round(weights.frenteArea * frenteRatio);

  // BONUS: CERTIFICADO DE PARÁMETROS URBANÍSTICOS (CPU) VIGENTE (+5 pts)
  const tieneCpuVigente = (terreno.documentos || []).some(
    (d) => d.tipoDocumento === "Certificado_Parametros"
  );
  const bonusCpu = tieneCpuVigente ? 5 : 0;
  if (tieneCpuVigente) {
    razones.push("Certificado de Parámetros vigente (+5% certidumbre legal)");
  }

  // PUNTUACIÓN TOTAL CON TOPE 100%
  const scoreTotal = Math.min(
    100,
    ticketScore + zonaScore + zonifScore + alturaScore + frenteAreaScore + bonusCpu
  );

  // CLASIFICACIÓN DE NIVEL DE COMPATIBILIDAD
  let nivelCompatibilidad: NivelCompatibilidad = "Descartado";
  if (scoreTotal >= 80) nivelCompatibilidad = "Prime";
  else if (scoreTotal >= 68) nivelCompatibilidad = "Alto";
  else if (scoreTotal >= 50) nivelCompatibilidad = "Medio";
  else if (scoreTotal >= 35) nivelCompatibilidad = "Bajo";

  // RECOMENDACIÓN COMERCIAL DINÁMICA
  let recomendacionComercial = "";
  if (scoreTotal >= 85) {
    recomendacionComercial = "Oportunidad de alta convicción. Proceder con envío inmediato de ficha ejecutiva y coordinar reunión con gerencia de desarrollo.";
  } else if (scoreTotal >= 70) {
    recomendacionComercial = "Match comercial favorable. Evaluar margen de negociación sobre ticket o cabida volumétrica de departamentos antes de enviar LOI.";
  } else if (scoreTotal >= 50) {
    recomendacionComercial = "Afinidad parcial. Verificar si la constructora está abierta a proyectos en clústeres colindantes o negociación de canje.";
  } else {
    recomendacionComercial = "Incompatible con el mandato de inversión actual. Priorizar otros lotes de la cartera.";
  }

  const breakdown: MatchingScoreBreakdown = {
    scoreTotal,
    ticketScore,
    zonaScore,
    zonifScore,
    alturaScore,
    frenteAreaScore,
    bonusCpuVigente: bonusCpu,
    cumplimiento: {
      ticket: ticketCumplido,
      zona: zonaCumplida,
      zonificacion: zonifCumplida,
      altura: alturaCumplida,
      frenteArea: frenteCumplido,
      cpuVigente: tieneCpuVigente,
    },
  };

  return {
    id,
    terrenoId: terreno.id,
    clienteId: cliente.id,
    terreno,
    cliente,
    scoreMatch: scoreTotal,
    nivelCompatibilidad,
    breakdown,
    gaps,
    razones,
    recomendacionComercial,
  };
}

// ============================================================================
// MATCHING BIDIRECCIONAL (VISTAS OPERATIVAS)
// ============================================================================

/**
 * Matching por Terreno (Un lote -> N constructoras)
 */
export async function matchTerrenoContraClientes(
  terrenoId: string,
  filtros?: MatchingFiltros,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS,
  catalogoTerrenos: TerrenoCompleto[] = mockTerrenosCompletos,
  catalogoClientes: Cliente[] = mockClientesCompradores
): Promise<MatchEvaluationResult[]> {
  const terreno = catalogoTerrenos.find((t) => t.id === terrenoId);
  if (!terreno) return [];

  let poolClientes = [...catalogoClientes];

  // Filtros aplicables al pool de clientes
  if (filtros?.tipoCliente && filtros.tipoCliente.length > 0) {
    poolClientes = poolClientes.filter((c) => filtros.tipoCliente?.includes(c.tipoCliente));
  }

  if (filtros?.busqueda) {
    const q = filtros.busqueda.toLowerCase().trim();
    poolClientes = poolClientes.filter(
      (c) =>
        c.razonSocial.toLowerCase().includes(q) ||
        (c.contactoNombre && c.contactoNombre.toLowerCase().includes(q))
    );
  }

  let results: MatchEvaluationResult[] = poolClientes.map((cli) =>
    evaluarMatch(terreno, cli, weights)
  );

  // Filtro por score mínimo
  if (filtros?.scoreMinimo) {
    results = results.filter((r) => r.scoreMatch >= (filtros.scoreMinimo || 0));
  }

  return results.sort((a, b) => b.scoreMatch - a.scoreMatch);
}

/**
 * Matching por Constructora (Una constructora -> M lotes de la cartera)
 */
export async function matchClienteContraTerrenos(
  clienteId: string,
  filtros?: MatchingFiltros,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS,
  catalogoTerrenos: TerrenoCompleto[] = mockTerrenosCompletos,
  catalogoClientes: Cliente[] = mockClientesCompradores
): Promise<MatchEvaluationResult[]> {
  const cliente = catalogoClientes.find((c) => c.id === clienteId);
  if (!cliente) return [];

  let poolTerrenos = [...catalogoTerrenos];

  if (filtros?.soloDisponibles) {
    poolTerrenos = poolTerrenos.filter((t) => t.estadoTerreno === "Disponible");
  }

  if (filtros?.distrito && filtros.distrito.length > 0) {
    poolTerrenos = poolTerrenos.filter((t) =>
      filtros.distrito?.some((d) => d.toLowerCase() === t.distrito.toLowerCase())
    );
  }

  if (filtros?.zonificacion && filtros.zonificacion.length > 0) {
    poolTerrenos = poolTerrenos.filter((t) =>
      filtros.zonificacion?.some((z) => z.toUpperCase() === t.zonificacion.toUpperCase())
    );
  }

  if (filtros?.busqueda) {
    const q = filtros.busqueda.toLowerCase().trim();
    poolTerrenos = poolTerrenos.filter(
      (t) =>
        t.codigoInterno.toLowerCase().includes(q) ||
        t.direccion.toLowerCase().includes(q) ||
        t.distrito.toLowerCase().includes(q)
    );
  }

  let results: MatchEvaluationResult[] = poolTerrenos.map((terreno) =>
    evaluarMatch(terreno, cliente, weights)
  );

  if (filtros?.scoreMinimo) {
    results = results.filter((r) => r.scoreMatch >= (filtros.scoreMinimo || 0));
  }

  return results.sort((a, b) => b.scoreMatch - a.scoreMatch);
}

// ============================================================================
// MATRIZ COMPLETA NxM Y CÁLCULO DE KPIS GLOBALES
// ============================================================================

export function calcularMatrizCompleta(
  terrenos: TerrenoCompleto[] = mockTerrenosCompletos,
  clientes: Cliente[] = mockClientesCompradores,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): MatchingMatrixData {
  const matriz: Record<string, Record<string, MatchingMatrixCell>> = {};

  let matchesPrime = 0;
  let matchesViables = 0;
  const lotesConMatchViableSet = new Set<string>();
  const constructorasActivasSet = new Set<string>();
  const lotesPrimeSet = new Set<string>();

  for (const t of terrenos) {
    matriz[t.id] = {};
    for (const c of clientes) {
      const evaluation = evaluarMatch(t, c, weights);
      const score = evaluation.scoreMatch;

      const gapsCount = evaluation.gaps.length;
      const criticosCount = evaluation.gaps.filter((g) => g.tipo === "critico" || g.tipo === "incompatible").length;

      matriz[t.id][c.id] = {
        terrenoId: t.id,
        clienteId: c.id,
        score,
        nivel: evaluation.nivelCompatibilidad,
        gapsCount,
        criticosCount,
      };

      if (score >= 80) {
        matchesPrime++;
        lotesPrimeSet.add(t.id);
      }
      if (score >= 65 && score < 80) {
        matchesViables++;
      }
      if (score >= 70) {
        lotesConMatchViableSet.add(t.id);
        constructorasActivasSet.add(c.id);
      }
    }
  }

  // Volumen potencial en USD: valor de venta de los terrenos con al menos 1 match Prime (>=80%)
  const volumenPotencialUSD = terrenos
    .filter((t) => lotesPrimeSet.has(t.id))
    .reduce((acc, t) => acc + (Number(t.precioTotal) || 0), 0);

  const coberturaInventarioPct =
    terrenos.length > 0 ? Math.round((lotesConMatchViableSet.size / terrenos.length) * 100) : 0;

  const kpis: MatchingKpis = {
    totalTerrenosEvaluados: terrenos.length,
    totalConstructorasEvaluadas: clientes.length,
    matchesPrime,
    matchesViables,
    lotesConMatchViable: lotesConMatchViableSet.size,
    constructorasActivasConMatch: constructorasActivasSet.size,
    volumenPotencialPipelineUSD: volumenPotencialUSD,
    coberturaInventarioPct,
  };

  return {
    terrenos,
    clientes,
    matriz,
    kpis,
    timestamp: Date.now(),
  };
}

// ============================================================================
// COMPATIBILIDAD REGRESIVA CON MÓDULO A (terreno-detail-sheet.tsx)
// ============================================================================

export function calcularMatchingTerreno(
  terreno: TerrenoCompleto,
  clientes: Cliente[] = mockClientesCompradores
): ClientMatchResult[] {
  const evals = clientes.map((cli) => evaluarMatch(terreno, cli, DEFAULT_MATCHING_WEIGHTS));

  return evals
    .map((ev) => ({
      cliente: ev.cliente,
      scoreMatch: ev.scoreMatch,
      criteriosCumplidos: {
        ticket: ev.breakdown.cumplimiento.ticket,
        zona: ev.breakdown.cumplimiento.zona,
        zonificacion: ev.breakdown.cumplimiento.zonificacion,
        altura: ev.breakdown.cumplimiento.altura,
      },
      razon: ev.razones,
    }))
    .sort((a, b) => b.scoreMatch - a.scoreMatch);
}
