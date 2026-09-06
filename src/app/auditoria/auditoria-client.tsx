"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  EventoAuditoriaGlobal,
  AuditoriaFiltros,
  AuditoriaKpis,
  ModuloSistema,
} from "@/types/auditoria";
import {
  getEventosAuditoria,
  getAuditoriaKpis,
  subscribeAuditoria,
} from "@/lib/services/auditoria";
import { exportarAuditoriaACSV } from "@/lib/export-auditoria";
import { AuditoriaKpiBanner } from "@/components/auditoria/auditoria-kpi-banner";
import { AuditoriaToolbar } from "@/components/auditoria/auditoria-toolbar";
import { AuditoriaTable } from "@/components/auditoria/auditoria-table";
import { AuditoriaDiffSheet } from "@/components/auditoria/auditoria-diff-sheet";
import { ShieldAlert, CheckCircle2, Lock } from "lucide-react";

export function AuditoriaClient() {
  const searchParams = useSearchParams();
  const [filtros, setFiltros] = useState<AuditoriaFiltros>({});
  const [eventos, setEventos] = useState<EventoAuditoriaGlobal[]>([]);
  const [kpis, setKpis] = useState<AuditoriaKpis | null>(null);
  const [selectedEvento, setSelectedEvento] =
    useState<EventoAuditoriaGlobal | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q =
      searchParams.get("q") ||
      searchParams.get("busqueda") ||
      searchParams.get("entidadId");
    const modulo = searchParams.get("modulo");
    if (q || modulo) {
      setFiltros((prev) => ({
        ...prev,
        busqueda: q || prev.busqueda,
        modulo: modulo ? [modulo as ModuloSistema] : prev.modulo,
      }));
    }
  }, [searchParams]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventosData, kpisData] = await Promise.all([
        getEventosAuditoria(filtros),
        getAuditoriaKpis(),
      ]);
      setEventos(eventosData);
      setKpis(kpisData);
    } catch (err) {
      console.error("Error al cargar datos de auditoría:", err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Suscripción reactiva en tiempo real a nuevos logs
  useEffect(() => {
    const unsubscribe = subscribeAuditoria(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [loadData]);

  const handleSelectEvento = (evento: EventoAuditoriaGlobal) => {
    setSelectedEvento(evento);
    setIsDiffOpen(true);
  };

  const handleExportarCSV = () => {
    exportarAuditoriaACSV(eventos);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70 overflow-y-auto select-none p-3 space-y-3 font-sans">
      {/* Encabezado Institucional */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded px-3.5 py-2 shadow-xs shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-purple-700 rounded flex items-center justify-center text-white shadow-xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Auditoría Forense & Trazabilidad Global
              </h1>
              <span className="text-3xs font-mono font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                Módulo H2
              </span>
            </div>
            <p className="text-3xs text-slate-500 font-mono">
              Bitácora append-only inmutable de transacciones, mutaciones de suelo y control fiduciario.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-3xs font-mono text-slate-500">
          <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cadena de Custodia 100% Inmutable</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1">
            <span>Cumplimiento:</span>
            <strong className="text-slate-800">PLAFT / SMV</strong>
          </div>
        </div>
      </div>

      {/* Banner de 4 KPIs Forenses */}
      {kpis && <AuditoriaKpiBanner kpis={kpis} />}

      {/* Barra de Filtros y Búsqueda */}
      <AuditoriaToolbar
        filtros={filtros}
        onFiltrosChange={setFiltros}
        onExportarCSV={handleExportarCSV}
        totalEventosFiltrados={eventos.length}
      />

      {/* Data Grid TanStack Table v8 de Auditoría */}
      <AuditoriaTable
        data={eventos}
        onSelectEvento={handleSelectEvento}
      />

      {/* Drawer / Modal de Inspección Forense de Diff */}
      <AuditoriaDiffSheet
        evento={selectedEvento}
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
      />
    </div>
  );
}
