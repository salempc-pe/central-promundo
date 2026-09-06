"use client";

import React from "react";
import { AbsorcionDistritoItem } from "@/types/reportes";
import { MapPin, Building2, CheckCircle2 } from "lucide-react";

interface AbsorcionMercadoGridProps {
  data: AbsorcionDistritoItem[];
}

export function AbsorcionMercadoGrid({ data }: AbsorcionMercadoGridProps) {
  const formatUSD = (monto: number) => {
    if (monto >= 1_000_000) return `$${(monto / 1_000_000).toFixed(2)}M`;
    if (monto >= 1_000) return `$${(monto / 1_000).toFixed(0)}K`;
    return `$${monto.toLocaleString()}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded p-3 flex flex-col justify-between shadow-xs select-none">
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-cyan-50 border border-cyan-200">
            <MapPin className="w-4 h-4 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">
              Matriz Territorial de Absorción de Suelo en Lima
            </h3>
            <p className="text-3xs text-slate-500 font-sans">
              Concentración de demanda, m² colocados y liquidez de predios por distrito y zonificación
            </p>
          </div>
        </div>

        <div className="text-3xs font-mono text-slate-500">
          Cobertura en Lima Metropolitana
        </div>
      </div>

      {/* Tabla de Absorción Territorial */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-mono font-bold text-slate-600 uppercase">
              <th className="py-1.5 px-2">Distrito</th>
              <th className="py-1.5 px-2 text-center">Lotes</th>
              <th className="py-1.5 px-2 text-center">Vendidos</th>
              <th className="py-1.5 px-2 text-center">En Negoc.</th>
              <th className="py-1.5 px-2 text-center">Disponibles</th>
              <th className="py-1.5 px-2 text-center">Absorción</th>
              <th className="py-1.5 px-2 text-right">Área m² (Vendida/Total)</th>
              <th className="py-1.5 px-2 text-right">Precio Medio $/m²</th>
              <th className="py-1.5 px-2 text-right">Volumen Vendido</th>
              <th className="py-1.5 px-2">Zonificación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-2xs">
            {data.map((item) => {
              let absorcionBadgeClass =
                "bg-slate-100 text-slate-700 border-slate-200";
              if (item.tasaAbsorcionPct >= 50) {
                absorcionBadgeClass =
                  "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
              } else if (item.tasaAbsorcionPct > 0) {
                absorcionBadgeClass =
                  "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
              }

              return (
                <tr
                  key={item.distrito}
                  className="h-8.5 hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-1 px-2 font-sans font-semibold text-slate-800">
                    {item.distrito}
                  </td>
                  <td className="py-1 px-2 text-center text-slate-600">
                    {item.totalLotes}
                  </td>
                  <td className="py-1 px-2 text-center font-bold text-emerald-700">
                    {item.lotesVendidos}
                  </td>
                  <td className="py-1 px-2 text-center text-amber-700">
                    {item.lotesEnNegociacion}
                  </td>
                  <td className="py-1 px-2 text-center text-blue-700">
                    {item.lotesDisponibles}
                  </td>
                  <td className="py-1 px-2 text-center">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-3xs border ${absorcionBadgeClass}`}
                    >
                      {item.tasaAbsorcionPct}%
                    </span>
                  </td>
                  <td className="py-1 px-2 text-right text-slate-700">
                    <strong className="text-slate-900">
                      {item.areaVendidaM2.toLocaleString()}
                    </strong>{" "}
                    / {item.areaTotalM2.toLocaleString()} m²
                  </td>
                  <td className="py-1 px-2 text-right text-slate-700">
                    ${item.precioM2PromedioUSD.toFixed(0)}
                  </td>
                  <td className="py-1 px-2 text-right font-bold text-slate-900">
                    {formatUSD(item.volumenTotalTransaccionadoUSD)}
                  </td>
                  <td className="py-1 px-2">
                    <div className="flex flex-wrap gap-1">
                      {item.zonificacionesPrincipales.map((z) => (
                        <span
                          key={z.zonificacion}
                          className="px-1 py-0.2 rounded text-3xs bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {z.zonificacion} ({z.cantidad})
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
