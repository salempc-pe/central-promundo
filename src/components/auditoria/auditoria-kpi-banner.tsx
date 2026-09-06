"use client";

import React from "react";
import { AuditoriaKpis } from "@/types/auditoria";
import { ShieldCheck, AlertTriangle, Users, FileCheck } from "lucide-react";

interface AuditoriaKpiBannerProps {
  kpis: AuditoriaKpis;
}

export function AuditoriaKpiBanner({ kpis }: AuditoriaKpiBannerProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 select-none font-sans">
      {/* KPI 1: Total Eventos */}
      <div className="bg-white border border-slate-200 rounded p-3 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-3xs font-mono font-bold uppercase text-slate-500">
          <span>Bitácora Histórica</span>
          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-slate-900 leading-tight">
            {kpis.totalEventosHistoricos}
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Eventos registrados inmutables
          </div>
        </div>
        <div className="text-3xs font-mono text-blue-700 font-bold mt-1">
          +{kpis.eventosUltimas24h} operaciones en 24h
        </div>
      </div>

      {/* KPI 2: Incidentes Críticos & Seguridad */}
      <div className="bg-white border border-slate-200 rounded p-3 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-3xs font-mono font-bold uppercase text-slate-500">
          <span>Alertas & Críticos</span>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-amber-700 leading-tight">
            {kpis.eventosCriticosYSeguridad}
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Warnings, Críticos y Seguridad
          </div>
        </div>
        <div className="text-3xs font-mono text-slate-600 mt-1">
          Supervisados por Compliance
        </div>
      </div>

      {/* KPI 3: Operadores Auditados */}
      <div className="bg-white border border-slate-200 rounded p-3 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-3xs font-mono font-bold uppercase text-slate-500">
          <span>Usuarios Auditados</span>
          <Users className="w-3.5 h-3.5 text-purple-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-purple-800 leading-tight">
            {kpis.usuariosActivosAuditados}
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Brokers, admin y sistemas
          </div>
        </div>
        <div className="text-3xs font-mono text-purple-600 font-semibold mt-1">
          Trazabilidad por usuario / IP
        </div>
      </div>

      {/* KPI 4: Integridad Forense */}
      <div className="bg-white border border-slate-200 rounded p-3 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-3xs font-mono font-bold uppercase text-slate-500">
          <span>Integridad de Custodia</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-emerald-700 leading-tight">
            {kpis.porcentajeIntegridad.toFixed(1)}%
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Sin saltos de secuencia ni borrados
          </div>
        </div>
        <div className="text-3xs font-mono text-emerald-700 font-bold mt-1">
          Inmutable (Append-only)
        </div>
      </div>
    </div>
  );
}
