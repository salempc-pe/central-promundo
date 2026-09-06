"use client";

import React from "react";
import { ComisionesKpis } from "@/types/comisiones";
import {
  DollarSign,
  Landmark,
  FileSpreadsheet,
  Clock,
  Users,
  Briefcase,
} from "lucide-react";

interface ComisionesKpiBannerProps {
  kpis: ComisionesKpis;
}

export function ComisionesKpiBanner({ kpis }: ComisionesKpiBannerProps) {
  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(monto);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 select-none">
      {/* KPI 1: Total Comisiones Pactadas */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Aranceles Totales</span>
          <DollarSign className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-slate-900 leading-tight">
            {formatMonto(kpis.totalComisionesPactadasUSD)}
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Volumen: {formatMonto(kpis.volumenTotalVentasUSD)}
          </div>
        </div>
        <div className="text-3xs text-blue-600 font-mono font-semibold mt-1">
          {kpis.totalCierres} cierres comerciales
        </div>
      </div>

      {/* KPI 2: Cobrado en Banco */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Cobrado en Banco</span>
          <Landmark className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-emerald-700 leading-tight">
            {formatMonto(kpis.totalCobradoEnBancoUSD)}
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Fondos acreditados Cta Cte
          </div>
        </div>
        <div className="text-3xs text-emerald-600 font-mono font-semibold mt-1">
          {kpis.porEstado.Cobrado.count + kpis.porEstado.Liquidado.count} operac. confirmadas
        </div>
      </div>

      {/* KPI 3: Facturado por Cobrar */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Facturado por Cobrar</span>
          <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-amber-700 leading-tight">
            {formatMonto(kpis.totalFacturadoPorCobrarUSD)}
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Crédito comercial 15-30d
          </div>
        </div>
        <div className="text-3xs text-amber-600 font-mono font-semibold mt-1">
          {kpis.porEstado.Facturado.count} facturas emitidas
        </div>
      </div>

      {/* KPI 4: Pendiente de Facturar */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Pendiente Facturar</span>
          <Clock className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-slate-800 leading-tight">
            {formatMonto(kpis.totalPendienteFacturacionUSD)}
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Minutas suscritas
          </div>
        </div>
        <div className="text-3xs text-slate-600 font-mono font-semibold mt-1">
          {kpis.porEstado.Pendiente.count} en preparación
        </div>
      </div>

      {/* KPI 5: Liquidado a Brokers */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Liquidado Brokers</span>
          <Users className="w-3.5 h-3.5 text-purple-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-purple-700 leading-tight">
            {formatMonto(kpis.totalLiquidadoBrokersUSD)}
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            Pendiente: {formatMonto(kpis.totalPendienteLiquidacionBrokersUSD)}
          </div>
        </div>
        <div className="text-3xs text-purple-600 font-mono font-semibold mt-1">
          {kpis.porEstado.Liquidado.count} honorarios transferidos
        </div>
      </div>

      {/* KPI 6: Margen Neto Promundo */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 text-3xs font-mono uppercase tracking-wider font-bold">
          <span>Margen Promundo</span>
          <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold font-mono text-indigo-700 leading-tight">
            {formatMonto(kpis.margenNetoRetenidoPromundoUSD)}
          </div>
          <div className="text-3xs text-slate-500 font-mono mt-0.5">
            50% retención neta empresa
          </div>
        </div>
        <div className="text-3xs text-indigo-600 font-mono font-semibold mt-1">
          Split comercial 50/50
        </div>
      </div>
    </div>
  );
}
