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
} from "@/types";
import {
  evaluarMatch,
  calcularMatrizCompleta,
  matchTerrenoContraClientes,
  matchClienteContraTerrenos,
} from "@/lib/services/matching";
import { mockTerrenosCompletos, mockClientesCompradores } from "@/lib/mock/terrenos-seed";
import { MatchingKpisBanner } from "@/components/matching/matching-kpis";
import { MatchingToolbar } from "@/components/matching/matching-toolbar";
import { MatchByTerrenoView } from "@/components/matching/match-by-terreno";
import { MatchByClienteView } from "@/components/matching/match-by-cliente";
import { MatchingMatrixView } from "@/components/matching/matching-matrix";
import { MatchDetailDrawer } from "@/components/matching/match-detail-drawer";
import { QuickDealDialog } from "@/components/matching/quick-deal-dialog";

export function MatchingClient() {
  const searchParams = useSearchParams();

  // Estados de vista y ponderación
  const [viewMode, setViewMode] = useState<MatchingViewMode>("terreno");
  const [weights, setWeights] = useState<MatchingWeights>(DEFAULT_MATCHING_WEIGHTS);
  const [busqueda, setBusqueda] = useState<string>("");
  const [scoreMinimo, setScoreMinimo] = useState<number>(0);

  // Datos base
  const [terrenos] = useState<TerrenoCompleto[]>(mockTerrenosCompletos);
  const [clientes] = useState<Cliente[]>(mockClientesCompradores);

  // Selección actual
  const [terrenoSeleccionado, setTerrenoSeleccionado] = useState<TerrenoCompleto>(
    terrenos[0]
  );
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente>(
    clientes[0]
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
    if (tId) {
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
    if (cId) {
      const foundC = clientes.find((c) => c.id === cId);
      if (foundC) {
        setClienteSeleccionado(foundC);
        setViewMode("cliente");
      }
    }

    const v = searchParams.get("view");
    if (v === "terreno" || v === "cliente" || v === "matriz") {
      setViewMode(v as MatchingViewMode);
    }
  }, [searchParams, terrenos, clientes]);

  // Cálculo de la Matriz Completa y KPIs Globales
  const matrixData = useMemo(() => {
    return calcularMatrizCompleta(terrenos, clientes, weights);
  }, [terrenos, clientes, weights]);

  // Resultados calculados para la vista Por Terreno
  const matchesPorTerreno = useMemo(() => {
    let pool = clientes.map((c) => evaluarMatch(terrenoSeleccionado, c, weights));

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      pool = pool.filter(
        (m) =>
          m.cliente.razonSocial.toLowerCase().includes(q) ||
          m.cliente.tipoCliente.toLowerCase().includes(q) ||
          (m.cliente.contactoNombre && m.cliente.contactoNombre.toLowerCase().includes(q))
      );
    }

    if (scoreMinimo > 0) {
      pool = pool.filter((m) => m.scoreMatch >= scoreMinimo);
    }

    return pool.sort((a, b) => b.scoreMatch - a.scoreMatch);
  }, [terrenoSeleccionado, clientes, weights, busqueda, scoreMinimo]);

  // Resultados calculados para la vista Por Constructora
  const matchesPorCliente = useMemo(() => {
    let pool = terrenos.map((t) => evaluarMatch(t, clienteSeleccionado, weights));

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const normQ = q.replace("terr-", "tr-");
      pool = pool.filter(
        (m) =>
          m.terreno.id.toLowerCase().includes(q) ||
          m.terreno.id.toLowerCase().includes(normQ) ||
          m.terreno.codigoInterno.toLowerCase().includes(q) ||
          m.terreno.distrito.toLowerCase().includes(q) ||
          m.terreno.direccion.toLowerCase().includes(q) ||
          m.terreno.zonificacion.toLowerCase().includes(q)
      );
    }

    if (scoreMinimo > 0) {
      pool = pool.filter((m) => m.scoreMatch >= scoreMinimo);
    }

    return pool.sort((a, b) => b.scoreMatch - a.scoreMatch);
  }, [clienteSeleccionado, terrenos, weights, busqueda, scoreMinimo]);

  // Resultados para exportar según la vista activa
  const resultadosActuales = useMemo(() => {
    if (viewMode === "terreno") return matchesPorTerreno;
    if (viewMode === "cliente") return matchesPorCliente;
    return matchesPorTerreno;
  }, [viewMode, matchesPorTerreno, matchesPorCliente]);

  const handleOpenDetail = (match: MatchEvaluationResult) => {
    setDetailMatch(match);
    setIsDetailOpen(true);
  };

  const handleStartDeal = (match: MatchEvaluationResult) => {
    setQuickDealMatch(match);
    setIsQuickDealOpen(true);
  };

  return (
    <div className="space-y-3 pb-8 font-sans">
      {/* 1. Banner Superior de KPIs Financieros y de Afinidad */}
      <MatchingKpisBanner kpis={matrixData.kpis} />

      {/* 2. Barra de Herramientas y Controles */}
      <MatchingToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        scoreMinimo={scoreMinimo}
        onScoreMinimoChange={setScoreMinimo}
        weights={weights}
        onWeightsChange={setWeights}
        resultadosActuales={resultadosActuales}
      />

      {/* 3. Vistas Operativas según Modo */}
      {viewMode === "terreno" && (
        <MatchByTerrenoView
          terrenos={terrenos}
          terrenoSeleccionado={terrenoSeleccionado}
          onSelectTerreno={setTerrenoSeleccionado}
          matches={matchesPorTerreno}
          onOpenDetail={handleOpenDetail}
          onStartDeal={handleStartDeal}
        />
      )}

      {viewMode === "cliente" && (
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

      {/* Modal de Conversión Rápida a Negociación Comercial (Módulo D) */}
      <QuickDealDialog
        match={quickDealMatch}
        open={isQuickDealOpen}
        onOpenChange={setIsQuickDealOpen}
      />
    </div>
  );
}
