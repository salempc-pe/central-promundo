"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  FiltroReportes,
  ReportesKpisGenerales,
  EvolucionPeriodo,
  RankingBrokerItem,
  AbsorcionDistritoItem,
  EmbudoEtapaItem,
  ReporteEjecutivo,
} from "@/types/reportes";
import {
  getReportesKpisGenerales,
  getEvolucionTemporal,
  getRankingBrokers,
  getAbsorcionMercado,
  getEmbudoConversion,
  getReporteEjecutivo,
} from "@/lib/services/reportes";
import { mockUsuarios } from "@/lib/mock/negociaciones-seed";
import { exportarReportesAExcel } from "@/lib/export-reportes";
import { ReportesKpiBanner } from "@/components/reportes/reportes-kpi-banner";
import { ReportesToolbar } from "@/components/reportes/reportes-toolbar";
import { EvolucionFinancieraChart } from "@/components/reportes/evolucion-financiera-chart";
import { EmbudoConversionChart } from "@/components/reportes/embudo-conversion-chart";
import { RankingBrokersTable } from "@/components/reportes/ranking-brokers-table";
import { AbsorcionMercadoGrid } from "@/components/reportes/absorcion-mercado-grid";
import { ReporteEjecutivoModal } from "@/components/reportes/reporte-ejecutivo-modal";
import { TrendingUp, ShieldCheck } from "lucide-react";

export function ReportesClient() {
  const searchParams = useSearchParams();
  const [filtros, setFiltros] = useState<FiltroReportes>({
    rangoPeriodo: "YTD",
  });

  useEffect(() => {
    const brokerId = searchParams.get("brokerId");
    const periodo =
      searchParams.get("periodo") || searchParams.get("rangoPeriodo");
    if (brokerId || periodo) {
      setFiltros((prev) => ({
        ...prev,
        brokerId: brokerId || prev.brokerId,
        rangoPeriodo: (periodo as any) || prev.rangoPeriodo,
      }));
    }
  }, [searchParams]);

  const [kpis, setKpis] = useState<ReportesKpisGenerales | null>(null);
  const [evolucion, setEvolucion] = useState<EvolucionPeriodo[]>([]);
  const [rankingBrokers, setRankingBrokers] = useState<RankingBrokerItem[]>([]);
  const [absorcionMercado, setAbsorcionMercado] = useState<
    AbsorcionDistritoItem[]
  >([]);
  const [embudo, setEmbudo] = useState<EmbudoEtapaItem[]>([]);
  const [reporteEjecutivo, setReporteEjecutivo] =
    useState<ReporteEjecutivo | null>(null);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const brokersDisponibles = useMemo(() => {
    return mockUsuarios.map((u) => ({ id: u.id, nombre: u.nombre }));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        kpisData,
        evolucionData,
        rankingData,
        absorcionData,
        embudoData,
        reporteData,
      ] = await Promise.all([
        getReportesKpisGenerales(filtros),
        getEvolucionTemporal(filtros),
        getRankingBrokers(filtros),
        getAbsorcionMercado(filtros),
        getEmbudoConversion(filtros),
        getReporteEjecutivo(filtros),
      ]);

      setKpis(kpisData);
      setEvolucion(evolucionData);
      setRankingBrokers(rankingData);
      setAbsorcionMercado(absorcionData);
      setEmbudo(embudoData);
      setReporteEjecutivo(reporteData);
    } catch (err) {
      console.error("Error al cargar datos analíticos de reportes:", err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenReporteEjecutivo = () => {
    setIsModalOpen(true);
  };

  const handleExportarExcel = () => {
    if (reporteEjecutivo) {
      exportarReportesAExcel(reporteEjecutivo);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70 overflow-y-auto select-none p-3 space-y-2.5">
      {/* Encabezado Institucional del Módulo */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded px-3.5 py-2 shadow-xs shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Métricas, Rendimiento BI & Reportes Ejecutivos
              </h1>
              <span className="text-3xs font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Módulo G
              </span>
            </div>
            <p className="text-3xs text-slate-500 font-mono">
              Consolidado de colocaciones de suelo, velocidad de ciclo, ranking de brokers y absorción territorial en Lima.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-3xs font-mono text-slate-500">
          <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Motor BI Reactivo Online</span>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <span>Arancel Base:</span>
            <strong className="text-slate-800">3.00% USD</strong>
          </div>
        </div>
      </div>

      {/* Banner de 6 KPIs Estratégicos */}
      {kpis && <ReportesKpiBanner kpis={kpis} />}

      {/* Barra de Filtros Temporales y Acciones */}
      <ReportesToolbar
        filtros={filtros}
        onFiltrosChange={setFiltros}
        onOpenReporteEjecutivo={handleOpenReporteEjecutivo}
        onExportarExcel={handleExportarExcel}
        brokersDisponibles={brokersDisponibles}
      />

      {/* Grid Principal Fila 1: Evolución Cronológica (60%) + Embudo de Conversión (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        <div className="lg:col-span-7">
          <EvolucionFinancieraChart data={evolucion} />
        </div>
        <div className="lg:col-span-5">
          <EmbudoConversionChart embudo={embudo} />
        </div>
      </div>

      {/* Grid Principal Fila 2: League Table de Brokers (55%) + Matriz de Absorción (45%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        <div className="lg:col-span-6">
          <RankingBrokersTable data={rankingBrokers} />
        </div>
        <div className="lg:col-span-6">
          <AbsorcionMercadoGrid data={absorcionMercado} />
        </div>
      </div>

      {/* Modal de Informe Ejecutivo para Comité */}
      <ReporteEjecutivoModal
        reporte={reporteEjecutivo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
