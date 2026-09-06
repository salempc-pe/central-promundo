"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TerrenoCompleto, MatchEvaluationResult } from "@/types";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  DollarSign,
  MapPin,
  Maximize2,
  FileCheck,
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";

interface MatchByTerrenoProps {
  terrenos: TerrenoCompleto[];
  terrenoSeleccionado: TerrenoCompleto;
  onSelectTerreno: (terreno: TerrenoCompleto) => void;
  matches: MatchEvaluationResult[];
  onOpenDetail: (match: MatchEvaluationResult) => void;
  onStartDeal: (match: MatchEvaluationResult) => void;
}

export function MatchByTerrenoView({
  terrenos,
  terrenoSeleccionado,
  onSelectTerreno,
  matches,
  onOpenDetail,
  onStartDeal,
}: MatchByTerrenoProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "scoreMatch", desc: true },
  ]);

  const columns = useMemo<ColumnDef<MatchEvaluationResult>[]>(
    () => [
      {
        accessorKey: "scoreMatch",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-mono text-2xs uppercase tracking-wider text-slate-600 hover:text-slate-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Score %</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const score = row.original.scoreMatch;
          const nivel = row.original.nivelCompatibilidad;
          return (
            <div className="flex items-center gap-2 font-mono">
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  score >= 80
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                    : score >= 68
                    ? "bg-blue-50 text-blue-700 border border-blue-300"
                    : "bg-amber-50 text-amber-700 border border-amber-300"
                }`}
              >
                {score}%
              </span>
              <span className="text-3xs text-slate-500 hidden sm:inline">
                {nivel}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "cliente.razonSocial",
        header: "Constructora / Inversionista",
        cell: ({ row }) => {
          const cli = row.original.cliente;
          return (
            <div className="min-w-[180px]">
              <div className="font-bold text-slate-900 text-xs truncate">
                {cli.razonSocial}
              </div>
              <div className="text-3xs font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className="text-blue-600 font-semibold">{cli.tipoCliente}</span>
                <span>•</span>
                <span>
                  Ticket: ${Number(cli.ticketMin || 0) / 1000}K - $
                  {Number(cli.ticketMax || 0) / 1000}K
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: "breakdown",
        header: "Desglose (Tick/Zon/Uso/Alt/Frt)",
        cell: ({ row }) => {
          const b = row.original.breakdown;
          return (
            <div className="flex items-center gap-1 font-mono text-3xs">
              <span
                className="px-1 rounded bg-blue-50 text-blue-700 border border-blue-200"
                title={`Ticket: ${b.ticketScore}/30 pts`}
              >
                T:{b.ticketScore}
              </span>
              <span
                className="px-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
                title={`Zona: ${b.zonaScore}/25 pts`}
              >
                Z:{b.zonaScore}
              </span>
              <span
                className="px-1 rounded bg-purple-50 text-purple-700 border border-purple-200"
                title={`Zonif: ${b.zonifScore}/20 pts`}
              >
                U:{b.zonifScore}
              </span>
              <span
                className="px-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200"
                title={`Altura: ${b.alturaScore}/15 pts`}
              >
                A:{b.alturaScore}
              </span>
              <span
                className="px-1 rounded bg-amber-50 text-amber-700 border border-amber-200"
                title={`Frente: ${b.frenteAreaScore}/10 pts`}
              >
                F:{b.frenteAreaScore}
              </span>
            </div>
          );
        },
      },
      {
        id: "gaps",
        header: "Brechas / Hallazgos Clave",
        cell: ({ row }) => {
          const gaps = row.original.gaps;
          const criticos = gaps.filter((g) => g.tipo === "critico" || g.tipo === "alerta");
          if (criticos.length === 0) {
            return (
              <span className="text-3xs font-mono text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sin brechas (Alineado)
              </span>
            );
          }
          return (
            <div className="flex items-center gap-1 max-w-[220px] truncate font-mono text-3xs text-amber-700">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span className="truncate">{criticos[0].mensaje}</span>
              {criticos.length > 1 && (
                <span className="text-slate-500 font-bold">
                  +{criticos.length - 1}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "contacto",
        header: "Contacto Clave",
        cell: ({ row }) => {
          const cli = row.original.cliente;
          return (
            <div className="text-3xs font-mono text-slate-700 truncate max-w-[140px]">
              <div>{cli.contactoNombre || "Gerencia Desarrollo"}</div>
              <div className="text-slate-500">{cli.telefono || cli.email || "S/D"}</div>
            </div>
          );
        },
      },
      {
        id: "acciones",
        header: () => <div className="text-right">Acción Comercial</div>,
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenDetail(m)}
                className="h-7 px-2 text-2xs font-mono text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-1"
                title="Ver informe completo de compatibilidad"
              >
                <Eye className="w-3 h-3 text-blue-600" />
                <span className="hidden sm:inline">Auditoría</span>
              </Button>

              <Button
                size="sm"
                onClick={() => onStartDeal(m)}
                className="h-7 px-2 text-2xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Negociar</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [onOpenDetail, onStartDeal]
  );

  const table = useReactTable({
    data: matches,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div className="space-y-3 font-sans">
      {/* Selector y Ficha del Terreno Seleccionado */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-mono uppercase tracking-wider text-slate-600 font-bold">
              Seleccionar Terreno de la Cartera:
            </span>
            <select
              value={terrenoSeleccionado.id}
              onChange={(e) => {
                const sel = terrenos.find((t) => t.id === e.target.value);
                if (sel) onSelectTerreno(sel);
              }}
              className="h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs font-mono font-bold focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              {terrenos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.codigoInterno} — {t.distrito} (${Number(t.precioTotal) / 1000}K - {t.zonificacion})
                </option>
              ))}
            </select>
          </div>

          <Badge className="font-mono text-2xs bg-blue-50 text-blue-700 border-blue-200">
            {matches.length} Compradores Evaluados
          </Badge>
        </div>

        {/* Ficha Rápida del Terreno */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-200 font-mono text-2xs">
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <div className="text-slate-500 text-3xs">Código & Distrito</div>
            <Link
              href={`/terrenos?q=${terrenoSeleccionado.codigoInterno}`}
              className="text-blue-700 hover:text-blue-900 hover:underline font-bold truncate block"
              title="Ver terreno en inventario"
            >
              {terrenoSeleccionado.codigoInterno} ({terrenoSeleccionado.distrito})
            </Link>
          </div>

          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <div className="text-slate-500 text-3xs">Precio Total</div>
            <div className="text-emerald-700 font-bold">
              ${Number(terrenoSeleccionado.precioTotal).toLocaleString("en-US")} USD
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <div className="text-slate-500 text-3xs">Área & Frente</div>
            <div className="text-slate-900 font-bold">
              {terrenoSeleccionado.areaM2} m² | {terrenoSeleccionado.frenteLinealM || "N/A"}m
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <div className="text-slate-500 text-3xs">Zonificación & Altura</div>
            <div className="text-blue-700 font-bold">
              {terrenoSeleccionado.zonificacion} ({terrenoSeleccionado.alturaMaxPisos || "N/A"} pisos)
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <div className="text-slate-500 text-3xs">Estado</div>
            <div className="text-slate-700 font-bold">
              {terrenoSeleccionado.estadoTerreno}
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-slate-500 text-3xs">Certidumbre Legal</div>
              <Link
                href={`/documentos?q=${terrenoSeleccionado.codigoInterno}`}
                className="text-slate-800 hover:text-blue-700 font-bold text-3xs flex items-center gap-1 mt-0.5"
                title="Ver documentos y CPU del terreno"
              >
                <FileCheck className="w-3 h-3 text-emerald-600" />
                <span>CPU Vigente</span>
              </Link>
            </div>
            <Link
              href={`/mapa?terrenoId=${terrenoSeleccionado.id}`}
              className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-200 rounded text-3xs flex items-center"
              title="Ver en mapa geoespacial"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tabla TanStack Table v8 de Compradores */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-slate-100 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-slate-200 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-8 px-3 text-slate-700 text-2xs font-mono uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-9 border-slate-200 hover:bg-blue-50/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-1 text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-xs text-slate-500 font-mono"
                >
                  No se encontraron compradores que cumplan con los filtros y score mínimo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Paginación */}
        <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-2xs font-mono text-slate-600">
          <div>
            Mostrando {table.getRowModel().rows.length} de {matches.length} compradores afines
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-6 px-2 text-2xs font-mono text-slate-600 hover:text-slate-900 disabled:opacity-40"
            >
              Anterior
            </Button>
            <span className="text-slate-800 font-bold px-1">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-6 px-2 text-2xs font-mono text-slate-600 hover:text-slate-900 disabled:opacity-40"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
