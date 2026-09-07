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
import { getReportesDataAction } from "@/lib/actions/reportes-actions";
import { getBrokersAction } from "@/lib/actions/pipeline-actions";
import { exportarReportesAExcel } from "@/lib/export-reportes";
import { ReportesKpiBanner } from "@/components/reportes/reportes-kpi-banner";
import { ReportesToolbar } from "@/components/reportes/reportes-toolbar";
import { EvolucionFinancieraChart } from "@/components/reportes/evolucion-financiera-chart";
import { EmbudoConversionChart } from "@/components/reportes/embudo-conversion-chart";
import { RankingBrokersTable } from "@/components/reportes/ranking-brokers-table";
import { AbsorcionMercadoGrid } from "@/components/reportes/absorcion-mercado-grid";
import { ReporteEjecutivoModal } from "@/components/reportes/reporte-ejecutivo-modal";
import { TrendingUp, ShieldCheck } from "lucide-react";
import { Usuario } from "@/types";

interface ReportesClientProps {
  initialReporte?: ReporteEjecutivo | null;
  initialBrokers?: Usuario[];
}

export function ReportesClient({
  initialReporte = null,
  initialBrokers = [],
}: ReportesClientProps = {}) {
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

  const [kpis, setKpis] = useState<ReportesKpisGenerales | null>(
    initialReporte?.kpis || null
  );
  const [evolucion, setEvolucion] = useState<EvolucionPeriodo[]>(
    initialReporte?.evolucion || []
  );
  const [rankingBrokers, setRankingBrokers] = useState<RankingBrokerItem[]>(
    initialReporte?.rankingBrokers || []
  );
  const [absorcionMercado, setAbsorcionMercado] = useState<
    AbsorcionDistritoItem[]
  >(initialReporte?.absorcionMercado || []);
  const [embudo, setEmbudo] = useState<EmbudoEtapaItem[]>(
    initialReporte?.embudo || []
  );
  const [reporteEjecutivo, setReporteEjecutivo] =
    useState<ReporteEjecutivo | null>(initialReporte);

  const [brokers, setBrokers] = useState<Usuario[]>(initialBrokers);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!initialBrokers || initialBrokers.length === 0) {
      getBrokersAction().then((loaded) => {
        if (loaded && loaded.length > 0) setBrokers(loaded);
      });
    }
  }, [initialBrokers]);

  const brokersDisponibles = useMemo(() => {
    return brokers.map((u) => ({ id: u.id, nombre: u.nombre }));
  }, [brokers]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReportesDataAction(filtros);
      setKpis(data.kpis);
      setEvolucion(data.evolucion);
      setRankingBrokers(data.rankingBrokers);
      setAbsorcionMercado(data.absorcionMercado);
      setEmbudo(data.embudo);
      setReporteEjecutivo(data);
    } catch (err) {
      console.error("Error al cargar datos analíticos de reportes en PostgreSQL:", err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    // Si se modifica algún filtro, recargar desde PostgreSQL
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
                Módulo G (PostgreSQL)
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
            <span>Motor BI Reactivo PostgreSQL</span>
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

      {/* Grid Principal Fila 1: Evolución Cronológica + Embudo de Conversión */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        <div className="lg:col-span-7">
          <EvolucionFinancieraChart data={evolucion} />
        </div>
        <div className="lg:col-span-5">
          <EmbudoConversionChart embudo={embudo} />
        </div>
      </div>

      {/* Grid Principal Fila 2: League Table de Brokers + Matriz de Absorción */}
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
