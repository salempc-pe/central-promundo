"use client";

import React, { useState } from "react";
import {
  EtapaNegociacion,
  ETAPAS_CONFIG,
  NegociacionCompleta,
} from "@/types";
import { DealCard } from "./deal-card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  etapaId: EtapaNegociacion;
  deals: NegociacionCompleta[];
  onDealClick: (deal: NegociacionCompleta) => void;
  onRequestChangeStage: (deal: NegociacionCompleta, targetStage?: EtapaNegociacion) => void;
  onAddNote: (deal: NegociacionCompleta) => void;
  onDropDeal: (dealId: string, targetEtapa: EtapaNegociacion) => void;
}

export function KanbanColumn({
  etapaId,
  deals,
  onDealClick,
  onRequestChangeStage,
  onAddNote,
  onDropDeal,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const config = ETAPAS_CONFIG[etapaId];

  const totalUSD = deals.reduce((sum, d) => sum + Number(d.montoOferta || 0), 0);
  const ponderadoUSD = deals.reduce(
    (sum, d) =>
      sum + Number(d.montoOferta || 0) * ((d.probabilidadCierre || 0) / 100),
    0
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const dealId = e.dataTransfer.getData("text/plain");
    if (dealId) {
      onDropDeal(dealId, etapaId);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col flex-1 min-w-[260px] max-w-[320px] bg-slate-100/90 border border-slate-200 rounded-xs shadow-xs transition-all select-none overflow-hidden",
        isOver && "ring-2 ring-blue-500 bg-blue-50/50 border-blue-400"
      )}
    >
      {/* Cabecera de Columna */}
      <div
        className={cn(
          "p-2 bg-white border-b border-slate-200 text-slate-800 shrink-0 border-t-2",
          etapaId === "Cierre_Ganado"
            ? "border-t-emerald-500"
            : etapaId === "Descartado"
            ? "border-t-rose-500"
            : etapaId === "Due_Diligence"
            ? "border-t-purple-500"
            : etapaId === "LOI_Oferta"
            ? "border-t-amber-500"
            : etapaId === "Visita_Realizada"
            ? "border-t-indigo-500"
            : etapaId === "En_Evaluacion"
            ? "border-t-blue-500"
            : "border-t-slate-400"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono text-xs font-bold truncate text-slate-900">
              {config.label}
            </span>
            <span className="text-3xs font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full border border-slate-200">
              {deals.length}
            </span>
          </div>

          <span className="text-3xs font-mono text-slate-500">
            {config.probabilidadDefault}% prob
          </span>
        </div>

        {/* Métricas de Columna */}
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 text-3xs font-mono">
          <span className="text-emerald-700 font-bold">
            {formatCurrency(totalUSD, "USD")}
          </span>
          <span className="text-slate-500" title="Volumen Ponderado">
            Pond: {formatCurrency(ponderadoUSD, "USD")}
          </span>
        </div>
      </div>

      {/* Lista de Tarjetas con Scroll */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[350px] max-h-[calc(100vh-280px)]">
        {deals.length === 0 ? (
          <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded text-slate-400 text-2xs font-mono p-3 text-center">
            <span>Sin oportunidades</span>
            <span className="text-3xs text-slate-400 mt-0.5">
              Arrastra un deal aquí
            </span>
          </div>
        ) : (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onClick={onDealClick}
              onRequestChangeStage={(d) => onRequestChangeStage(d, etapaId)}
              onAddNote={onAddNote}
            />
          ))
        )}
      </div>
    </div>
  );
}
