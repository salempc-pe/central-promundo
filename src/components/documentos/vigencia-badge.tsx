"use client";

import React from "react";
import { EstadoVigencia } from "@/types/documentos";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck, HelpCircle } from "lucide-react";
import { formatDateSpanish } from "@/lib/utils";

interface VigenciaBadgeProps {
  estadoVigencia: EstadoVigencia;
  diasParaVencer?: number | null;
  fechaVencimiento?: string | Date | null;
  className?: string;
  showDetails?: boolean;
}

export function VigenciaBadge({
  estadoVigencia,
  diasParaVencer,
  fechaVencimiento,
  className = "",
  showDetails = true,
}: VigenciaBadgeProps) {
  const getBadgeContent = () => {
    switch (estadoVigencia) {
      case "vigente": {
        let label = "Vigente";
        if (showDetails && diasParaVencer !== undefined && diasParaVencer !== null) {
          if (diasParaVencer > 365) {
            const anios = (diasParaVencer / 365).toFixed(1);
            label = `Vigente (${anios} años)`;
          } else if (diasParaVencer > 60) {
            const meses = Math.floor(diasParaVencer / 30);
            label = `Vigente (${meses}m)`;
          } else {
            label = `Vigente (${diasParaVencer}d)`;
          }
        }
        return {
          label,
          variant: "outline" as const,
          className:
            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 font-mono text-3xs",
          icon: <ShieldCheck className="w-3 h-3 text-emerald-600 mr-1 shrink-0" />,
          tooltip: `Documento formalmente vigente. Fecha de caducidad: ${formatDateSpanish(
            fechaVencimiento
          )} (${diasParaVencer ?? 0} días restantes).`,
        };
      }
      case "por_vencer": {
        const label =
          showDetails && diasParaVencer !== undefined && diasParaVencer !== null
            ? `Por Vencer (${diasParaVencer}d)`
            : "Por Vencer";
        return {
          label,
          variant: "outline" as const,
          className:
            "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/25 font-mono text-3xs animate-pulse",
          icon: <Clock className="w-3 h-3 text-amber-600 mr-1 shrink-0" />,
          tooltip: `ALERTA PREVENTIVA: Vence en ${diasParaVencer} días (${formatDateSpanish(
            fechaVencimiento
          )}). Se recomienda iniciar gestión de renovación ante la municipalidad.`,
        };
      }
      case "vencido": {
        const diasAbs = Math.abs(diasParaVencer ?? 0);
        const label =
          showDetails && diasParaVencer !== undefined && diasParaVencer !== null
            ? `Vencido (${diasAbs}d)`
            : "Vencido";
        return {
          label,
          variant: "outline" as const,
          className:
            "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/40 hover:bg-rose-500/25 font-mono text-3xs font-bold",
          icon: <AlertTriangle className="w-3 h-3 text-rose-600 mr-1 shrink-0" />,
          tooltip: `CRÍTICO: Documento venció hace ${diasAbs} días (${formatDateSpanish(
            fechaVencimiento
          )}). Los parámetros urbanísticos han caducado y requieren nueva solicitud municipal.`,
        };
      }
      case "permanente":
      default:
        return {
          label: "Permanente",
          variant: "outline" as const,
          className:
            "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700 font-mono text-3xs",
          icon: <CheckCircle2 className="w-3 h-3 text-slate-500 mr-1 shrink-0" />,
          tooltip: "Documento de vigencia indefinida (Plano topográfico, catastro o memoria técnica).",
        };
    }
  };

  const config = getBadgeContent();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={config.variant} className={`inline-flex items-center px-1.5 py-0.5 ${config.className} ${className}`}>
            {config.icon}
            <span>{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
