"use client";

import React from "react";
import { DocumentosKpis, EstadoVigencia } from "@/types/documentos";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Building,
  HardDrive,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface DocumentosKpiBannerProps {
  kpis: DocumentosKpis;
  filtroEstadoActivo?: EstadoVigencia[];
  onSelectFiltroEstado?: (estado: EstadoVigencia | null) => void;
}

export function DocumentosKpiBanner({
  kpis,
  filtroEstadoActivo = [],
  onSelectFiltroEstado,
}: DocumentosKpiBannerProps) {
  const isVigenteActive = filtroEstadoActivo.includes("vigente");
  const isPorVencerActive = filtroEstadoActivo.includes("por_vencer");
  const isVencidoActive = filtroEstadoActivo.includes("vencido");

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 select-none">
      {/* KPI 1: TOTAL DOCUMENTOS */}
      <Card
        onClick={() => onSelectFiltroEstado && onSelectFiltroEstado(null)}
        className={`bg-white border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition-all ${
          filtroEstadoActivo.length === 0 ? "ring-2 ring-blue-500/60" : ""
        }`}
      >
        <CardContent className="p-2.5 flex items-center justify-between">
          <div>
            <div className="text-3xs font-mono text-slate-500 uppercase tracking-wider font-bold">
              Total Archivos
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {kpis.totalDocumentos}
            </div>
            <div className="text-3xs font-mono text-slate-500 flex items-center gap-1 mt-0.5">
              <HardDrive className="w-2.5 h-2.5" />
              <span>{formatBytes(kpis.espacioUtilizadoBytes)}</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xs bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <FileText className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* KPI 2: CPUS VIGENTES */}
      <Card
        onClick={() => onSelectFiltroEstado && onSelectFiltroEstado("vigente")}
        className={`bg-white border-slate-200 shadow-xs cursor-pointer hover:border-emerald-300 transition-all ${
          isVigenteActive ? "ring-2 ring-emerald-500 bg-emerald-50/30" : ""
        }`}
      >
        <CardContent className="p-2.5 flex items-center justify-between">
          <div>
            <div className="text-3xs font-mono text-emerald-700 uppercase tracking-wider font-bold">
              CPUs Vigentes
            </div>
            <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
              {kpis.cpusVigentes}
            </div>
            <div className="text-3xs font-mono text-slate-500 mt-0.5">
              De {kpis.totalCpus} certificados
            </div>
          </div>
          <div className="w-8 h-8 rounded-xs bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* KPI 3: CPUS POR VENCER (ALERTA ÁMBAR) */}
      <Card
        onClick={() => onSelectFiltroEstado && onSelectFiltroEstado("por_vencer")}
        className={`bg-white border-slate-200 shadow-xs cursor-pointer hover:border-amber-300 transition-all ${
          isPorVencerActive ? "ring-2 ring-amber-500 bg-amber-50/30" : ""
        }`}
      >
        <CardContent className="p-2.5 flex items-center justify-between">
          <div>
            <div className="text-3xs font-mono text-amber-700 uppercase tracking-wider font-bold">
              Por Vencer (≤ 60d)
            </div>
            <div className="text-lg font-bold font-mono text-amber-700 mt-0.5 flex items-center gap-1.5">
              <span>{kpis.cpusPorVencer}</span>
              {kpis.cpusPorVencer > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <div className="text-3xs font-mono text-amber-600 mt-0.5">
              Requiere renovación
            </div>
          </div>
          <div className="w-8 h-8 rounded-xs bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* KPI 4: CPUS VENCIDOS (CRÍTICO ROJO) */}
      <Card
        onClick={() => onSelectFiltroEstado && onSelectFiltroEstado("vencido")}
        className={`bg-white border-slate-200 shadow-xs cursor-pointer hover:border-rose-300 transition-all ${
          isVencidoActive ? "ring-2 ring-rose-500 bg-rose-50/30" : ""
        }`}
      >
        <CardContent className="p-2.5 flex items-center justify-between">
          <div>
            <div className="text-3xs font-mono text-rose-700 uppercase tracking-wider font-bold">
              CPUs Vencidos
            </div>
            <div className="text-lg font-bold font-mono text-rose-700 mt-0.5">
              {kpis.cpusVencidos}
            </div>
            <div className="text-3xs font-mono text-rose-600 mt-0.5">
              Parámetros caducos
            </div>
          </div>
          <div className="w-8 h-8 rounded-xs bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* KPI 5: TERRENOS SIN CPU */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardContent className="p-2.5 flex items-center justify-between">
          <div>
            <div className="text-3xs font-mono text-slate-500 uppercase tracking-wider font-bold">
              Lotes sin CPU
            </div>
            <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">
              {kpis.terrenosSinCpu}
            </div>
            <div className="text-3xs font-mono text-slate-500 mt-0.5">
              Sin certificado adjunto
            </div>
          </div>
          <div className="w-8 h-8 rounded-xs bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <Building className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
