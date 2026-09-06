"use client";

import React from "react";
import { PipelineKpis } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  GitPullRequest,
  CheckCircle2,
  Percent,
  AlertTriangle,
  Flame,
} from "lucide-react";

interface PipelineKpisProps {
  kpis: PipelineKpis | null;
  loading?: boolean;
}

export function PipelineKpisBanner({ kpis, loading }: PipelineKpisProps) {
  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-slate-100 animate-pulse rounded-xs border border-slate-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 select-none">
      {/* 1. Volumen Total Nominal */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardContent className="p-2.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-3xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Pipeline Total (Nominal)
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-900 tracking-tight">
              {formatCurrency(kpis.volumenTotalNominalUSD, "USD")}
            </div>
            <div className="text-3xs font-mono text-slate-500">
              {kpis.dealsActivos} negociaciones activas
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Pipeline Ponderado */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardContent className="p-2.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-3xs font-mono font-bold uppercase tracking-wider text-purple-700">
              Pipeline Ponderado
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-purple-800 tracking-tight">
              {formatCurrency(kpis.volumenPonderadoUSD, "USD")}
            </div>
            <div className="text-3xs font-mono text-purple-600 flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-purple-500" />
              <span>Ajustado por probabilidad</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Deals Activos & Alerta SLA */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardContent className="p-2.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-3xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Deals Activos & SLA
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{kpis.dealsActivos}</span>
              {kpis.dealsEstancados > 0 && (
                <span className="text-3xs font-mono bg-rose-100 text-rose-700 border border-rose-300 px-1 py-0.2 rounded font-bold inline-flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {kpis.dealsEstancados} estancados
                </span>
              )}
            </div>
            <div className="text-3xs font-mono text-slate-500">
              Ticket Prom: {formatCurrency(kpis.ticketPromedioUSD, "USD")}
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <GitPullRequest className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Cierres Ganados & Win Rate */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardContent className="p-2.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-3xs font-mono font-bold uppercase tracking-wider text-emerald-700">
              Cierres & Win Rate
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-emerald-800 tracking-tight flex items-center gap-1.5">
              <span>{kpis.cierresGanados} ganados</span>
              <span className="text-3xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-1 py-0.2 rounded font-bold">
                {kpis.tasaConversionPct.toFixed(1)}%
              </span>
            </div>
            <div className="text-3xs font-mono text-emerald-700">
              Cerrado: {formatCurrency(kpis.volumenCerradoUSD, "USD")}
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      {/* 5. Comisiones Proyectadas (3%) */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardContent className="p-2.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-3xs font-mono font-bold uppercase tracking-wider text-amber-700">
              Comisión Est. Promundo (3%)
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-amber-800 tracking-tight">
              {formatCurrency(kpis.comisionEstimadaTotalUSD, "USD")}
            </div>
            <div className="text-3xs font-mono text-amber-700">
              Arancel corporativo pactado
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0">
            <Percent className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
