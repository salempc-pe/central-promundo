"use client";

import React from "react";
import { NegociacionCompleta } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPricePerM2 } from "@/lib/utils";
import {
  Clock,
  User,
  MoreVertical,
  Building,
  ArrowRight,
  MessageSquarePlus,
  AlertTriangle,
  GripVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DealCardProps {
  deal: NegociacionCompleta;
  onClick: (deal: NegociacionCompleta) => void;
  onRequestChangeStage: (deal: NegociacionCompleta) => void;
  onAddNote: (deal: NegociacionCompleta) => void;
  isDragging?: boolean;
}

export function DealCard({
  deal,
  onClick,
  onRequestChangeStage,
  onAddNote,
  isDragging = false,
}: DealCardProps) {
  const isEstancado =
    deal.diasEnEtapaActual > 14 &&
    deal.etapa !== "Cierre_Ganado" &&
    deal.etapa !== "Descartado";

  const isAtencion =
    deal.diasEnEtapaActual > 7 &&
    deal.diasEnEtapaActual <= 14 &&
    deal.etapa !== "Cierre_Ganado" &&
    deal.etapa !== "Descartado";

  const brokerNombre = deal.broker?.nombre || "Broker Asignado";
  const brokerInitials =
    brokerNombre
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "BA";

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", deal.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(deal)}
      className={cn(
        "cursor-pointer group relative bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all select-none rounded-xs overflow-hidden",
        isDragging && "opacity-40 scale-95 border-dashed border-blue-500",
        isEstancado && "border-l-4 border-l-rose-500",
        deal.etapa === "Cierre_Ganado" && "border-l-4 border-l-emerald-500",
        deal.etapa === "Descartado" && "opacity-75 bg-slate-50 border-l-4 border-l-slate-400"
      )}
    >
      <CardContent className="p-2 space-y-1.5">
        {/* Fila 1: Código Lote + Zonificación + Distrito + Drag Handle */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-500 cursor-grab shrink-0" />
            <span className="font-mono text-xs font-bold text-blue-600 truncate group-hover:text-blue-700">
              {deal.terreno.codigoInterno}
            </span>
            <Badge
              variant="outline"
              className="text-3xs font-mono font-bold px-1 py-0 bg-purple-50 text-purple-700 border-purple-200 shrink-0"
            >
              {deal.terreno.zonificacion}
            </Badge>
          </div>

          <span className="text-3xs font-mono text-slate-500 truncate shrink-0">
            {deal.terreno.distrito}
          </span>
        </div>

        {/* Fila 2: Constructora / Cliente + Broker Avatar */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-900">
              {deal.cliente.razonSocial}
            </div>
            <div className="text-3xs text-slate-400 font-mono truncate">
              {deal.cliente.tipoCliente}
            </div>
          </div>

          {/* Broker Initials Badge */}
          <div
            className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-mono text-3xs font-bold flex items-center justify-center shrink-0 border border-slate-300"
            title={`Broker: ${brokerNombre}`}
          >
            {brokerInitials}
          </div>
        </div>

        {/* Fila 3: Monto Oferta + Probabilidad % + SLA Días */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-2xs font-mono">
          {/* Monto de Oferta */}
          <div className="font-bold text-emerald-700 text-xs">
            {formatCurrency(deal.montoOferta, "USD")}
          </div>

          <div className="flex items-center gap-1">
            {/* Probabilidad Badge */}
            {(() => {
              const prob = deal.probabilidadCierre ?? 0;
              return (
                <span
                  className={cn(
                    "text-3xs px-1 py-0.2 rounded font-bold",
                    prob >= 80
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : prob >= 50
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : prob >= 25
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-slate-100 text-slate-700 border border-slate-300"
                  )}
                >
                  {prob}%
                </span>
              );
            })()}

            {/* Días en Etapa (SLA) */}
            <div
              className={cn(
                "flex items-center gap-0.5 text-3xs px-1 py-0.2 rounded",
                isEstancado
                  ? "bg-rose-100 text-rose-800 border border-rose-300 font-bold animate-pulse"
                  : isAtencion
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-slate-50 text-slate-500 border border-slate-200"
              )}
              title={`Días en etapa actual: ${deal.diasEnEtapaActual} días. Días totales: ${deal.diasTotales} días.`}
            >
              {isEstancado ? (
                <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
              ) : (
                <Clock className="w-2.5 h-2.5 text-slate-400" />
              )}
              <span>{deal.diasEnEtapaActual}d</span>
            </div>

            {/* Menú Rápido Contextual */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-2xs font-mono">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestChangeStage(deal);
                  }}
                  className="gap-1.5 cursor-pointer text-blue-600 font-bold"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>Avanzar / Cambiar Etapa</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNote(deal);
                  }}
                  className="gap-1.5 cursor-pointer"
                >
                  <MessageSquarePlus className="w-3 h-3" />
                  <span>Registrar Nota / Evento</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(deal);
                  }}
                  className="gap-1.5 cursor-pointer"
                >
                  <Building className="w-3 h-3" />
                  <span>Ver Ficha Completa</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
