"use client";

import React from "react";
import { ReportesKpisGenerales } from "@/types/reportes";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Clock,
  Target,
  Building2,
} from "lucide-react";

interface ReportesKpiBannerProps {
  kpis: ReportesKpisGenerales;
}

export function ReportesKpiBanner({ kpis }: ReportesKpiBannerProps) {
  const formatMonto = (monto: number) => {
    if (monto >= 1_000_000) {
      return `$${(monto / 1_000_000).toFixed(2)}M`;
    }
    if (monto >= 1_000) {
      return `$${(monto / 1_000).toFixed(0)}K`;
    }
    return `$${monto.toLocaleString("en-US")}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 select-none">
      {/* KPI 1: Volumen Transaccionado */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Volumen Transaccionado</span>
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-slate-900 leading-tight">
            {formatMonto(kpis.volumenTotalTransaccionadoUSD)}
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            USD en compraventas de suelo
          </div>
        </div>
        <div className="text-3xs text-blue-600 font-mono font-semibold mt-1">
          {kpis.totalCierresConfirmados} cierres confirmados
        </div>
      </div>

      {/* KPI 2: Aranceles Totales */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Aranceles Promundo</span>
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-emerald-700 leading-tight">
            {formatMonto(kpis.totalArancelesComisionUSD)}
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Margen neto: {formatMonto(kpis.margenNetoPromundoUSD)}
          </div>
        </div>
        <div className="text-3xs text-emerald-600 font-mono font-semibold mt-1">
          3.00% comisión corporativa
        </div>
      </div>

      {/* KPI 3: Ticket Promedio */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Ticket Promedio</span>
          <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-indigo-800 leading-tight">
            {formatMonto(kpis.ticketPromedioTransaccionUSD)}
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Promedio $/m²: ${kpis.precioPromedioM2CerradoUSD.toFixed(0)}
          </div>
        </div>
        <div className="text-3xs text-indigo-600 font-mono font-semibold mt-1">
          Por predio transaccionado
        </div>
      </div>

      {/* KPI 4: Ciclo Promedio de Venta */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Velocidad de Ciclo</span>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-amber-700 leading-tight">
            {kpis.diasPromedioCicloCierre} días
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Desde Teaser a Minuta
          </div>
        </div>
        <div className="text-3xs text-amber-600 font-mono font-semibold mt-1">
          SLA benchmark: &lt;90 días
        </div>
      </div>

      {/* KPI 5: Tasa de Conversión (Win Rate) */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Win Rate Comercial</span>
          <Target className="w-3.5 h-3.5 text-purple-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-purple-700 leading-tight">
            {kpis.tasaConversionPipelinePct}%
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Deals ganados / terminados
          </div>
        </div>
        <div className="text-3xs text-purple-600 font-mono font-semibold mt-1">
          Pipeline: {formatMonto(kpis.volumenPipelinePonderadoUSD)} pond.
        </div>
      </div>

      {/* KPI 6: Absorción de Inventario */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Absorción de Suelo</span>
          <Building2 className="w-3.5 h-3.5 text-cyan-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-slate-900 leading-tight">
            {kpis.tasaAbsorcionInventarioPct}%
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            {kpis.areaTotalTransaccionadaM2.toLocaleString("en-US")} m² colocados
          </div>
        </div>
        <div className="text-3xs text-cyan-600 font-mono font-semibold mt-1">
          {kpis.totalTerrenosVendidos} de {kpis.totalTerrenosInventario} lotes cartera
        </div>
      </div>
    </div>
  );
}
