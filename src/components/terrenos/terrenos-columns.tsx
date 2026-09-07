"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileCheck,
  AlertTriangle,
  FileText,
  Building2,
  ExternalLink,
  MoreHorizontal,
  Phone,
  Eye,
  Copy,
} from "lucide-react";
import { TerrenoCompleto } from "@/types";
import {
  getZonificacionBadgeClass,
  getZonificacionLabel,
} from "@/lib/constants/zonificaciones";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, formatArea, formatPricePerM2 } from "@/lib/utils";

interface ColumnOptions {
  onSelectTerreno: (terreno: TerrenoCompleto, defaultTab?: string) => void;
}

export function getTerrenosColumns({ onSelectTerreno }: ColumnOptions): ColumnDef<TerrenoCompleto>[] {
  return [
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
    {
      accessorKey: "codigoInterno",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-6 px-1 text-2xs font-mono font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 -ml-1 gap-1"
        >
          <span>CÓDIGO</span>
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="w-2.5 h-2.5 text-blue-600" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="w-2.5 h-2.5 text-blue-600" />
          ) : (
            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono font-bold text-blue-700 text-xs tracking-tight">
          {row.getValue("codigoInterno")}
        </span>
      ),
      size: 110,
    },
    {
      accessorKey: "distrito",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-6 px-1 text-2xs font-mono font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 -ml-1 gap-1"
        >
          <span>DISTRITO & DIRECCIÓN</span>
          <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
        </Button>
      ),
      cell: ({ row }) => {
        const terreno = row.original;
        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-pointer max-w-xs truncate">
                  <div className="font-semibold text-slate-900 text-xs leading-none">
                    {terreno.distrito}
                  </div>
                  <div className="text-3xs text-slate-500 truncate mt-0.5">
                    {terreno.direccion}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="font-bold">{terreno.distrito}</div>
                <div>{terreno.direccion}</div>
                {terreno.referencia && (
                  <div className="text-slate-400 text-3xs mt-1 border-t border-slate-700 pt-1">
                    Ref: {terreno.referencia}
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 220,
    },
    {
      accessorKey: "zonificacion",
      header: ({ column }) => (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-6 px-1 text-2xs font-mono font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 gap-1 mx-auto"
          >
            <span>ZONIF.</span>
            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const z = (row.getValue("zonificacion") as string) || "";
        const badgeColor = getZonificacionBadgeClass(z);
        const label = getZonificacionLabel(z);

        return (
          <div className="text-center">
            <span
              title={label}
              className={`inline-block px-1.5 py-0.5 rounded text-2xs font-mono font-bold border ${badgeColor}`}
            >
              {z}
            </span>
          </div>
        );
      },
      size: 75,
    },
    {
      accessorKey: "areaM2",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-6 px-1 text-2xs font-mono font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 gap-1 ml-auto"
          >
            <span>ÁREA (M²)</span>
            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono font-medium text-slate-800 text-xs">
          {formatArea(Number(row.getValue("areaM2")))}
        </div>
      ),
      size: 95,
    },
    {
      accessorKey: "frenteLinealM",
      header: () => <div className="text-right text-2xs font-mono font-bold uppercase text-slate-700 pr-1">FRENTE</div>,
      cell: ({ row }) => {
        const val = row.getValue("frenteLinealM");
        return (
          <div className="text-right font-mono text-xs text-slate-700">
            {val ? `${Number(val).toFixed(1)} m` : "-"}
          </div>
        );
      },
      size: 75,
    },
    {
      accessorKey: "alturaMaxPisos",
      header: () => <div className="text-center text-2xs font-mono font-bold uppercase text-slate-700">ALTURA</div>,
      cell: ({ row }) => {
        const alt = row.getValue("alturaMaxPisos") as number | null;
        return (
          <div className="text-center font-mono text-xs font-semibold text-slate-800">
            {alt ? `${alt} p` : "-"}
          </div>
        );
      },
      size: 65,
    },
    {
      accessorKey: "precioM2",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-6 px-1 text-2xs font-mono font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 gap-1 ml-auto"
          >
            <span>PRECIO/M²</span>
            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono font-semibold text-slate-900 text-xs">
          {formatPricePerM2(Number(row.getValue("precioM2")), row.original.moneda)}
        </div>
      ),
      size: 110,
    },
    {
      accessorKey: "precioTotal",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-6 px-1 text-2xs font-mono font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 gap-1 ml-auto"
          >
            <span>PRECIO TOTAL</span>
            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono font-bold text-slate-950 text-xs">
          {formatCurrency(Number(row.getValue("precioTotal")), row.original.moneda)}
        </div>
      ),
      size: 130,
    },
    {
      accessorKey: "estadoTerreno",
      header: () => <div className="text-center text-2xs font-mono font-bold uppercase text-slate-700">ESTADO</div>,
      cell: ({ row }) => {
        const estado = row.getValue("estadoTerreno") as string;
        return (
          <div className="text-center">
            <Badge
              variant={
                estado === "Disponible"
                  ? "success"
                  : estado === "En Negociacion"
                  ? "warning"
                  : estado === "Separado"
                  ? "outline"
                  : "secondary"
              }
              className="text-3xs px-1.5 py-0 font-medium tracking-tight"
            >
              {estado}
            </Badge>
          </div>
        );
      },
      size: 105,
    },
    {
      id: "parametros",
      header: () => <div className="text-center text-2xs font-mono font-bold uppercase text-slate-700">CPU</div>,
      cell: ({ row }) => {
        const docs = row.original.documentos || [];
        const cpuDoc = docs.find((d) => d.tipoDocumento === "Certificado_Parametros");

        if (!cpuDoc) {
          return (
            <div className="text-center">
              <span className="inline-flex items-center text-3xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                Sin adjunto
              </span>
            </div>
          );
        }

        // Semáforo de vigencia
        const vencimiento = cpuDoc.fechaVencimiento ? new Date(cpuDoc.fechaVencimiento) : null;
        const hoy = new Date();
        let status = "vigente";
        let dias = 0;

        if (vencimiento) {
          const diffTime = vencimiento.getTime() - hoy.getTime();
          dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (dias < 0) status = "vencido";
          else if (dias <= 30) status = "por_vencer";
        }

        return (
          <div className="text-center" onClick={(e) => { e.stopPropagation(); onSelectTerreno(row.original, "documentos"); }}>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="cursor-pointer">
                    {status === "vigente" ? (
                      <span className="inline-flex items-center text-3xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100">
                        <FileCheck className="w-2.5 h-2.5 mr-0.5" /> Vigente
                      </span>
                    ) : status === "por_vencer" ? (
                      <span className="inline-flex items-center text-3xs font-mono font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 hover:bg-amber-100 animate-pulse">
                        <AlertTriangle className="w-2.5 h-2.5 mr-0.5 text-amber-600" /> {dias}d
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-3xs font-mono font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 hover:bg-rose-100">
                        Vencido
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div>CPU: {cpuDoc.nombreArchivo}</div>
                  <div className="text-3xs text-slate-400">
                    Vencimiento: {cpuDoc.fechaVencimiento || "Indefinido"}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      size: 90,
    },
    {
      id: "matching",
      header: () => <div className="text-center text-2xs font-mono font-bold uppercase text-slate-700">MATCH</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectTerreno(row.original, "matching");
            }}
            className="inline-flex items-center text-2xs font-mono font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 px-1.5 py-0.5 rounded border border-blue-200 transition-colors"
          >
            <Building2 className="w-2.5 h-2.5 mr-0.5" /> Match
          </button>
        </div>
      ),
      size: 75,
    },
    {
      id: "actions",
      header: () => <div className="w-8"></div>,
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="text-right" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-slate-500 hover:text-slate-900">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuLabel>Acciones del Lote</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onSelectTerreno(t, "ficha")}>
                  <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  <span>Ver Ficha Técnica</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectTerreno(t, "matching")}>
                  <Building2 className="w-3.5 h-3.5 mr-2 text-blue-600" />
                  <span>Cruce con Constructoras</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectTerreno(t, "documentos")}>
                  <FileText className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  <span>Ver Documentación</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {t.latitud && t.longitud && (
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${t.latitud},${t.longitud}`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2 text-slate-500" />
                    <span>Abrir en Google Maps</span>
                  </DropdownMenuItem>
                )}
                {t.propietario?.telefono && (
                  <DropdownMenuItem
                    onClick={() => {
                      if (t.propietario?.telefono) {
                        window.open(
                          `https://wa.me/${t.propietario.telefono.replace(/\D/g, "")}`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <Phone className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                    <span>WhatsApp Propietario</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/terrenos?codigo=${t.codigoInterno}`
                    );
                  }}
                >
                  <Copy className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  <span>Copiar Enlace Ficha</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 40,
    },
  ];
}
