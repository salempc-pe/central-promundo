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
} from "@/types";
import {
  getNegociaciones,
  getPipelineKpis,
  updateEtapaNegociacion,
  createNegociacion,
  addBitacoraEvento,
  subscribePipeline,
  getBrokers,
} from "@/lib/services/negociaciones";
import { mockTerrenosCompletos, mockClientesCompradores } from "@/lib/mock/terrenos-seed";
import { exportarPipelineAExcel } from "@/lib/export-pipeline";
import { PipelineKpisBanner } from "@/components/pipeline/pipeline-kpis";
import { PipelineToolbar } from "@/components/pipeline/pipeline-toolbar";
import { PipelineKanban } from "@/components/pipeline/pipeline-kanban";
import { PipelineTableView } from "@/components/pipeline/pipeline-table-view";
import { EtapaChangeDialog } from "@/components/pipeline/etapa-change-dialog";
import { DealDetailSheet } from "@/components/pipeline/deal-detail-sheet";
import { DealCreateDialog } from "@/components/pipeline/deal-create-dialog";

export function PipelineClient() {
  const searchParams = useSearchParams();
  const [deals, setDeals] = useState<NegociacionCompleta[]>([]);
  const [kpis, setKpis] = useState<PipelineKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<NegociacionFiltros>({});
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Estados de Modales y Drawers
  const [selectedDeal, setSelectedDeal] = useState<NegociacionCompleta | null>(null);
  const [dealToChangeStage, setDealToChangeStage] = useState<NegociacionCompleta | null>(null);
  const [targetStage, setTargetStage] = useState<EtapaNegociacion | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const brokers: Usuario[] = useMemo(() => getBrokers(), []);

  const distritosDisponibles = useMemo(() => {
    const set = new Set(mockTerrenosCompletos.map((t) => t.distrito));
    return Array.from(set).sort();
  }, []);

  const clientesDisponibles = useMemo(() => {
    return mockClientesCompradores.map((c) => ({
      id: c.id,
      razonSocial: c.razonSocial,
    }));
  }, []);

  // Sincronizar desde searchParams al montar o navegar desde otros módulos
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("busqueda");
    const terrenoId = searchParams.get("terrenoId") || searchParams.get("codigo");
    const etapa = searchParams.get("etapa");
    const dealId = searchParams.get("dealId");

    const effectiveQuery = q || terrenoId;
    if (effectiveQuery || etapa) {
      setFiltros((prev) => ({
        ...prev,
        busqueda: effectiveQuery || prev.busqueda,
        etapa: etapa ? [etapa as EtapaNegociacion] : prev.etapa,
      }));
    }

    if (dealId && deals.length > 0) {
      const found = deals.find((d) => d.id.toLowerCase() === dealId.toLowerCase());
      if (found) setSelectedDeal(found);
    } else if (terrenoId && deals.length > 0) {
      const normTarget = terrenoId.toLowerCase().replace("terr-", "tr-");
      const found = deals.find(
        (d) =>
          d.terreno.id.toLowerCase() === terrenoId.toLowerCase() ||
          d.terreno.id.toLowerCase() === normTarget ||
          d.terreno.codigoInterno.toLowerCase() === terrenoId.toLowerCase()
      );
      if (found) setSelectedDeal(found);
    }
  }, [searchParams, deals]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedDeals, fetchedKpis] = await Promise.all([
        getNegociaciones(filtros),
        getPipelineKpis(filtros),
      ]);
      setDeals(fetchedDeals);
      setKpis(fetchedKpis);

      // Si hay un deal abierto en el Sheet, refrescarlo con la última data
      if (selectedDeal) {
        const refreshed = fetchedDeals.find((d) => d.id === selectedDeal.id);
        if (refreshed) setSelectedDeal(refreshed);
      }
    } finally {
      setLoading(false);
    }
  }, [filtros, selectedDeal]);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribePipeline(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [loadData]);

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
    if (deal.etapa === newStage) return; // Mismo stage, no hacer nada

    // Abrir modal OBLIGATORIO de notas antes de permitir la transición
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

    await updateEtapaNegociacion({
      id: dealToChangeStage.id,
      nuevaEtapa: data.nuevaEtapa,
      tipoEvento: data.tipoEvento,
      notaBitacora: data.notaBitacora,
      montoOferta: data.montoOferta,
      probabilidadCierre: data.probabilidadCierre,
      usuarioId: data.usuarioId,
    });
  };

  const handleAddBitacora = async (
    negociacionId: string,
    tipoEvento: TipoEventoBitacora,
    descripcion: string,
    usuarioId: string
  ) => {
    await addBitacoraEvento({
      negociacionId,
      tipoEvento,
      descripcion,
      usuarioId,
    });
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
    await createNegociacion({
      terrenoId: data.terrenoId,
      clienteId: data.clienteId,
      brokerId: data.brokerId,
      etapaInicial: data.etapaInicial,
      montoOferta: data.montoOferta,
      probabilidadCierre: data.probabilidadCierre,
      notaInicial: data.notaInicial,
    });
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

      {/* Modal de Creación de Nueva Negociación */}
      <DealCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateDealSubmit}
        terrenosDisponibles={mockTerrenosCompletos}
        clientesDisponibles={mockClientesCompradores}
        brokers={brokers}
      />
    </div>
  );
}
