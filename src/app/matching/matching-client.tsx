"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  MatchingViewMode,
  MatchingWeights,
  DEFAULT_MATCHING_WEIGHTS,
  MatchEvaluationResult,
  TerrenoCompleto,
  Cliente,
  Usuario,
} from "@/types";
import {
  evaluarMatch,
  calcularMatrizCompleta,
  matchTerrenoContraClientes,
  matchClienteContraTerrenos,
} from "@/lib/services/matching";
import { MatchingKpisBanner } from "@/components/matching/matching-kpis";
import { MatchingToolbar } from "@/components/matching/matching-toolbar";
import { MatchByTerrenoView } from "@/components/matching/match-by-terreno";
import { MatchByClienteView } from "@/components/matching/match-by-cliente";
import { MatchingMatrixView } from "@/components/matching/matching-matrix";
import { MatchDetailDrawer } from "@/components/matching/match-detail-drawer";
import { QuickDealDialog } from "@/components/matching/quick-deal-dialog";

interface MatchingClientProps {
  initialTerrenos?: TerrenoCompleto[];
  initialClientes?: Cliente[];
  initialBrokers?: Usuario[];
}

export function MatchingClient({
  initialTerrenos = [],
  initialClientes = [],
  initialBrokers = [],
}: MatchingClientProps = {}) {
  const searchParams = useSearchParams();

  // Estados de vista y ponderación
  const [viewMode, setViewMode] = useState<MatchingViewMode>("terreno");
  const [weights, setWeights] = useState<MatchingWeights>(DEFAULT_MATCHING_WEIGHTS);
  const [busqueda, setBusqueda] = useState<string>("");
  const [scoreMinimo, setScoreMinimo] = useState<number>(0);

  // Datos base reales de PostgreSQL
  const [terrenos] = useState<TerrenoCompleto[]>(initialTerrenos);
  const [clientes] = useState<Cliente[]>(initialClientes);
  const [brokers] = useState<Usuario[]>(initialBrokers);

  // Selección actual
  const [terrenoSeleccionado, setTerrenoSeleccionado] = useState<TerrenoCompleto | null>(
    terrenos[0] || null
  );
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(
    clientes[0] || null
  );

  // Modales
  const [detailMatch, setDetailMatch] = useState<MatchEvaluationResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const [quickDealMatch, setQuickDealMatch] = useState<MatchEvaluationResult | null>(null);
  const [isQuickDealOpen, setIsQuickDealOpen] = useState<boolean>(false);

  // Sincronizar desde searchParams si viene de otro módulo (?terrenoId=xxx o ?view=matriz)
  useEffect(() => {
    const tId =
      searchParams.get("terrenoId") ||
      searchParams.get("id") ||
      searchParams.get("q") ||
      searchParams.get("codigo");
    if (tId && terrenos.length > 0) {
      const normTarget = tId.toLowerCase().replace("terr-", "tr-");
      const foundT = terrenos.find(
        (t) =>
          t.id.toLowerCase() === tId.toLowerCase() ||
          t.id.toLowerCase() === normTarget ||
          t.codigoInterno.toLowerCase() === tId.toLowerCase()
      );
      if (foundT) {
        setTerrenoSeleccionado(foundT);
        setViewMode("terreno");
      }
    }

    const cId = searchParams.get("clienteId");
    if (cId && clientes.length > 0) {
      const foundC = clientes.find((c) => c.id.toLowerCase() === cId.toLowerCase());
      if (foundC) {
        setClienteSeleccionado(foundC);
        setViewMode("cliente");
      }
    }

    const v = searchParams.get("view");
    if (v === "matriz" || v === "terreno" || v === "cliente") {
      setViewMode(v);
    }
  }, [searchParams, terrenos, clientes]);

  // Cálculo de la Matriz Global Completa
  const matrixData = useMemo(() => {
    return calcularMatrizCompleta(terrenos, clientes, weights);
  }, [terrenos, clientes, weights]);

  // Cruces según vista activa
  const matchesPorTerreno = useMemo(() => {
    if (!terrenoSeleccionado) return [];
    let list = clientes.map((cli) => evaluarMatch(terrenoSeleccionado, cli, weights));
    if (scoreMinimo > 0) {
      list = list.filter((m) => m.scoreMatch >= scoreMinimo);
    }
    if (busqueda && busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.cliente.razonSocial.toLowerCase().includes(q) ||
          (m.cliente.contactoNombre && m.cliente.contactoNombre.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => b.scoreMatch - a.scoreMatch);
  }, [terrenoSeleccionado, clientes, weights, scoreMinimo, busqueda]);

  const matchesPorCliente = useMemo(() => {
    if (!clienteSeleccionado) return [];
    let list = terrenos.map((t) => evaluarMatch(t, clienteSeleccionado, weights));
    if (scoreMinimo > 0) {
      list = list.filter((m) => m.scoreMatch >= scoreMinimo);
    }
    if (busqueda && busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.terreno.codigoInterno.toLowerCase().includes(q) ||
          m.terreno.direccion.toLowerCase().includes(q) ||
          m.terreno.distrito.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.scoreMatch - a.scoreMatch);
  }, [clienteSeleccionado, terrenos, weights, scoreMinimo, busqueda]);

  // Handlers para abrir el Drawer y Quick Deal
  const handleOpenDetail = (match: MatchEvaluationResult) => {
    setDetailMatch(match);
    setIsDetailOpen(true);
  };

  const handleStartDeal = (match: MatchEvaluationResult) => {
    setQuickDealMatch(match);
    setIsQuickDealOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/70 p-3 space-y-3 overflow-hidden">
      {/* 1. Banner Superior de KPIs del Cruce */}
      <MatchingKpisBanner kpis={matrixData.kpis} />

      {/* 2. Barra de Control de Pistas, Filtros y Pesos */}
      <MatchingToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        weights={weights}
        onWeightsChange={setWeights}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        scoreMinimo={scoreMinimo}
        onScoreMinimoChange={setScoreMinimo}
        resultadosActuales={
          viewMode === "terreno"
            ? matchesPorTerreno
            : viewMode === "cliente"
            ? matchesPorCliente
            : []
        }
      />

      {/* 3. Vistas Principales Condicionales */}
      {viewMode === "terreno" && terrenoSeleccionado && (
        <MatchByTerrenoView
          terrenos={terrenos}
          terrenoSeleccionado={terrenoSeleccionado}
          onSelectTerreno={setTerrenoSeleccionado}
          matches={matchesPorTerreno}
          onOpenDetail={handleOpenDetail}
          onStartDeal={handleStartDeal}
        />
      )}

      {viewMode === "cliente" && clienteSeleccionado && (
        <MatchByClienteView
          clientes={clientes}
          clienteSeleccionado={clienteSeleccionado}
          onSelectCliente={setClienteSeleccionado}
          matches={matchesPorCliente}
          onOpenDetail={handleOpenDetail}
          onStartDeal={handleStartDeal}
        />
      )}

      {viewMode === "matriz" && (
        <MatchingMatrixView
          matrixData={matrixData}
          onOpenDetail={handleOpenDetail}
          onStartDeal={handleStartDeal}
        />
      )}

      {/* Drawer Lateral de Auditoría y Desglose de Gaps */}
      <MatchDetailDrawer
        match={detailMatch}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onStartDeal={handleStartDeal}
      />

      {/* Modal de Conversión Rápida a Negociación Comercial (Módulo D) con brokers reales */}
      <QuickDealDialog
        match={quickDealMatch}
        open={isQuickDealOpen}
        onOpenChange={setIsQuickDealOpen}
        brokers={brokers}
      />
    </div>
  );
}
