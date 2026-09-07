"use client";

import React, { useState } from "react";
import { NegociacionCompleta } from "@/types";
import { StageBadge } from "./stage-badge";
import { formatCurrency, formatPricePerM2 } from "@/lib/utils";
import {
  Clock,
  ArrowRight,
  Eye,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PipelineTableViewProps {
  deals: NegociacionCompleta[];
  onDealClick: (deal: NegociacionCompleta) => void;
  onRequestChangeStage: (deal: NegociacionCompleta) => void;
}

type SortField =
  | "codigo"
  | "distrito"
  | "cliente"
  | "broker"
  | "etapa"
  | "dias"
  | "monto"
  | "probabilidad"
  | "ponderado";

export function PipelineTableView({
  deals,
  onDealClick,
  onRequestChangeStage,
}: PipelineTableViewProps) {
  const [sortField, setSortField] = useState<SortField>("dias");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedDeals = [...deals].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "codigo":
        comparison = a.terreno.codigoInterno.localeCompare(b.terreno.codigoInterno);
        break;
      case "distrito":
        comparison = a.terreno.distrito.localeCompare(b.terreno.distrito);
        break;
      case "cliente":
        comparison = a.cliente.razonSocial.localeCompare(b.cliente.razonSocial);
        break;
      case "broker":
        comparison = (a.broker?.nombre || "").localeCompare(b.broker?.nombre || "");
        break;
      case "etapa":
        comparison = a.etapa.localeCompare(b.etapa);
        break;
      case "dias":
        comparison = a.diasEnEtapaActual - b.diasEnEtapaActual;
        break;
      case "monto":
        comparison = Number(a.montoOferta || 0) - Number(b.montoOferta || 0);
        break;
      case "probabilidad":
        comparison = (a.probabilidadCierre || 0) - (b.probabilidadCierre || 0);
        break;
      case "ponderado":
        const pondA = Number(a.montoOferta || 0) * ((a.probabilidadCierre || 0) / 100);
        const pondB = Number(b.montoOferta || 0) * ((b.probabilidadCierre || 0) / 100);
        comparison = pondA - pondB;
        break;
    }
    return sortAsc ? comparison : -comparison;
  });

  return (
    <div className="flex-1 overflow-auto bg-white border-t border-slate-200 select-none">
      <table className="w-full text-left border-collapse font-sans text-xs">
        <thead className="bg-slate-100 text-slate-700 font-mono text-3xs uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
          <tr>
            <th
              className="py-2 px-2.5 cursor-pointer hover:text-slate-900"
              onClick={() => handleSort("codigo")}
            >
              <div className="flex items-center gap-1">
                <span>Código</span>
                <ArrowUpDown className="w-2.5 h-2.5" />
              </div>
            </th>
            <th
              className="py-2 px-2.5 cursor-pointer hover:text-slate-900"
              onClick={() => handleSort("distrito")}
            >
              <div className="flex items-center gap-1">
                <span>Distrito / Zonif</span>
                <ArrowUpDown className="w-2.5 h-2.5" />
              </div>
            </th>
            <th
              className="py-2 px-2.5 cursor-pointer hover:text-slate-900"
              onClick={() => handleSort("cliente")}
            >
              <div className="flex items-center gap-1">
                <span>Constructora / Cliente</span>
                <ArrowUpDown className="w-2.5 h-2.5" />
              </div>
            </th>
            <th
              className="py-2 px-2.5 cursor-pointer hover:text-slate-900"
              onClick={() => handleSort("broker")}
            >
              <div className="flex items-center gap-1">
                <span>Broker</span>
                <ArrowUpDown className="w-2.5 h-2.5" />
              </div>
            </th>
            <th
              className="py-2 px-2.5 cursor-pointer hover:text-slate-900"
              onClick={() => handleSort("etapa")}
            >
              <div className="flex items-center gap-1">
                <span>Etapa Actual</span>
                <ArrowUpDown className="w-2.5 h-2.5" />
              </div>
            </th>
            <th
              className="py-2 px-2.5 cursor-pointer hover:text-slate-900 text-center"
              onClick={() => handleSort("dias")}
            >
              <div className="flex items-center justify-center gap-1">
                <span>SLA (Días)</span>
                <ArrowUpDown className="w-2.5 h-2.5" />
              </div>
            </th>
            <th
              className="py-2 px-2.5 cursor-pointer hover:text-slate-900 text-right"
              onClick={() => handleSort("monto")}
            >
              <div className="flex items-center justify-end gap-1">
                <span>Oferta (USD)</span>
                <ArrowUpDown className="w-2.5 h-2.5" />
              </div>
            </th>
            <th
              className="py-2 px-2.5 cursor-pointer hover:text-slate-900 text-center"
              onClick={() => handleSort("probabilidad")}
            >
              <div className="flex items-center justify-center gap-1">
                <span>Prob.</span>
                <ArrowUpDown className="w-2.5 h-2.5" />
              </div>
            </th>
            <th
              className="py-2 px-2.5 cursor-pointer hover:text-slate-900 text-right"
              onClick={() => handleSort("ponderado")}
            >
              <div className="flex items-center justify-end gap-1">
                <span>Ponderado (USD)</span>
                <ArrowUpDown className="w-2.5 h-2.5" />
              </div>
            </th>
            <th className="py-2 px-2.5 text-right">Comisión (3%)</th>
            <th className="py-2 px-2.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {sortedDeals.length === 0 ? (
            <tr>
              <td colSpan={11} className="p-8 text-center text-slate-400 font-mono text-xs">
                No se encontraron negociaciones con los filtros seleccionados.
              </td>
            </tr>
          ) : (
            sortedDeals.map((deal) => {
              const isEstancado =
                deal.diasEnEtapaActual > 14 &&
                deal.etapa !== "Cierre_Ganado" &&
                deal.etapa !== "Descartado";
              const ponderado =
                Number(deal.montoOferta || 0) * ((deal.probabilidadCierre || 0) / 100);
              const comision = Number(deal.montoOferta || 0) * 0.03;

              return (
                <tr
                  key={deal.id}
                  onClick={() => onDealClick(deal)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors group h-9"
                >
                  <td className="py-1.5 px-2.5 font-mono text-xs font-bold text-blue-600 group-hover:text-blue-700">
                    {deal.terreno.codigoInterno}
                  </td>
                  <td className="py-1.5 px-2.5 font-mono text-2xs">
                    <span className="font-semibold text-slate-800">{deal.terreno.distrito}</span>{" "}
                    <Badge variant="outline" className="text-3xs px-1 py-0 bg-purple-50 text-purple-700">
                      {deal.terreno.zonificacion}
                    </Badge>
                  </td>
                  <td className="py-1.5 px-2.5 font-medium text-slate-900 text-xs truncate max-w-[180px]">
                    {deal.cliente.razonSocial}
                  </td>
                  <td className="py-1.5 px-2.5 font-mono text-2xs text-slate-700 truncate max-w-[120px]">
                    {deal.broker?.nombre || "Sin Asignar"}
                  </td>
                  <td className="py-1.5 px-2.5">
                    <StageBadge etapa={deal.etapa} />
                  </td>
                  <td className="py-1.5 px-2.5 text-center font-mono text-2xs">
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-3xs font-bold",
                        isEstancado
                          ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                          : deal.diasEnEtapaActual > 7
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      )}
                    >
                      {isEstancado && <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />}
                      {deal.diasEnEtapaActual}d
                    </span>
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono text-xs font-bold text-emerald-700">
                    {formatCurrency(deal.montoOferta, "USD")}
                  </td>
                  <td className="py-1.5 px-2.5 text-center font-mono text-2xs font-bold text-blue-700">
                    {deal.probabilidadCierre}%
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono text-2xs font-bold text-purple-700">
                    {formatCurrency(ponderado, "USD")}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono text-2xs font-bold text-amber-700">
                    {formatCurrency(comision, "USD")}
                  </td>
                  <td className="py-1.5 px-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRequestChangeStage(deal)}
                        className="h-6 text-3xs font-mono px-1.5 gap-1 bg-white hover:bg-blue-50 text-blue-700 border-blue-200"
                      >
                        <ArrowRight className="w-2.5 h-2.5" />
                        <span>Mover</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDealClick(deal)}
                        className="h-6 w-6 p-0 text-slate-500 hover:text-slate-900"
                        title="Ver detalle"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
