"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { EventoAuditoriaGlobal } from "@/types/auditoria";
import { getAuditoriaColumns } from "./auditoria-columns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface AuditoriaTableProps {
  data: EventoAuditoriaGlobal[];
  onSelectEvento: (evento: EventoAuditoriaGlobal) => void;
}

export function AuditoriaTable({ data, onSelectEvento }: AuditoriaTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(15);

  const columns = React.useMemo(
    () => getAuditoriaColumns(onSelectEvento),
    [onSelectEvento]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  return (
    <div className="bg-white border border-slate-200 rounded shadow-xs p-3 space-y-3 select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-slate-50 border-b border-slate-200 text-3xs font-mono font-bold text-slate-600 uppercase"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="py-2 px-2.5">
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
          <tbody className="divide-y divide-slate-100 font-mono text-2xs">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="h-9 hover:bg-slate-50/80 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-1 px-2.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-slate-400 font-mono text-xs"
                >
                  No se encontraron eventos en la bitácora con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación Compacta */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100 text-2xs font-mono text-slate-500">
        <div className="flex items-center space-x-2">
          <span>Página</span>
          <strong>
            {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount() || 1}
          </strong>
          <span className="text-slate-400">({data.length} eventos)</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span className="text-3xs">Filas:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
                setPageSize(Number(e.target.value));
              }}
              className="h-6 px-1.5 bg-slate-50 border border-slate-200 rounded text-3xs font-mono focus:outline-none"
            >
              {[10, 15, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-6 w-6 p-0 border-slate-200"
            >
              <ChevronsLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-6 w-6 p-0 border-slate-200"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-6 w-6 p-0 border-slate-200"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-6 w-6 p-0 border-slate-200"
            >
              <ChevronsRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
