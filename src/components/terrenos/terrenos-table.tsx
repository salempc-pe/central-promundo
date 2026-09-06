"use client";

import React from "react";
import { flexRender, Table as TableType } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { TerrenoCompleto } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface TerrenosTableProps {
  table: TableType<TerrenoCompleto>;
  onSelectTerreno: (terreno: TerrenoCompleto, defaultTab?: string) => void;
  selectedTerrenoId: string | null;
}

export function TerrenosTable({
  table,
  onSelectTerreno,
  selectedTerrenoId,
}: TerrenosTableProps) {
  const selectedCount = Object.keys(table.getState().rowSelection).length;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Contenedor scrolleable del Data Grid */}
      <div className="flex-1 overflow-auto">
        <Table className="dense-table">
          <TableHeader className="sticky top-0 bg-slate-100 z-10 shadow-2xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-slate-100">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="py-1.5 px-2 text-2xs font-mono font-bold uppercase text-slate-700 border-r border-slate-200 last:border-r-0"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isSelected = selectedTerrenoId === row.original.id;
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onSelectTerreno(row.original)}
                    className={`dense-row-hover cursor-pointer border-b border-slate-100 ${
                      isSelected
                        ? "bg-blue-50/90 font-medium border-l-3 border-l-blue-600"
                        : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isSelect = cell.column.id === "select";
                      return (
                        <TableCell
                          key={cell.id}
                          onClick={
                            isSelect
                              ? (e) => {
                                  e.stopPropagation();
                                  row.toggleSelected();
                                }
                              : undefined
                          }
                          className={`py-1 px-2 border-r border-slate-100 last:border-r-0 ${
                            isSelect ? "cursor-default text-center p-0" : ""
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-32 text-center text-slate-400 font-mono text-xs"
                >
                  No se encontraron lotes con los filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer / Barra de paginación compacta */}
      <div className="p-2 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0 text-2xs font-mono">
        <div className="flex items-center space-x-2 text-slate-600">
          <span>
            Página <strong>{table.getState().pagination.pageIndex + 1}</strong> de{" "}
            <strong>{table.getPageCount() || 1}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>{totalRows} registros filtrados</span>
          {selectedCount > 0 && (
            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
              {selectedCount} seleccionados
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Filas:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-6 text-2xs font-mono bg-white border border-slate-300 rounded px-1"
            >
              {[10, 15, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-0.5">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 p-0 border-slate-300"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 p-0 border-slate-300"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 p-0 border-slate-300"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 p-0 border-slate-300"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
