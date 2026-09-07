"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  NegociacionCompleta,
  NegociacionFiltros,
  PipelineKpis,
  EtapaNegociacion,
  TipoEventoBitacora,
  Usuario,
  TerrenoCompleto,
  Cliente,
} from "@/types";
import { calcularPipelineKpis } from "@/lib/services/negociaciones";
import {
  getNegociacionesAction,
  createNegociacionAction,
  updateEtapaNegociacionAction,
  addBitacoraEventoAction,
  getBrokersAction,
} from "@/lib/actions/pipeline-actions";
import { exportarPipelineAExcel } from "@/lib/export-pipeline";
import { PipelineKpisBanner } from "@/components/pipeline/pipeline-kpis";
import { PipelineToolbar } from "@/components/pipeline/pipeline-toolbar";
import { PipelineKanban } from "@/components/pipeline/pipeline-kanban";
import { PipelineTableView } from "@/components/pipeline/pipeline-table-view";
import { EtapaChangeDialog } from "@/components/pipeline/etapa-change-dialog";
import { DealDetailSheet } from "@/components/pipeline/deal-detail-sheet";
import { DealCreateDialog } from "@/components/pipeline/deal-create-dialog";
import { getCurrentUserSession } from "@/app/auth/actions";
import { AuthSessionUser } from "@/types/auth";

interface PipelineClientProps {
  initialBrokers?: Usuario[];
  initialTerrenos?: TerrenoCompleto[];
  initialClientes?: Cliente[];
  initialDeals?: NegociacionCompleta[];
}

