"use client";

import React from "react";
import { MatchingViewMode, MatchingWeights, MatchEvaluationResult } from "@/types";
import { Building, Users, Grid, Search, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MatchingWeightsPopover } from "./matching-weights-popover";
import { exportarMatchingCSV } from "@/lib/services/export-matching";

interface MatchingToolbarProps {
  viewMode: MatchingViewMode;
  onViewModeChange: (mode: MatchingViewMode) => void;
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  scoreMinimo: number;
  onScoreMinimoChange: (score: number) => void;
  weights: MatchingWeights;
  onWeightsChange: (weights: MatchingWeights) => void;
  resultadosActuales: MatchEvaluationResult[];
}

export function MatchingToolbar({
  viewMode,
  onViewModeChange,
  busqueda,
  onBusquedaChange,
  scoreMinimo,
  onScoreMinimoChange,
  weights,
  onWeightsChange,
  resultadosActuales,
}: MatchingToolbarProps) {
  const handleExport = () => {
    exportarMatchingCSV(resultadosActuales, `matching_${viewMode}`);
  };

  return (
    <div className="bg-white border border-slate-200 shadow-xs rounded px-3 py-2 flex flex-wrap items-center justify-between gap-2.5">
      {/* Selector de Modo de Vista */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange("terreno")}
          className={`h-7 px-2.5 text-xs font-mono gap-1.5 rounded transition-all ${
            viewMode === "terreno"
              ? "bg-white text-blue-600 font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Por Terreno</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange("cliente")}
          className={`h-7 px-2.5 text-xs font-mono gap-1.5 rounded transition-all ${
            viewMode === "cliente"
              ? "bg-white text-blue-600 font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Por Constructora</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange("matriz")}
          className={`h-7 px-2.5 text-xs font-mono gap-1.5 rounded transition-all ${
            viewMode === "matriz"
              ? "bg-white text-blue-600 font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Matriz de Calor</span>
        </Button>
      </div>

      {/* Controles de Filtrado y Calibración */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Buscador Contextual */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder={
              viewMode === "terreno"
                ? "Buscar constructora..."
                : viewMode === "cliente"
                ? "Buscar código o distrito..."
                : "Filtrar matriz..."
            }
            className="h-7 pl-8 text-xs bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Filtro por Score Mínimo */}
        <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-2xs font-mono text-slate-600">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="hidden sm:inline">Score:</span>
          <select
            value={scoreMinimo}
            onChange={(e) => onScoreMinimoChange(Number(e.target.value))}
            className="bg-transparent border-none text-slate-800 text-2xs font-bold focus:outline-hidden cursor-pointer"
          >
            <option value={0} className="bg-white text-slate-800">
              Todos (&gt;0%)
            </option>
            <option value={50} className="bg-white text-slate-800">
              Medio (≥50%)
            </option>
            <option value={70} className="bg-white text-slate-800">
              Viable (≥70%)
            </option>
            <option value={80} className="bg-white text-slate-800">
              Prime (≥80%)
            </option>
          </select>
        </div>

        {/* Calibrador de Ponderaciones */}
        <MatchingWeightsPopover weights={weights} onWeightsChange={onWeightsChange} />

        {/* Botón de Exportación Excel CSV */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={resultadosActuales.length === 0}
          className="h-7 text-xs font-mono gap-1.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
          title="Exportar listado actual a Excel CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Exportar CSV</span>
        </Button>
      </div>
    </div>
  );
}
