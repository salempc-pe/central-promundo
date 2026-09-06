"use client";

import React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DocumentoConTerreno, TipoDocumento } from "@/types/documentos";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VigenciaBadge } from "./vigencia-badge";
import { formatDateSpanish, formatBytes } from "@/lib/utils";
import {
  FileText,
  FileCheck,
  Building,
  MapPin,
  Lock,
  Globe,
  Eye,
  Download,
  Trash2,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";

interface ColumnCallbacks {
  onViewDoc: (doc: DocumentoConTerreno) => void;
  onToggleConfidencial: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onOpenTerreno: (terrenoId: string) => void;
}

export function getDocumentosColumns({
  onViewDoc,
  onToggleConfidencial,
  onDeleteDoc,
  onOpenTerreno,
}: ColumnCallbacks): ColumnDef<DocumentoConTerreno>[] {
  return [
    // 1. Selección Múltiple
    {
      id: "select",
      header: ({ table }) => (
        <div
          className="flex items-center justify-center w-full h-full cursor-pointer py-1"
          onClick={(e) => {
            e.stopPropagation();
            table.toggleAllPageRowsSelected(!table.getIsAllPageRowsSelected());
          }}
        >
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todos"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div
          className="flex items-center justify-center w-full h-full cursor-pointer py-1"
          onClick={(e) => {
            e.stopPropagation();
            row.toggleSelected(!row.getIsSelected());
          }}
        >
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 36,
    },

    // 2. Terreno Asociado
    {
      id: "terreno",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 font-mono text-3xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider"
        >
          <span>Lote / Terreno</span>
          <ArrowUpDown className="w-2.5 h-2.5" />
        </button>
      ),
      accessorFn: (row) => `${row.terreno.codigoInterno} ${row.terreno.distrito}`,
      cell: ({ row }) => {
        const t = row.original.terreno;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenTerreno(t.id)}
              className="font-mono text-xs font-bold text-blue-600 hover:underline hover:text-blue-800"
              title="Abrir inspección técnica del terreno"
            >
              {t.codigoInterno}
            </button>
            <Link
              href={`/mapa?terrenoId=${t.id}`}
              className="text-slate-400 hover:text-blue-600 transition-colors"
              title="Ver lote en mapa geoespacial"
            >
              <MapPin className="w-3 h-3" />
            </Link>
            <Badge variant="outline" className="text-3xs font-mono py-0 px-1 border-slate-200 bg-slate-100 text-slate-700">
              {t.zonificacion}
            </Badge>
            <span className="text-3xs text-slate-500 truncate max-w-[90px]">
              {t.distrito}
            </span>
          </div>
        );
      },
      size: 190,
    },

    // 3. Tipo de Documento
    {
      accessorKey: "tipoDocumento",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 font-mono text-3xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider"
        >
          <span>Tipo</span>
          <ArrowUpDown className="w-2.5 h-2.5" />
        </button>
      ),
      cell: ({ row }) => {
        const tipo = row.getValue("tipoDocumento") as TipoDocumento;
        switch (tipo) {
          case "Certificado_Parametros":
            return (
              <Badge variant="outline" className="text-3xs font-mono bg-blue-50 text-blue-700 border-blue-200 gap-1">
                <FileCheck className="w-2.5 h-2.5" /> CPU
              </Badge>
            );
          case "Partida_Registral":
            return (
              <Badge variant="outline" className="text-3xs font-mono bg-purple-50 text-purple-700 border-purple-200 gap-1">
                <Building className="w-2.5 h-2.5" /> Partida / CRI
              </Badge>
            );
          case "Plano_Catastral":
            return (
              <Badge variant="outline" className="text-3xs font-mono bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                <MapPin className="w-2.5 h-2.5" /> Catastro
              </Badge>
            );
          case "Otros":
          default:
            return (
              <Badge variant="outline" className="text-3xs font-mono bg-slate-100 text-slate-600 border-slate-200 gap-1">
                <FileText className="w-2.5 h-2.5" /> Otros
              </Badge>
            );
        }
      },
      size: 110,
    },

    // 4. Nombre de Archivo & N° Registro
    {
      accessorKey: "nombreArchivo",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 font-mono text-3xs font-bold text-slate-400 hover:text-white uppercase tracking-wider"
        >
          <span>Archivo / Expediente</span>
          <ArrowUpDown className="w-2.5 h-2.5" />
        </button>
      ),
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex flex-col min-w-0 max-w-[280px]">
            <button
              onClick={() => onViewDoc(doc)}
              className="text-left font-mono text-xs font-semibold text-slate-200 hover:text-blue-400 truncate flex items-center gap-1.5"
              title={doc.nombreArchivo}
            >
              <FileText className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{doc.nombreArchivo}</span>
            </button>
            <div className="text-3xs text-slate-500 font-mono truncate flex items-center gap-1 mt-0.5">
              <span>{formatBytes(doc.tamanoBytes)}</span>
              {doc.numeroDocumento && (
                <>
                  <span>•</span>
                  <span className="text-slate-400">{doc.numeroDocumento}</span>
                </>
              )}
            </div>
          </div>
        );
      },
      size: 260,
    },

    // 5. Semáforo de Vigencia
    {
      accessorKey: "estadoVigencia",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 font-mono text-3xs font-bold text-slate-400 hover:text-white uppercase tracking-wider"
        >
          <span>Semáforo Vigencia</span>
          <ArrowUpDown className="w-2.5 h-2.5" />
        </button>
      ),
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <VigenciaBadge
            estadoVigencia={doc.estadoVigencia}
            diasParaVencer={doc.diasParaVencer}
            fechaVencimiento={doc.fechaVencimiento}
          />
        );
      },
      size: 150,
    },

    // 6. Fecha de Vencimiento
    {
      accessorKey: "fechaVencimiento",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 font-mono text-3xs font-bold text-slate-400 hover:text-white uppercase tracking-wider"
        >
          <span>Vencimiento</span>
          <ArrowUpDown className="w-2.5 h-2.5" />
        </button>
      ),
      cell: ({ row }) => {
        const val = row.getValue("fechaVencimiento") as string | Date | null;
        return (
          <span className="font-mono text-2xs text-slate-300">
            {val ? formatDateSpanish(val) : "Indefinida"}
          </span>
        );
      },
      size: 110,
    },

    // 7. Confidencialidad (Interactive Toggle)
    {
      accessorKey: "esConfidencial",
      header: "Acceso",
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <button
            onClick={() => onToggleConfidencial(doc.id)}
            className="focus:outline-none"
            title="Haz clic para cambiar visibilidad"
          >
            {doc.esConfidencial ? (
              <Badge variant="outline" className="text-3xs font-mono bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1 hover:bg-amber-500/20">
                <Lock className="w-2.5 h-2.5" /> Confidencial
              </Badge>
            ) : (
              <Badge variant="outline" className="text-3xs font-mono bg-blue-500/10 text-blue-400 border-blue-500/30 gap-1 hover:bg-blue-500/20">
                <Globe className="w-2.5 h-2.5" /> Compartible
              </Badge>
            )}
          </button>
        );
      },
      size: 110,
    },

    // 8. Fecha de Subida
    {
      accessorKey: "createdAt",
      header: "Cargado",
      cell: ({ row }) => {
        const val = row.getValue("createdAt") as string | Date;
        return (
          <span className="font-mono text-3xs text-slate-400">
            {formatDateSpanish(val)}
          </span>
        );
      },
      size: 90,
    },

    // 9. Acciones Rápidas
    {
      id: "acciones",
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDoc(doc)}
              className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600 hover:bg-slate-100"
              title="Previsualizar PDF en visor interactivo"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(doc.archivoUrl, "_blank")}
              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm(`¿Eliminar el documento ${doc.nombreArchivo}?`)) {
                  onDeleteDoc(doc.id);
                }
              }}
              className="h-6 w-6 p-0 text-slate-500 hover:text-rose-600 hover:bg-slate-100"
              title="Eliminar documento"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        );
      },
      size: 90,
    },
  ];
}
