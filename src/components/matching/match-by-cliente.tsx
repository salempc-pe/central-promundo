"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Cliente, MatchEvaluationResult } from "@/types";
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
  Users,
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
  Compass,
} from "lucide-react";

interface MatchByClienteProps {
  clientes: Cliente[];
  clienteSeleccionado: Cliente;
  onSelectCliente: (cliente: Cliente) => void;
  matches: MatchEvaluationResult[];
  onOpenDetail: (match: MatchEvaluationResult) => void;
  onStartDeal: (match: MatchEvaluationResult) => void;
}

export function MatchByClienteView({
  clientes,
  clienteSeleccionado,
  onSelectCliente,
  matches,
  onOpenDetail,
  onStartDeal,
}: MatchByClienteProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "scoreMatch", desc: true },
  ]);

  const columns = useMemo<ColumnDef<MatchEvaluationResult>[]>(
    () => [
      {
        accessorKey: "scoreMatch",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-mono text-2xs uppercase tracking-wider text-slate-400 hover:text-white"
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
        accessorKey: "terreno.codigoInterno",
        header: "Terreno / Ubicación",
        cell: ({ row }) => {
          const t = row.original.terreno;
          return (
            <div className="min-w-[170px]">
              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Link
                  href={`/terrenos?q=${t.codigoInterno}`}
                  className="text-blue-700 hover:text-blue-900 hover:underline"
                  title="Ver terreno en Data Grid"
                >
                  {t.codigoInterno}
                </Link>
                <Link
                  href={`/mapa?terrenoId=${t.id}`}
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                  title="Ver lote en mapa geoespacial"
                >
                  <MapPin className="w-3 h-3" />
                </Link>
                <span className="text-3xs font-normal text-slate-500 font-mono">
                  ({t.distrito})
                </span>
              </div>
              <div className="text-3xs text-slate-500 truncate max-w-[200px] mt-0.5">
                {t.direccion}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "terreno.precioTotal",
        header: "Precio Total / m²",
        cell: ({ row }) => {
          const t = row.original.terreno;
          return (
            <div className="font-mono text-2xs">
              <div className="text-emerald-700 font-bold">
                ${Number(t.precioTotal).toLocaleString("en-US")}
              </div>
              <div className="text-3xs text-slate-500">
                ${Number(t.precioM2).toLocaleString("en-US")}/m²
              </div>
            </div>
          );
        },
      },
      {
        id: "parametros",
        header: "Parámetros (Área/Zon/Alt/Frt)",
        cell: ({ row }) => {
          const t = row.original.terreno;
          return (
            <div className="font-mono text-2xs text-slate-800">
              <div>
                <span className="font-bold">{t.areaM2} m²</span> •{" "}
                <span className="text-blue-700 font-semibold">{t.zonificacion}</span>
              </div>
              <div className="text-3xs text-slate-500 mt-0.5">
                Alt: {t.alturaMaxPisos ? `${t.alturaMaxPisos}p` : "N/A"} | Frt:{" "}
                {t.frenteLinealM ? `${t.frenteLinealM}m` : "N/A"}
              </div>
            </div>
          );
        },
      },
      {
        id: "gaps",
        header: "Diagnóstico & Brechas",
        cell: ({ row }) => {
          const gaps = row.original.gaps;
          const criticos = gaps.filter((g) => g.tipo === "critico" || g.tipo === "alerta");
          if (criticos.length === 0) {
            return (
              <span className="text-3xs font-mono text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Compatible 100%
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
      {/* Selector y Ficha del Comprador Seleccionado */}
      <div className="bg-white border border-slate-200 shadow-xs rounded p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-mono uppercase tracking-wider text-slate-600 font-bold">
              Seleccionar Constructora o Fondo:
            </span>
            <select
              value={clienteSeleccionado.id}
              onChange={(e) => {
                const sel = clientes.find((c) => c.id === e.target.value);
                if (sel) onSelectCliente(sel);
              }}
              className="h-8 px-2.5 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs font-mono font-bold focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razonSocial} ({c.tipoCliente})
                </option>
              ))}
            </select>
          </div>

          <Badge className="font-mono text-2xs bg-purple-50 text-purple-700 border-purple-200">
            {matches.length} Lotes de Cartera Evaluados
          </Badge>
        </div>

        {/* Ficha del Mandato de Inversión */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-200 font-mono text-2xs">
          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <div className="text-slate-500 text-3xs">Rango de Ticket</div>
            <div className="text-emerald-700 font-bold">
              ${Number(clienteSeleccionado.ticketMin || 0) / 1000}K - $
              {Number(clienteSeleccionado.ticketMax || 0) / 1000}K USD
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <div className="text-slate-500 text-3xs">Distritos Prioritarios</div>
            <div className="text-slate-900 font-bold truncate">
              {(clienteSeleccionado.zonasInteres || []).join(", ") || "Todos"}
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <div className="text-slate-500 text-3xs">Zonificaciones Objetivo</div>
            <div className="text-blue-700 font-bold">
              {(clienteSeleccionado.zonificacionesInteres || []).join(", ") || "Cualquiera"}
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <div className="text-slate-500 text-3xs">Altura Mínima Requerida</div>
            <div className="text-amber-700 font-bold">
              {clienteSeleccionado.alturaMinimaInteres || 0} pisos
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded border border-slate-200">
            <div className="text-slate-500 text-3xs">Contacto Comercial</div>
            <div className="text-slate-800 font-bold truncate">
              {clienteSeleccionado.contactoNombre || "Gerencia Desarrollo"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla TanStack Table v8 de Lotes */}
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
                  No se encontraron terrenos en cartera que cumplan con los filtros y score mínimo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Paginación */}
        <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-2xs font-mono text-slate-600">
          <div>
            Mostrando {table.getRowModel().rows.length} de {matches.length} lotes afines
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
