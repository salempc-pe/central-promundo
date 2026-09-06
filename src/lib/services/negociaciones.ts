import {
  NegociacionCompleta,
  NegociacionFiltros,
  PipelineKpis,
  CreateNegociacionInput,
  UpdateEtapaNegociacionInput,
  AddBitacoraEventoInput,
  EtapaNegociacion,
  ETAPAS_CONFIG,
  Usuario,
} from "@/types";
import {
  mockNegociacionesCompletas,
  mockUsuarios,
} from "@/lib/mock/negociaciones-seed";
import { mockTerrenosCompletos, mockClientesCompradores } from "@/lib/mock/terrenos-seed";

// Store reactivo en memoria
let negociacionesStore: NegociacionCompleta[] = JSON.parse(
  JSON.stringify(mockNegociacionesCompletas)
);

type PipelineListener = () => void;
const listeners: Set<PipelineListener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Error en listener de pipeline:", e);
    }
  });
}

export function subscribePipeline(listener: PipelineListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getNegociaciones(
  filtros?: NegociacionFiltros
): Promise<NegociacionCompleta[]> {
  let result = [...negociacionesStore];

  if (!filtros) return result;

  // 1. Búsqueda por texto libre
  if (filtros.busqueda && filtros.busqueda.trim()) {
    const q = filtros.busqueda.toLowerCase().trim();
    const normQ = q.replace("terr-", "tr-");
    result = result.filter(
      (n) =>
        n.id.toLowerCase().includes(q) ||
        n.terrenoId.toLowerCase().includes(q) ||
        n.terrenoId.toLowerCase().includes(normQ) ||
        n.terreno.id.toLowerCase().includes(q) ||
        n.terreno.id.toLowerCase().includes(normQ) ||
        n.terreno.codigoInterno.toLowerCase().includes(q) ||
        n.terreno.distrito.toLowerCase().includes(q) ||
        n.terreno.direccion.toLowerCase().includes(q) ||
        n.cliente.razonSocial.toLowerCase().includes(q) ||
        n.broker.nombre.toLowerCase().includes(q) ||
        n.terreno.zonificacion.toLowerCase().includes(q) ||
        n.terreno.propietario?.razonSocialONombre?.toLowerCase().includes(q)
    );
  }

  // 2. Filtro por etapa
  if (filtros.etapa && filtros.etapa.length > 0) {
    result = result.filter((n) => filtros.etapa!.includes(n.etapa as EtapaNegociacion));
  }

  // 3. Filtro por Broker
  if (filtros.brokerId && filtros.brokerId.length > 0) {
    result = result.filter((n) => filtros.brokerId!.includes(n.brokerId));
  }

  // 4. Filtro por Cliente / Constructora
  if (filtros.clienteId && filtros.clienteId.length > 0) {
    result = result.filter((n) => filtros.clienteId!.includes(n.clienteId));
  }

  // 5. Filtro por Distrito
  if (filtros.distrito && filtros.distrito.length > 0) {
    result = result.filter((n) => filtros.distrito!.includes(n.terreno.distrito));
  }

  // 6. Filtro por Deals Estancados (> 14 días)
  if (filtros.soloEstancados) {
    result = result.filter(
      (n) =>
        n.diasEnEtapaActual > 14 &&
        n.etapa !== "Cierre_Ganado" &&
        n.etapa !== "Descartado"
    );
  }

  // 7. Filtro por Rango de Montos
  if (filtros.montoMin !== undefined && !isNaN(filtros.montoMin)) {
    result = result.filter((n) => Number(n.montoOferta || 0) >= filtros.montoMin!);
  }
  if (filtros.montoMax !== undefined && !isNaN(filtros.montoMax)) {
    result = result.filter((n) => Number(n.montoOferta || 0) <= filtros.montoMax!);
  }

  return result;
}

export async function getNegociacionById(
  id: string
): Promise<NegociacionCompleta | null> {
  const deal = negociacionesStore.find((n) => n.id === id);
  return deal ? JSON.parse(JSON.stringify(deal)) : null;
}

export async function getNegociacionesByTerrenoId(
  terrenoId: string
): Promise<NegociacionCompleta[]> {
  return negociacionesStore.filter((n) => n.terrenoId === terrenoId);
}

export async function updateEtapaNegociacion(
  input: UpdateEtapaNegociacionInput
): Promise<NegociacionCompleta> {
  const index = negociacionesStore.findIndex((n) => n.id === input.id);
  if (index === -1) {
    throw new Error(`Negociación con ID ${input.id} no encontrada.`);
  }

  const deal = negociacionesStore[index];
  const oldEtapa = deal.etapa as EtapaNegociacion;
  const newEtapa = input.nuevaEtapa;

  const config = ETAPAS_CONFIG[newEtapa];
  const nuevoMonto = input.montoOferta !== undefined ? String(input.montoOferta) : deal.montoOferta;
  const nuevaProbabilidad =
    input.probabilidadCierre !== undefined
      ? input.probabilidadCierre
      : config.probabilidadDefault;

  const brokerUsuario =
    mockUsuarios.find((u) => u.id === input.usuarioId) || deal.broker;

  // Crear evento inmutable de auditoría
  const nuevoEvento = {
    id: `bit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    negociacionId: deal.id,
    usuarioId: brokerUsuario.id,
    tipoEvento: input.tipoEvento,
    descripcion: input.notaBitacora,
    archivoAdjuntoUrl: input.archivoAdjuntoUrl || null,
    createdAt: new Date().toISOString(),
    usuario: brokerUsuario,
  };

  const updatedDeal: NegociacionCompleta = {
    ...deal,
    etapa: newEtapa,
    montoOferta: nuevoMonto,
    probabilidadCierre: nuevaProbabilidad,
    diasEnEtapaActual: oldEtapa === newEtapa ? deal.diasEnEtapaActual : 0,
    updatedAt: new Date().toISOString(),
    comisionEstimadaUSD: Number(nuevoMonto || 0) * 0.03,
    bitacora: [nuevoEvento, ...deal.bitacora],
  };

  negociacionesStore[index] = updatedDeal;
  notifyListeners();

  return updatedDeal;
}

export async function createNegociacion(
  input: CreateNegociacionInput
): Promise<NegociacionCompleta> {
  const terreno = mockTerrenosCompletos.find((t) => t.id === input.terrenoId);
  if (!terreno) throw new Error("Terreno no encontrado.");

  const cliente = mockClientesCompradores.find((c) => c.id === input.clienteId);
  if (!cliente) throw new Error("Cliente no encontrado.");

  const broker = mockUsuarios.find((u) => u.id === input.brokerId) || mockUsuarios[0];

  const etapaInicial: EtapaNegociacion = input.etapaInicial || "Ficha_Enviada";
  const config = ETAPAS_CONFIG[etapaInicial];
  const prob = input.probabilidadCierre ?? config.probabilidadDefault;
  const monto = String(input.montoOferta || terreno.precioTotal);

  const newId = `neg-${Date.now()}`;
  const nowStr = new Date().toISOString();

  const initialEvent = {
    id: `bit-${Date.now()}`,
    negociacionId: newId,
    usuarioId: broker.id,
    tipoEvento: "Nota" as const,
    descripcion: input.notaInicial || "Apertura de proceso de negociación comercial.",
    archivoAdjuntoUrl: null,
    createdAt: nowStr,
    usuario: broker,
  };

  const newDeal: NegociacionCompleta = {
    id: newId,
    terrenoId: terreno.id,
    clienteId: cliente.id,
    brokerId: broker.id,
    etapa: etapaInicial,
    montoOferta: monto,
    probabilidadCierre: prob,
    createdAt: nowStr,
    updatedAt: nowStr,
    diasEnEtapaActual: 0,
    diasTotales: 0,
    comisionEstimadaUSD: Number(monto) * 0.03,
    terreno,
    cliente,
    broker,
    bitacora: [initialEvent],
  };

  negociacionesStore.unshift(newDeal);
  notifyListeners();

  return newDeal;
}

export async function addBitacoraEvento(
  input: AddBitacoraEventoInput
): Promise<NegociacionCompleta> {
  const index = negociacionesStore.findIndex((n) => n.id === input.negociacionId);
  if (index === -1) {
    throw new Error(`Negociación ${input.negociacionId} no encontrada.`);
  }

  const deal = negociacionesStore[index];
  const broker = mockUsuarios.find((u) => u.id === input.usuarioId) || deal.broker;

  const nuevoEvento = {
    id: `bit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    negociacionId: deal.id,
    usuarioId: broker.id,
    tipoEvento: input.tipoEvento,
    descripcion: input.descripcion,
    archivoAdjuntoUrl: input.archivoAdjuntoUrl || null,
    createdAt: new Date().toISOString(),
    usuario: broker,
  };

  const updatedDeal: NegociacionCompleta = {
    ...deal,
    updatedAt: new Date().toISOString(),
    bitacora: [nuevoEvento, ...deal.bitacora],
  };

  negociacionesStore[index] = updatedDeal;
  notifyListeners();

  return updatedDeal;
}

export async function getPipelineKpis(
  filtros?: NegociacionFiltros
): Promise<PipelineKpis> {
  const deals = await getNegociaciones(filtros);

  const totalNegociaciones = deals.length;
  const dealsActivosList = deals.filter(
    (d) => d.etapa !== "Cierre_Ganado" && d.etapa !== "Descartado"
  );
  const dealsActivos = dealsActivosList.length;

  const dealsEstancados = dealsActivosList.filter(
    (d) => d.diasEnEtapaActual > 14
  ).length;

  const volumenTotalNominalUSD = dealsActivosList.reduce(
    (acc, d) => acc + Number(d.montoOferta || 0),
    0
  );

  const volumenPonderadoUSD = dealsActivosList.reduce(
    (acc, d) =>
      acc + Number(d.montoOferta || 0) * ((d.probabilidadCierre || 0) / 100),
    0
  );

  const ganadosList = deals.filter((d) => d.etapa === "Cierre_Ganado");
  const descartadosList = deals.filter((d) => d.etapa === "Descartado");

  const cierresGanados = ganadosList.length;
  const volumenCerradoUSD = ganadosList.reduce(
    (acc, d) => acc + Number(d.montoOferta || 0),
    0
  );

  const totalCerrados = cierresGanados + descartadosList.length;
  const tasaConversionPct =
    totalCerrados > 0 ? (cierresGanados / totalCerrados) * 100 : 0;

  const ticketPromedioUSD =
    dealsActivos > 0 ? volumenTotalNominalUSD / dealsActivos : 0;

  const comisionEstimadaTotalUSD = volumenTotalNominalUSD * 0.03;

  // Por Etapa
  const porEtapa = (Object.keys(ETAPAS_CONFIG) as EtapaNegotiationList).reduce(
    (acc, etapaKey) => {
      const etapaDeals = deals.filter((d) => d.etapa === etapaKey);
      const totalUSD = etapaDeals.reduce(
        (sum, d) => sum + Number(d.montoOferta || 0),
        0
      );
      const ponderadoUSD = etapaDeals.reduce(
        (sum, d) =>
          sum + Number(d.montoOferta || 0) * ((d.probabilidadCierre || 0) / 100),
        0
      );
      const probMedia =
        etapaDeals.length > 0
          ? etapaDeals.reduce((sum, d) => sum + (d.probabilidadCierre || 0), 0) /
            etapaDeals.length
          : ETAPAS_CONFIG[etapaKey].probabilidadDefault;

      acc[etapaKey] = {
        count: etapaDeals.length,
        totalUSD,
        ponderadoUSD,
        probabilidadMedia: Math.round(probMedia),
      };
      return acc;
    },
    {} as PipelineKpis["porEtapa"]
  );

  return {
    totalNegociaciones,
    dealsActivos,
    dealsEstancados,
    volumenTotalNominalUSD,
    volumenPonderadoUSD,
    cierresGanados,
    volumenCerradoUSD,
    tasaConversionPct,
    ticketPromedioUSD,
    comisionEstimadaTotalUSD,
    porEtapa,
  };
}

type EtapaNegotiationList = EtapaNegociacion[];

export function getBrokers(): Usuario[] {
  return mockUsuarios;
}
