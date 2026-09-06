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
import { DocumentoConTerreno } from "@/types/documentos";
import { getDocumentosColumns } from "./documentos-columns";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileQuestion,
} from "lucide-react";

interface DocumentosTableProps {
  data: DocumentoConTerreno[];
  onViewDoc: (doc: DocumentoConTerreno) => void;
  onToggleConfidencial: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onOpenTerreno: (terrenoId: string) => void;
  onSelectionChange?: (count: number) => void;
}

export function DocumentosTable({
  data,
  onViewDoc,
  onToggleConfidencial,
  onDeleteDoc,
  onOpenTerreno,
  onSelectionChange,
}: DocumentosTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "estadoVigencia", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    onSelectionChange?.(Object.keys(rowSelection).filter((k) => rowSelection[k]).length);
  }, [rowSelection, onSelectionChange]);

  const columns = React.useMemo(
    () =>
      getDocumentosColumns({
        onViewDoc,
        onToggleConfidencial,
        onDeleteDoc,
        onOpenTerreno,
      }),
    [onViewDoc, onToggleConfidencial, onDeleteDoc, onOpenTerreno]
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
                    className="px-3 py-1 text-3xs font-mono font-bold text-slate-700 uppercase tracking-wider border-r border-slate-200 last:border-r-0 select-none"
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

          {/* Cuerpo de la Tabla (Filas Compactas 32-34px) */}
          <tbody className="divide-y divide-slate-100 font-sans">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`h-8 hover:bg-blue-50/40 transition-colors ${
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
                        className={`px-3 py-1 border-r border-slate-100 last:border-r-0 text-slate-800 ${
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
                    <FileQuestion className="w-8 h-8 text-slate-400" />
                    <div className="text-xs font-bold text-slate-700">
                      No se encontraron documentos
                    </div>
                    <div className="text-3xs text-slate-500">
                      Intenta ajustar los términos de búsqueda o limpiar los filtros activos.
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer de Paginación y Resumen */}
      <div className="h-9 px-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-3xs font-mono text-slate-600 shrink-0 select-none">
        <div>
          Mostrando{" "}
          <span className="text-slate-900 font-bold">
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              (table.getRowModel().rows.length > 0 ? 1 : 0)}
          </span>{" "}
          a{" "}
          <span className="text-slate-900 font-bold">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getPrePaginationRowModel().rows.length
            )}
          </span>{" "}
          de{" "}
          <span className="text-slate-900 font-bold">
            {table.getPrePaginationRowModel().rows.length}
          </span>{" "}
          documentos
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Pág.</span>
            <span className="text-slate-900 font-bold">
              {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount() || 1}
            </span>
          </div>

          <div className="flex items-center space-x-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-200"
            >
              <ChevronsLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-200"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-200"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-900 disabled:opacity-30 hover:bg-slate-200"
            >
              <ChevronsRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
