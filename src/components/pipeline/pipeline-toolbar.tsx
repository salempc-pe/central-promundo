"use client";

import React from "react";
import {
  Search,
  Filter,
  X,
  LayoutGrid,
  Table as TableIcon,
  Download,
  Plus,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NegociacionFiltros, Usuario } from "@/types";
import { cn } from "@/lib/utils";

interface PipelineToolbarProps {
  filtros: NegociacionFiltros;
  onFiltrosChange: (filtros: NegociacionFiltros) => void;
  viewMode: "kanban" | "table";
  onViewModeChange: (mode: "kanban" | "table") => void;
  onNewDeal: () => void;
  onExport: () => void;
  brokers: Usuario[];
  distritosDisponibles: string[];
  clientesDisponibles: { id: string; razonSocial: string }[];
  totalDeals: number;
}

export function PipelineToolbar({
  filtros,
  onFiltrosChange,
  viewMode,
  onViewModeChange,
  onNewDeal,
  onExport,
  brokers,
  distritosDisponibles,
  clientesDisponibles,
  totalDeals,
}: PipelineToolbarProps) {
  const hasActiveFilters = Boolean(
    filtros.busqueda ||
      filtros.brokerId?.length ||
      filtros.clienteId?.length ||
      filtros.distrito?.length ||
      filtros.soloEstancados
  );

  const handleResetFilters = () => {
    onFiltrosChange({});
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs p-2.5 space-y-2 select-none">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Lado Izquierdo: Buscador y Selectores Rápidos */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              value={filtros.busqueda || ""}
              onChange={(e) =>
                onFiltrosChange({ ...filtros, busqueda: e.target.value })
              }
              placeholder="Buscar por código, cliente, distrito, broker..."
              className="h-8 pl-8 pr-7 text-xs bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-500 focus:bg-white font-mono"
            />
            {filtros.busqueda && (
              <button
                onClick={() => onFiltrosChange({ ...filtros, busqueda: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Selector de Broker */}
          <div className="w-36">
            <Select
              value={filtros.brokerId?.[0] || "ALL"}
              onValueChange={(val) =>
                onFiltrosChange({
                  ...filtros,
                  brokerId: val === "ALL" ? undefined : [val],
                })
              }
            >
              <SelectTrigger className="h-8 text-2xs bg-slate-50 border-slate-200 text-slate-800 font-mono">
                <SelectValue placeholder="Broker: Todos" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-800">
                <SelectItem value="ALL" className="text-2xs font-mono">
                  Brokers: Todos
                </SelectItem>
                {brokers.map((b) => (
                  <SelectItem
                    key={b.id}
                    value={b.id}
                    className="text-2xs font-mono"
                  >
                    {b.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Constructora / Cliente */}
          <div className="w-40">
            <Select
              value={filtros.clienteId?.[0] || "ALL"}
              onValueChange={(val) =>
                onFiltrosChange({
                  ...filtros,
                  clienteId: val === "ALL" ? undefined : [val],
                })
              }
            >
              <SelectTrigger className="h-8 text-2xs bg-slate-50 border-slate-200 text-slate-800 font-mono">
                <SelectValue placeholder="Cliente: Todos" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-800">
                <SelectItem value="ALL" className="text-2xs font-mono">
                  Clientes: Todos
                </SelectItem>
                {clientesDisponibles.map((c) => (
                  <SelectItem
                    key={c.id}
                    value={c.id}
                    className="text-2xs font-mono truncate"
                  >
                    {c.razonSocial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Distrito */}
          <div className="w-36">
            <Select
              value={filtros.distrito?.[0] || "ALL"}
              onValueChange={(val) =>
                onFiltrosChange({
                  ...filtros,
                  distrito: val === "ALL" ? undefined : [val],
                })
              }
            >
              <SelectTrigger className="h-8 text-2xs bg-slate-50 border-slate-200 text-slate-800 font-mono">
                <SelectValue placeholder="Distrito: Todos" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-800">
                <SelectItem value="ALL" className="text-2xs font-mono">
                  Distritos: Todos
                </SelectItem>
                {distritosDisponibles.map((d) => (
                  <SelectItem key={d} value={d} className="text-2xs font-mono">
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botón Filtro Deals Estancados (> 14d) */}
          <Button
            size="sm"
            variant={filtros.soloEstancados ? "destructive" : "outline"}
            onClick={() =>
              onFiltrosChange({
                ...filtros,
                soloEstancados: !filtros.soloEstancados,
              })
            }
            className={cn(
              "h-8 text-2xs font-mono gap-1.5 transition-colors",
              filtros.soloEstancados
                ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-500 font-bold"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Estancados (&gt;14d)</span>
          </Button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleResetFilters}
              className="h-8 text-2xs font-mono text-slate-500 hover:text-slate-800 px-2 gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar</span>
            </Button>
          )}
        </div>

        {/* Lado Derecho: Conmutador de Vistas y Botones de Acción */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Contador de Deals */}
          <div className="hidden sm:flex items-center text-2xs font-mono text-slate-600 px-2 py-1 bg-slate-50 rounded border border-slate-200">
            <span>{totalDeals} Negociaciones</span>
          </div>

          {/* Toggle Kanban / Tabla */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded border border-slate-200">
            <button
              onClick={() => onViewModeChange("kanban")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-2xs font-mono rounded-xs transition-colors",
                viewMode === "kanban"
                  ? "bg-white text-blue-600 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title="Vista Tablero Kanban"
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden md:inline">Kanban</span>
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-2xs font-mono rounded-xs transition-colors",
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title="Vista Lista Tabular"
            >
              <TableIcon className="w-3 h-3" />
              <span className="hidden md:inline">Tabla</span>
            </button>
          </div>

          {/* Botón Exportar */}
          <Button
            size="sm"
            variant="outline"
            onClick={onExport}
            className="h-8 text-2xs font-mono gap-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          >
            <Download className="w-3 h-3 text-emerald-600" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>

          {/* Botón Nueva Negociación */}
          <Button
            size="sm"
            onClick={onNewDeal}
            className="h-8 text-2xs font-mono gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Negociación</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
