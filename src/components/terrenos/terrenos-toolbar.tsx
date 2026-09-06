"use client";

import React from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  Columns,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Table } from "@tanstack/react-table";
import { TerrenoCompleto } from "@/types";

interface TerrenosToolbarProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
  activeFiltersCount: number;
  table?: Table<TerrenoCompleto> | null;
  onExportExcel: () => void;
  totalFiltrados: number;
  totalGeneral: number;
  onNuevoLote?: () => void;
}

export function TerrenosToolbar({
  busqueda,
  onBusquedaChange,
  isFiltersOpen,
  onToggleFilters,
  activeFiltersCount,
  table,
  onExportExcel,
  totalFiltrados,
  totalGeneral,
  onNuevoLote,
}: TerrenosToolbarProps) {
  const leafColumns = table?.getAllLeafColumns?.() || [];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white border-b border-slate-200">
      {/* Lado izquierdo: Búsqueda rápida y botón de filtros */}
      <div className="flex items-center space-x-2 flex-1 min-w-[280px] max-w-md">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Buscar por código, distrito, dirección o propietario..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            prefixNode={<Search className="w-3 h-3 text-slate-400" />}
            className="h-7 text-xs bg-slate-50 focus:bg-white pr-7"
          />
          {busqueda && (
            <button
              onClick={() => onBusquedaChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <Button
          variant={isFiltersOpen ? "default" : "outline"}
          size="sm"
          onClick={onToggleFilters}
          className={`h-7 text-2xs font-mono gap-1 ${
            isFiltersOpen
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold"
              : "border-slate-300 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-0.5 px-1 py-0 h-4 text-3xs font-mono bg-blue-600 text-white font-bold"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Lado derecho: Acciones de tabla (Selector de columnas, exportar, nuevo lote) */}
      <div className="flex items-center space-x-2">
        {/* Contador de filas */}
        <div className="text-2xs font-mono text-slate-500 hidden sm:inline-block">
          <span className="font-bold text-slate-800">{totalFiltrados}</span> de {totalGeneral} lotes
        </div>

        {/* Selector de columnas visibles */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-2xs font-mono gap-1 border-slate-300">
              <Columns className="w-3 h-3 text-slate-500" />
              <span>Columnas</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-2">
            <div className="text-2xs font-mono font-bold uppercase text-slate-500 pb-1.5 border-b border-slate-100 mb-1.5">
              Columnas Visibles
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {leafColumns
                .filter((col) => col.getCanHide())
                .map((column) => (
                  <div
                    key={column.id}
                    onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    className="flex items-center space-x-2 text-2xs text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded select-none group"
                  >
                    <Checkbox
                      checked={column.getIsVisible()}
                      onCheckedChange={(val) => column.toggleVisibility(!!val)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="capitalize font-mono group-hover:text-slate-900">
                      {column.id === "codigoInterno"
                        ? "Código"
                        : column.id === "distrito"
                        ? "Distrito / Dir."
                        : column.id === "zonificacion"
                        ? "Zonificación"
                        : column.id === "areaM2"
                        ? "Área (m²)"
                        : column.id === "frenteLinealM"
                        ? "Frente (m)"
                        : column.id === "alturaMaxPisos"
                        ? "Altura (pisos)"
                        : column.id === "precioM2"
                        ? "Precio/m²"
                        : column.id === "precioTotal"
                        ? "Precio Total"
                        : column.id === "estadoTerreno"
                        ? "Estado"
                        : column.id === "parametros"
                        ? "Certificado CPU"
                        : column.id === "matching"
                        ? "Matching"
                        : column.id}
                    </span>
                  </div>
                ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Exportar a Excel */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          className="h-7 text-2xs font-mono gap-1 border-slate-300 text-slate-700 hover:text-slate-900"
          title="Exportar registros filtrados a Excel"
        >
          <Download className="w-3 h-3 text-emerald-600" />
          <span>Exportar XLSX</span>
        </Button>

        {/* Registrar Lote */}
        <Button
          size="sm"
          onClick={onNuevoLote}
          className="h-7 text-2xs font-mono gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Lote</span>
        </Button>
      </div>
    </div>
  );
}
