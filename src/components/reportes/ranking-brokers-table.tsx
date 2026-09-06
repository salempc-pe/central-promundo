"use client";

import React from "react";
import Link from "next/link";
import { RankingBrokerItem } from "@/types/reportes";
import { Trophy, Award, User, Target, TrendingUp } from "lucide-react";

interface RankingBrokersTableProps {
  data: RankingBrokerItem[];
}

export function RankingBrokersTable({ data }: RankingBrokersTableProps) {
  const formatUSD = (monto: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const getPositionBadge = (pos: number) => {
    switch (pos) {
      case 1:
        return (
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold font-mono text-3xs flex items-center justify-center">
            #1
          </span>
        );
      case 2:
        return (
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-bold font-mono text-3xs flex items-center justify-center">
            #2
          </span>
        );
      case 3:
        return (
          <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 border border-orange-300 font-bold font-mono text-3xs flex items-center justify-center">
            #3
          </span>
        );
      default:
        return (
          <span className="w-5 h-5 rounded-full bg-slate-50 text-slate-500 font-mono text-3xs flex items-center justify-center">
            #{pos}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded p-3 flex flex-col justify-between shadow-xs select-none">
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-purple-50 border border-purple-200">
            <Trophy className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">
              League Table — Ranking de Brokers & Cumplimiento de Cuota
            </h3>
            <p className="text-3xs text-slate-500 font-sans">
              Producción individual de suelo, aranceles generados y avance sobre meta trimestral
            </p>
          </div>
        </div>

        <div className="text-3xs font-mono text-slate-500">
          Metas: Senior $15M • Junior $8M
        </div>
      </div>

      {/* Tabla de Rendimiento */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-mono font-bold text-slate-600 uppercase">
              <th className="py-1.5 px-2">Pos</th>
              <th className="py-1.5 px-2">Broker</th>
              <th className="py-1.5 px-2 text-center">Deals</th>
              <th className="py-1.5 px-2 text-center">Ganados</th>
              <th className="py-1.5 px-2 text-center">Win Rate</th>
              <th className="py-1.5 px-2 text-right">Volumen Colocado</th>
              <th className="py-1.5 px-2 text-right">Arancel 3%</th>
              <th className="py-1.5 px-2 text-right">Neto Broker</th>
              <th className="py-1.5 px-2 text-center">Ciclo</th>
              <th className="py-1.5 px-2 min-w-[130px]">Cumplimiento Cuota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-2xs">
            {data.map((broker, idx) => {
              const pos = idx + 1;
              const cuotaRatio = Math.min(100, broker.cumplimientoCuotaPct);

              let cuotaColor = "bg-blue-600";
              let cuotaTextColor = "text-blue-700";
              if (broker.cumplimientoCuotaPct >= 100) {
                cuotaColor = "bg-emerald-600";
                cuotaTextColor = "text-emerald-700 font-bold";
              } else if (broker.cumplimientoCuotaPct < 60) {
                cuotaColor = "bg-amber-500";
                cuotaTextColor = "text-amber-700";
              }

              return (
                <tr key={broker.brokerId} className="h-9 hover:bg-slate-50/70 transition-colors">
                  <td className="py-1 px-2">{getPositionBadge(pos)}</td>
                  <td className="py-1 px-2">
                    <Link
                      href={`/pipeline?q=${encodeURIComponent(broker.brokerNombre)}`}
                      className="flex items-center space-x-1.5 font-sans group cursor-pointer"
                      title="Ver deals del broker en Pipeline"
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-mono font-bold text-3xs text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:border-blue-300 transition-colors">
                        {broker.brokerNombre[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 leading-tight group-hover:text-blue-700 group-hover:underline">
                          {broker.brokerNombre}
                        </span>
                        <span className="text-3xs text-slate-500 font-mono uppercase">
                          {broker.brokerRol.replace("_", " ")}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="py-1 px-2 text-center text-slate-700">
                    <Link
                      href={`/pipeline?q=${encodeURIComponent(broker.brokerNombre)}`}
                      className="hover:text-blue-700 hover:underline"
                    >
                      {broker.dealsAsignados} ({broker.dealsActivos} act)
                    </Link>
                  </td>
                  <td className="py-1 px-2 text-center font-bold text-emerald-700">
                    <Link
                      href={`/pipeline?q=${encodeURIComponent(broker.brokerNombre)}&etapa=Cierre_Ganado`}
                      className="hover:underline"
                    >
                      {broker.cierresGanados}
                    </Link>
                  </td>
                  <td className="py-1 px-2 text-center">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {broker.tasaConversionPct}%
                    </span>
                  </td>
                  <td className="py-1 px-2 text-right font-bold text-slate-900">
                    {formatUSD(broker.volumenTransaccionadoUSD)}
                  </td>
                  <td className="py-1 px-2 text-right text-emerald-700 font-bold">
                    <Link
                      href={`/comisiones?brokerId=${broker.brokerId}`}
                      className="hover:underline"
                      title="Ver comisiones de este broker"
                    >
                      {formatUSD(broker.comisionesGeneradasUSD)}
                    </Link>
                  </td>
                  <td className="py-1 px-2 text-right text-purple-800">
                    <Link
                      href={`/comisiones?brokerId=${broker.brokerId}`}
                      className="hover:underline"
                      title="Ver comisiones de este broker"
                    >
                      {formatUSD(broker.honorariosNetosBrokerUSD)}
                    </Link>
                  </td>
                  <td className="py-1 px-2 text-center text-slate-600">
                    {broker.diasPromedioCierre}d
                  </td>
                  <td className="py-1 px-2">
                    <div className="flex flex-col space-y-0.5">
                      <div className="flex justify-between text-3xs">
                        <span className={cuotaTextColor}>
                          {broker.cumplimientoCuotaPct}%
                        </span>
                        <span className="text-slate-400">
                          Meta {formatUSD(broker.cuotaObjetivoUSD)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${cuotaColor}`}
                          style={{ width: `${cuotaRatio}%` }}
                        />
                      </div>
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