export function PipelineClient({
  initialBrokers = [],
  initialTerrenos = [],
  initialClientes = [],
  initialDeals = [],
}: PipelineClientProps = {}) {
  const searchParams = useSearchParams();
  const [deals, setDeals] = useState<NegociacionCompleta[]>(initialDeals);
  const [kpis, setKpis] = useState<PipelineKpis | null>(() =>
    initialDeals.length > 0 ? calcularPipelineKpis(initialDeals) : null
  );
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<NegociacionFiltros>({});
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Entidades maestras reales de PostgreSQL
  const [terrenos] = useState<TerrenoCompleto[]>(initialTerrenos);
  const [clientes] = useState<Cliente[]>(initialClientes);

  // Estados de Modales y Drawers
  const [selectedDeal, setSelectedDeal] = useState<NegociacionCompleta | null>(null);
  const [dealToChangeStage, setDealToChangeStage] = useState<NegociacionCompleta | null>(null);
  const [targetStage, setTargetStage] = useState<EtapaNegociacion | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Lista viva de brokers reales
  const [brokers, setBrokers] = useState<Usuario[]>(initialBrokers);
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);

  useEffect(() => {
    if (!initialBrokers || initialBrokers.length === 0) {
      getBrokersAction().then((loaded) => {
        if (loaded && loaded.length > 0) {
          setBrokers(loaded);
        }
      });
    }

    getCurrentUserSession().then((u) => {
      if (u) setCurrentUser(u);
    });
  }, [initialBrokers]);

  // Distritos únicos calculados a partir de los terrenos reales en BD
  const distritosDisponibles = useMemo(() => {
    const set = new Set(terrenos.map((t) => t.distrito));
    return Array.from(set).sort();
  }, [terrenos]);

  // Clientes reales disponibles de la BD
  const clientesDisponibles = useMemo(() => {
    return clientes.map((c) => ({
      id: c.id,
      razonSocial: c.razonSocial,
    }));
  }, [clientes]);

  const selectedDealRef = React.useRef(selectedDeal);
  selectedDealRef.current = selectedDeal;

  // Sincronizar filtros desde searchParams al montar o navegar desde otros módulos
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("busqueda");
    const terrenoId = searchParams.get("terrenoId") || searchParams.get("codigo");
    const etapa = searchParams.get("etapa");

    const effectiveQuery = q || terrenoId;
    if (effectiveQuery || etapa) {
      setFiltros((prev) => ({
        ...prev,
        busqueda: effectiveQuery || prev.busqueda,
        etapa: etapa ? [etapa as EtapaNegociacion] : prev.etapa,
      }));
    }
  }, [searchParams]);

  // Preseleccionar deal si viene especificado en la URL (por dealId o terrenoId)
  useEffect(() => {
    const dealId = searchParams.get("dealId");
    const terrenoId = searchParams.get("terrenoId") || searchParams.get("codigo");
    if (!dealId && !terrenoId) return;

    if (dealId && deals.length > 0) {
      const found = deals.find((d) => d.id.toLowerCase() === dealId.toLowerCase());
      if (found) setSelectedDeal(found);
    } else if (terrenoId && deals.length > 0) {
      const normTarget = terrenoId.toLowerCase().replace("terr-", "tr-");
      const found = deals.find(
        (d) =>
          d.terreno?.id.toLowerCase() === terrenoId.toLowerCase() ||
          d.terreno?.id.toLowerCase() === normTarget ||
          d.terreno?.codigoInterno.toLowerCase() === terrenoId.toLowerCase()
      );
      if (found) setSelectedDeal(found);
    }
  }, [searchParams, deals]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedDeals = await getNegociacionesAction(filtros);
      setDeals(fetchedDeals);
      setKpis(calcularPipelineKpis(fetchedDeals));

      // Si hay un deal abierto en el Sheet, refrescarlo con la última data
      if (selectedDealRef.current) {
        const refreshed = fetchedDeals.find((d) => d.id === selectedDealRef.current?.id);
        if (refreshed) setSelectedDeal(refreshed);
      }
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    // Si hay filtros activos aplicados, recargar con el filtro
    if (Object.keys(filtros).length > 0) {
      loadData();
    }
  }, [filtros, loadData]);

  // Handlers
  const handleDealClick = (deal: NegociacionCompleta) => {
    setSelectedDeal(deal);
  };

  const handleRequestChangeStage = (
    deal: NegociacionCompleta,
    target?: EtapaNegociacion
  ) => {
    setDealToChangeStage(deal);
    setTargetStage(target || null);
  };

  const handleDropDeal = (dealId: string, newStage: EtapaNegociacion) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;
    if (deal.etapa === newStage) return;

    setDealToChangeStage(deal);
    setTargetStage(newStage);
  };

  const handleConfirmStageChange = async (data: {
    nuevaEtapa: EtapaNegociacion;
    tipoEvento: TipoEventoBitacora;
    notaBitacora: string;
    montoOferta: number;
    probabilidadCierre: number;
    usuarioId: string;
  }) => {
    if (!dealToChangeStage) return;

    const res = await updateEtapaNegociacionAction({
      id: dealToChangeStage.id,
      nuevaEtapa: data.nuevaEtapa,
      tipoEvento: data.tipoEvento,
      notaBitacora: data.notaBitacora,
      montoOferta: data.montoOferta,
      probabilidadCierre: data.probabilidadCierre,
      usuarioId: data.usuarioId,
    });

    if (res.success) {
      await loadData();
    }
  };

  const handleAddBitacora = async (
    negociacionId: string,
    tipoEvento: TipoEventoBitacora,
    descripcion: string,
    usuarioId: string
  ) => {
    const res = await addBitacoraEventoAction({
      negociacionId,
      tipoEvento,
      descripcion,
      usuarioId,
    });

    if (res.success) {
      await loadData();
    }
  };

  const handleCreateDealSubmit = async (data: {
    terrenoId: string;
    clienteId: string;
    brokerId: string;
    etapaInicial: EtapaNegociacion;
    montoOferta: number;
    probabilidadCierre: number;
    notaInicial: string;
  }) => {
    const res = await createNegociacionAction({
      terrenoId: data.terrenoId,
      clienteId: data.clienteId,
      brokerId: data.brokerId,
      etapaInicial: data.etapaInicial,
      montoOferta: data.montoOferta,
      probabilidadCierre: data.probabilidadCierre,
      notaInicial: data.notaInicial,
    });

    if (res.success) {
      await loadData();
    }
  };

  const handleExportExcel = () => {
    exportarPipelineAExcel(deals, filtros);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Banner Superior de KPIs */}
      <div className="p-2.5 pb-0">
        <PipelineKpisBanner kpis={kpis} loading={loading && !kpis} />
      </div>

      {/* Barra de Filtros y Control */}
      <div className="mt-2.5">
        <PipelineToolbar
          filtros={filtros}
          onFiltrosChange={setFiltros}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewDeal={() => setIsCreateOpen(true)}
          onExport={handleExportExcel}
          brokers={brokers}
          distritosDisponibles={distritosDisponibles}
          clientesDisponibles={clientesDisponibles}
          totalDeals={deals.length}
        />
      </div>

      {/* Contenido Principal: Tablero Kanban o Tabla */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === "kanban" ? (
          <PipelineKanban
            deals={deals}
            onDealClick={handleDealClick}
            onRequestChangeStage={handleRequestChangeStage}
            onAddNote={(deal) => {
              setSelectedDeal(deal);
            }}
            onDropDeal={handleDropDeal}
          />
        ) : (
          <PipelineTableView
            deals={deals}
            onDealClick={handleDealClick}
            onRequestChangeStage={handleRequestChangeStage}
          />
        )}
      </div>

      {/* Modal OBLIGATORIO de Transición de Etapa */}
      <EtapaChangeDialog
        deal={dealToChangeStage}
        targetStage={targetStage}
        isOpen={Boolean(dealToChangeStage)}
        onClose={() => {
          setDealToChangeStage(null);
          setTargetStage(null);
        }}
        onConfirm={handleConfirmStageChange}
        brokers={brokers}
      />

      {/* Drawer Lateral de Detalle del Deal & Bitácora Viva */}
      <DealDetailSheet
        deal={selectedDeal}
        isOpen={Boolean(selectedDeal)}
        onClose={() => setSelectedDeal(null)}
        onRequestChangeStage={(deal) => handleRequestChangeStage(deal)}
        onAddBitacora={handleAddBitacora}
        brokers={brokers}
      />

      {/* Modal de Creación de Nueva Negociación con datos 100% reales de la BD */}
      <DealCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateDealSubmit}
        terrenosDisponibles={terrenos}
        clientesDisponibles={clientes}
        brokers={brokers}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}
