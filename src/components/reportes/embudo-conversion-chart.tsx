"use client";

import React from "react";
import { EmbudoEtapaItem } from "@/types/reportes";
import { Filter, Clock, AlertTriangle, ArrowDown } from "lucide-react";

interface EmbudoConversionChartProps {
  embudo: EmbudoEtapaItem[];
}

export function EmbudoConversionChart({ embudo }: EmbudoConversionChartProps) {
  const formatM = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  };

  const maxDeals = Math.max(...embudo.map((e) => e.cantidadDeals), 1);

  return (
    <div className="bg-white border border-slate-200 rounded p-3 flex flex-col justify-between shadow-xs select-none">
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-amber-50 border border-amber-200">
            <Filter className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">
              Embudo Comercial & Velocidad de Conversión
            </h3>
            <p className="text-3xs text-slate-500 font-sans">
              Throughput de deals, capital en juego y días promedio de permanencia por etapa
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-3xs font-mono text-slate-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>SLA: Alerta si &gt;14d</span>
          </div>
        </div>
      </div>

      {/* Escalonamiento del Embudo */}
      <div className="space-y-1.5 pt-3">
        {embudo.map((etapa, idx) => {
          const widthPct = Math.max(18, (etapa.cantidadDeals / maxDeals) * 100);
          const isStagnant = etapa.diasPromedioEnEtapa > 14;

          return (
            <div key={etapa.etapa} className="space-y-0.5">
              <div className="flex items-center justify-between text-2xs font-mono">
                <div className="flex items-center space-x-1.5">
                  <span className="w-4 text-center font-bold text-slate-400">
                    #{etapa.orden}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {etapa.label}
                  </span>
                  {isStagnant && (
                    <span className="inline-flex items-center text-3xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded">
                      <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                      {etapa.diasPromedioEnEtapa}d (SLA)
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-3xs">
                  <span className="text-slate-500">
                    <strong className="text-slate-800">{etapa.cantidadDeals}</strong>{" "}
                    deals
                  </span>
                  <span className="text-slate-500">
                    Nominal:{" "}
                    <strong className="text-slate-800">
                      {formatM(etapa.volumenUSD)}
                    </strong>
                  </span>
                  <span className="text-slate-500">
                    Pond:{" "}
                    <strong className="text-blue-700">
                      {formatM(etapa.volumenPonderadoUSD)}
                    </strong>
                  </span>
                  <span className="text-slate-500 hidden sm:inline">
                    Permanencia: <strong>{etapa.diasPromedioEnEtapa}d</strong>
                  </span>
                </div>
              </div>

              {/* Barra Proporcional del Embudo */}
              <div className="w-full bg-slate-100 rounded h-4 overflow-hidden flex items-center p-0.5">
                <div
                  className={`h-full rounded transition-all flex items-center px-2 text-3xs font-mono font-bold ${
                    etapa.colorBgClass
                  } border ${etapa.colorBorderClass}`}
                  style={{ width: `${widthPct}%` }}
                >
                  <span className="truncate text-slate-800">
                    {etapa.shortLabel}: {etapa.cantidadDeals}
                  </span>
                </div>
              </div>

              {/* Indicador de Drop-off / Retención entre etapas */}
              {idx < embudo.length - 1 && (
                <div className="pl-6 flex items-center space-x-1 text-3xs font-mono text-slate-400 py-0.5">
                  <ArrowDown className="w-2.5 h-2.5 text-slate-300" />
                  <span>
                    Retención:{" "}
                    <strong className="text-slate-600">
                      {embudo[idx + 1].tasaConversionDesdeAnteriorPct}%
                    </strong>
                  </span>
                  {embudo[idx + 1].tasaAbandonoPct > 0 && (
                    <span className="text-rose-500">
                      (Fuga: -{embudo[idx + 1].tasaAbandonoPct}%)
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
