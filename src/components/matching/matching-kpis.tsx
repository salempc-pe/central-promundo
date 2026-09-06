"use client";

import React from "react";
import { MatchingKpis } from "@/types";
import { Target, CheckCircle2, TrendingUp, Building2, ShieldCheck } from "lucide-react";

interface MatchingKpisProps {
  kpis: MatchingKpis;
}

export function MatchingKpisBanner({ kpis }: MatchingKpisProps) {
  const formatearMonto = (monto: number) => {
    if (monto >= 1_000_000) {
      return `$${(monto / 1_000_000).toFixed(2)}M`;
    }
    if (monto >= 1_000) {
      return `$${(monto / 1_000).toFixed(0)}K`;
    }
    return `$${monto.toLocaleString("en-US")}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 select-none">
      {/* KPI 1: Matches Prime (>= 80%) */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Matches Prime (≥80%)</span>
          <Target className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold font-mono text-emerald-700">
            {kpis.matchesPrime}
          </span>
          <span className="text-3xs text-emerald-600 font-mono font-semibold">Alta Absorción</span>
        </div>
        <div className="text-3xs text-slate-500 font-mono mt-0.5">
          {kpis.matchesViables} matches viables (65-79%)
        </div>
      </div>

      {/* KPI 2: Lotes con Match Viable */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Lotes Colocables (≥70%)</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold font-mono text-blue-700">
            {kpis.lotesConMatchViable}
          </span>
          <span className="text-3xs text-slate-500 font-mono">
            de {kpis.totalTerrenosEvaluados} lotes
          </span>
        </div>
        <div className="text-3xs text-slate-500 font-mono mt-0.5">
          {kpis.coberturaInventarioPct}% de cartera con comprador afín
        </div>
      </div>

      {/* KPI 3: Volumen Potencial Colocable USD */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Volumen Potencial</span>
          <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold font-mono text-slate-900">
            {formatearMonto(kpis.volumenPotencialPipelineUSD)}
          </span>
          <span className="text-3xs text-slate-500 font-mono">USD</span>
        </div>
        <div className="text-3xs text-slate-500 font-mono mt-0.5">
          Lotes con compradores Prime
        </div>
      </div>

      {/* KPI 4: Constructoras Activas con Match */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Compradores Activos</span>
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold font-mono text-purple-700">
            {kpis.constructorasActivasConMatch}
          </span>
          <span className="text-3xs text-slate-500 font-mono">
            de {kpis.totalConstructorasEvaluadas} empresas
          </span>
        </div>
        <div className="text-3xs text-slate-500 font-mono mt-0.5">
          Constructoras con lotes compatibles
        </div>
      </div>

      {/* KPI 5: Cobertura de Portafolio */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Tasa de Cobertura</span>
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold font-mono text-amber-700">
            {kpis.coberturaInventarioPct}%
          </span>
          <span className="text-3xs text-slate-500 font-mono">Salud Cartera</span>
        </div>
        <div className="text-3xs text-slate-500 font-mono mt-0.5">
          Target comercial: &gt;65%
        </div>
      </div>
    </div>
  );
}
