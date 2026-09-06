"use client";

import React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { EventoAuditoriaGlobal } from "@/types/auditoria";
import { Button } from "@/components/ui/button";
import {
  FileDiff,
  Eye,
  Shield,
  AlertTriangle,
  Info,
  Lock,
} from "lucide-react";

export function getAuditoriaColumns(
  onSelectEvento: (evento: EventoAuditoriaGlobal) => void
): ColumnDef<EventoAuditoriaGlobal>[] {
  return [
    // 1. Timestamp con segundos
    {
      accessorKey: "timestamp",
      header: "Fecha / Hora",
      cell: ({ row }) => {
        const d = new Date(row.original.timestamp);
        const fecha = d.toLocaleDateString("es-PE");
        const hora = d.toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        return (
          <div className="flex flex-col font-mono text-2xs leading-tight">
            <span className="text-slate-800 font-semibold">{fecha}</span>
            <span className="text-3xs text-slate-400">{hora}</span>
          </div>
        );
      },
    },

    // 2. Severidad
    {
      accessorKey: "severidad",
      header: "Severidad",
      cell: ({ row }) => {
        const sev = row.original.severidad;
        let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
        let Icon = Info;

        switch (sev) {
          case "WARNING":
            badgeClass = "bg-amber-50 text-amber-700 border-amber-300 font-bold";
            Icon = AlertTriangle;
            break;
          case "CRITICAL":
            badgeClass = "bg-rose-50 text-rose-700 border-rose-300 font-bold";
            Icon = Shield;
            break;
          case "SECURITY":
            badgeClass = "bg-purple-50 text-purple-700 border-purple-300 font-bold";
            Icon = Lock;
            break;
          case "INFO":
          default:
            badgeClass = "bg-slate-100 text-slate-600 border-slate-200";
            Icon = Info;
            break;
        }

        return (
          <span
            className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-3xs font-mono border ${badgeClass}`}
          >
            <Icon className="w-2.5 h-2.5" />
            <span>{sev}</span>
          </span>
        );
      },
    },

    // 3. Módulo
    {
      accessorKey: "modulo",
      header: "Módulo",
      cell: ({ row }) => {
        return (
          <span className="px-1.5 py-0.5 rounded text-3xs font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200 font-medium">
            {row.original.modulo}
          </span>
        );
      },
    },

    // 4. Tipo de Acción
    {
      accessorKey: "tipoAccion",
      header: "Acción",
      cell: ({ row }) => {
        return (
          <span className="text-3xs font-mono text-slate-600">
            {row.original.tipoAccion}
          </span>
        );
      },
    },

    // 5. Entidad Afectada & ID
    {
      accessorKey: "entidadAfectada",
      header: "Entidad / ID",
      cell: ({ row }) => {
        const { modulo, entidadAfectada, entidadId } = row.original;
        let href = "";
        if (modulo === "terrenos" || entidadAfectada.toLowerCase().includes("terreno")) {
          href = `/terrenos?q=${encodeURIComponent(entidadId)}`;
        } else if (
          modulo === "pipeline" ||
          entidadAfectada.toLowerCase().includes("negociacion") ||
          entidadAfectada.toLowerCase().includes("deal")
        ) {
          href = `/pipeline?dealId=${encodeURIComponent(entidadId)}`;
        } else if (
          modulo === "documentos" ||
          entidadAfectada.toLowerCase().includes("documento")
        ) {
          href = `/documentos?q=${encodeURIComponent(entidadId)}`;
        } else if (
          modulo === "comisiones" ||
          entidadAfectada.toLowerCase().includes("comision")
        ) {
          href = `/comisiones?q=${encodeURIComponent(entidadId)}`;
        } else if (modulo === "matching") {
          href = `/matching?terrenoId=${encodeURIComponent(entidadId)}`;
        }

        return (
          <div className="flex flex-col font-mono text-2xs leading-tight">
            <span className="font-semibold text-slate-800">
              {entidadAfectada}
            </span>
            {href ? (
              <Link
                href={href}
                className="text-3xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
                title={`Ir al registro en ${modulo}`}
              >
                {entidadId}
              </Link>
            ) : (
              <span className="text-3xs text-slate-500">{entidadId}</span>
            )}
          </div>
        );
      },
    },

    // 6. Descripción Operativa
    {
      accessorKey: "descripcion",
      header: "Descripción Operativa",
      cell: ({ row }) => {
        const hasDiff =
          row.original.diffCampos && row.original.diffCampos.length > 0;
        return (
          <div className="flex items-center space-x-1.5 max-w-[340px]">
            <span className="truncate text-2xs text-slate-700 font-sans" title={row.original.descripcion}>
              {row.original.descripcion}
            </span>
            {hasDiff && (
              <span className="shrink-0 px-1 py-0.2 rounded text-3xs bg-purple-50 text-purple-700 border border-purple-200 font-mono font-bold">
                {row.original.diffCampos!.length} diffs
              </span>
            )}
          </div>
        );
      },
    },

    // 7. Usuario Actor
    {
      accessorKey: "usuarioNombre",
      header: "Usuario",
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-1.5 font-sans">
            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-mono font-bold text-3xs text-slate-600 shrink-0">
              {row.original.usuarioNombre[0]}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-2xs font-semibold text-slate-800 truncate max-w-[120px]">
                {row.original.usuarioNombre}
              </span>
              <span className="text-3xs text-slate-400 font-mono uppercase">
                {row.original.usuarioRol.replace("_", " ")}
              </span>
            </div>
          </div>
        );
      },
    },

    // 8. IP & Origen
    {
      accessorKey: "metadataTecnica.ipAddress",
      header: "IP / Origen",
      cell: ({ row }) => {
        return (
          <div className="flex flex-col font-mono text-3xs text-slate-500 leading-tight">
            <span>{row.original.metadataTecnica.ipAddress}</span>
            <span className="text-slate-400">
              {row.original.metadataTecnica.duracionMs}ms
            </span>
          </div>
        );
      },
    },

    // 9. Acciones
    {
      id: "acciones",
      header: "Inspección",
      cell: ({ row }) => {
        const hasDiff =
          row.original.diffCampos && row.original.diffCampos.length > 0;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectEvento(row.original)}
            className={`h-6.5 px-2 text-3xs font-mono ${
              hasDiff
                ? "text-purple-700 hover:text-purple-900 bg-purple-50/70 hover:bg-purple-100 border border-purple-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {hasDiff ? (
              <>
                <FileDiff className="w-3 h-3 mr-1" />
                Diff
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Ver
              </>
            )}
          </Button>
        );
      },
    },
  ];
}
