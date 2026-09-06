"use client";

import React from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Columns,
  Maximize2,
  Table as TableIcon,
  MapPin,
  RefreshCw,
  Eye,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MapaToolbarProps {
  totalFiltrados: number;
  totalGeneral: number;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
  isSplitView: boolean;
  onToggleSplitView: () => void;
  activeFiltersCount: number;
}

export function MapaToolbar({
  totalFiltrados,
  totalGeneral,
  isFiltersOpen,
  onToggleFilters,
  isSplitView,
  onToggleSplitView,
  activeFiltersCount,
}: MapaToolbarProps) {
  return (
    <div className="h-10 bg-white border-b border-slate-200 shadow-xs px-3 flex items-center justify-between shrink-0 select-none text-slate-800">
      {/* Sección Izquierda: Título y Filtros */}
      <div className="flex items-center space-x-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className={cn(
            "h-7 px-2 text-xs font-mono font-semibold transition-colors gap-1.5",
            isFiltersOpen
              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="ml-0.5 px-1 py-0 rounded-full bg-blue-600 text-white font-bold text-3xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center space-x-1.5 font-mono text-xs">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-bold text-slate-900 hidden md:inline">MAPA GEOESPACIAL</span>
          <span className="text-3xs text-slate-500 font-normal hidden lg:inline">| PostGIS EPSG:4326</span>
        </div>
      </div>

      {/* Sección Central: Contador de Lotes */}
      <div className="flex items-center space-x-2 font-mono text-xs">
        <div className="flex items-center space-x-1 text-slate-600">
          <span>Mostrando</span>
          <span className="font-bold text-blue-600">{totalFiltrados}</span>
          <span>de</span>
          <span className="text-slate-900 font-semibold">{totalGeneral}</span>
          <span className="hidden sm:inline">lotes</span>
        </div>

        {totalFiltrados < totalGeneral && (
          <Badge variant="warning" className="text-3xs font-mono py-0 px-1 hidden md:inline-flex">
            Filtro Activo
          </Badge>
        )}
      </div>

      {/* Sección Derecha: Modo Split / Pantalla Completa & Link a Data Grid */}
      <div className="flex items-center space-x-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSplitView}
          className={cn(
            "h-7 px-2 text-xs font-mono font-semibold border-slate-200 gap-1.5 hidden sm:flex",
            isSplitView
              ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
              : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          )}
          title={isSplitView ? "Cambiar a Mapa Pantalla Completa" : "Cambiar a Vista Dividida 60/40"}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>{isSplitView ? "Split 60/40" : "100% Mapa"}</span>
        </Button>

        <Link href="/terrenos">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs font-mono font-semibold bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 gap-1"
            title="Ir a vista Data Grid de Terrenos"
          >
            <TableIcon className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Ver Data Grid</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
