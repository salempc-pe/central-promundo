"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import { ComisionLiquidacion, EstadoLiquidacion } from "@/types/comisiones";
import { getComisionesColumns } from "./comisiones-columns";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
} from "lucide-react";

interface ComisionesTableProps {
  data: ComisionLiquidacion[];
  onVerDetalle: (item: ComisionLiquidacion) => void;
  onCambiarEstado: (
    item: ComisionLiquidacion,
    estadoSiguiente?: EstadoLiquidacion
  ) => void;
  onGenerarVoucher: (item: ComisionLiquidacion) => void;
}

export function ComisionesTable({
  data,
  onVerDetalle,
  onCambiarEstado,
  onGenerarVoucher,
}: ComisionesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "codigoLiquidacion", desc: false },
  ]);
  const [rowSelection, setRowSelection] = useState({});

  const columns = React.useMemo(
    () =>
      getComisionesColumns({
        onVerDetalle,
        onCambiarEstado,
        onGenerarVoucher,
      }),
    [onVerDetalle, onCambiarEstado, onGenerarVoucher]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 shadow-xs rounded-xs overflow-hidden">
      {/* Contenedor con Scroll de la Tabla */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          {/* Cabecera Fija */}
          <thead className="bg-slate-100 sticky top-0 z-10 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="h-8">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2.5 py-1 text-3xs font-mono font-bold text-slate-700 uppercase tracking-wider border-r border-slate-200 last:border-r-0 select-none"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Cuerpo de la Tabla (Filas Compactas 34-36px) */}
          <tbody className="divide-y divide-slate-100 font-sans">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`h-9 hover:bg-blue-50/40 transition-colors ${
                    row.getIsSelected() ? "bg-blue-50/70" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isSelect = cell.column.id === "select";
                    return (
                      <td
                        key={cell.id}
                        onClick={
                          isSelect
                            ? (e) => {
                                e.stopPropagation();
                                row.toggleSelected();
                              }
                            : undefined
                        }
                        className={`px-2.5 py-1 border-r border-slate-100 last:border-r-0 text-slate-800 ${
                          isSelect ? "cursor-default text-center p-0" : ""
                        }`}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-48 text-center p-8 text-slate-400 font-mono"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <DollarSign className="w-8 h-8 text-slate-300" />
                    <div className="text-xs font-bold text-slate-700">
                      No se encontraron liquidaciones de comisiones
                    </div>
                    <div className="text-3xs text-slate-500">
                      Ajusta los filtros o los términos de búsqueda en la barra superior.
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginación Compacta */}
      <div className="h-9 px-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-2xs font-mono select-none">
        <div className="text-slate-500">
          {table.getFilteredSelectedRowModel().rows.length > 0 ? (
            <span>
              <strong className="text-blue-700">
                {table.getFilteredSelectedRowModel().rows.length}
              </strong>{" "}
              de {table.getFilteredRowModel().rows.length} seleccionados
            </span>
          ) : (
            <span>Total: {table.getFilteredRowModel().rows.length} registros</span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500 text-3xs">Página</span>
            <strong className="text-slate-800 font-bold">
              {table.getState().pagination.pageIndex + 1} de{" "}
              {Math.max(1, table.getPageCount())}
            </strong>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-6 w-6 p-0 border-slate-200 bg-white"
            >
              <ChevronsLeft className="h-3 w-3 text-slate-600" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-6 w-6 p-0 border-slate-200 bg-white"
            >
              <ChevronLeft className="h-3 w-3 text-slate-600" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-6 w-6 p-0 border-slate-200 bg-white"
            >
              <ChevronRight className="h-3 w-3 text-slate-600" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-6 w-6 p-0 border-slate-200 bg-white"
            >
              <ChevronsRight className="h-3 w-3 text-slate-600" />
            </Button>
          </div>

          {/* Selector de Filas por Página */}
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="h-6 px-1 text-3xs font-mono bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[10, 15, 25, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize} filas
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
