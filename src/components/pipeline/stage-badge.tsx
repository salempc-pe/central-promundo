"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { EtapaNegociacion, ETAPAS_CONFIG } from "@/types";
import { cn } from "@/lib/utils";

interface StageBadgeProps {
  etapa: EtapaNegociacion | string;
  className?: string;
  showDot?: boolean;
}

export function StageBadge({
  etapa,
  className,
  showDot = true,
}: StageBadgeProps) {
  const config = ETAPAS_CONFIG[etapa as EtapaNegociacion];

  if (!config) {
    return (
      <Badge variant="outline" className={cn("text-3xs font-mono", className)}>
        {etapa}
      </Badge>
    );
  }

  return (
    <Badge
      variant={config.badgeVariant}
      className={cn(
        "text-3xs font-mono font-semibold px-1.5 py-0.5 inline-flex items-center gap-1",
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            etapa === "Cierre_Ganado"
              ? "bg-emerald-400"
              : etapa === "Descartado"
              ? "bg-rose-400"
              : etapa === "Due_Diligence"
              ? "bg-purple-400"
              : etapa === "LOI_Oferta"
              ? "bg-amber-400"
              : etapa === "Visita_Realizada"
              ? "bg-indigo-400"
              : etapa === "En_Evaluacion"
              ? "bg-blue-400"
              : "bg-slate-400"
          )}
        />
      )}
      <span>{config.shortLabel}</span>
    </Badge>
  );
}
