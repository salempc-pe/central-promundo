"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentoFiltros, EstadoVigencia, TipoDocumento } from "@/types/documentos";
import {
  Search,
  UploadCloud,
  FileCheck,
  Building,
  MapPin,
  FileText,
  Filter,
  X,
  Lock,
  Globe,
  Download,
} from "lucide-react";

interface DocumentosToolbarProps {
  filtros: DocumentoFiltros;
  onFiltrosChange: (filtros: DocumentoFiltros) => void;
  onOpenUpload: () => void;
  selectedCount: number;
}

export function DocumentosToolbar({
  filtros,
  onFiltrosChange,
  onOpenUpload,
  selectedCount,
}: DocumentosToolbarProps) {
  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltrosChange({
      ...filtros,
      busqueda: e.target.value,
    });
  };

  const handleToggleTipo = (tipo: TipoDocumento) => {
    const actuales = filtros.tipoDocumento || [];
    const nuevo = actuales.includes(tipo)
      ? actuales.filter((t) => t !== tipo)
      : [...actuales, tipo];
    onFiltrosChange({
      ...filtros,
      tipoDocumento: nuevo.length > 0 ? nuevo : undefined,
    });
  };

  const handleToggleConfidencial = (val: boolean | null) => {
    onFiltrosChange({
      ...filtros,
      esConfidencial: val === filtros.esConfidencial ? undefined : val ?? undefined,
    });
  };

  const handleClearFilters = () => {
    onFiltrosChange({});
  };

  const hasActiveFilters = Boolean(
    filtros.busqueda ||
      (filtros.tipoDocumento && filtros.tipoDocumento.length > 0) ||
      (filtros.estadoVigencia && filtros.estadoVigencia.length > 0) ||
      typeof filtros.esConfidencial === "boolean"
  );

  return (
    <div className="p-2.5 bg-white border border-slate-200 shadow-xs rounded-xs space-y-2 select-none">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Buscador Universal */}
        <div className="relative w-full md:w-96">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={filtros.busqueda || ""}
            onChange={handleBusquedaChange}
            placeholder="Buscar por lote (TR-084), archivo, distrito o N° de registro..."
            className="pl-8 h-8 text-xs font-mono bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500 focus:bg-white"
          />
          {filtros.busqueda && (
            <button
              onClick={() => onFiltrosChange({ ...filtros, busqueda: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Acciones Principales */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {selectedCount > 0 && (
            <Badge variant="outline" className="text-3xs font-mono bg-blue-50 text-blue-700 border-blue-200">
              {selectedCount} seleccionados
            </Badge>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 text-xs font-mono text-slate-500 hover:text-slate-800 gap-1"
            >
              <X className="w-3 h-3" />
              <span>Limpiar filtros</span>
            </Button>
          )}

          <Button
            onClick={onOpenUpload}
            className="h-8 text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs font-semibold"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>+ Cargar Documento</span>
          </Button>
        </div>
      </div>

      {/* Chips Rápidos de Filtrado */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-3xs font-mono border-t border-slate-100">
        <span className="text-slate-500 flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3 text-slate-400" />
          <span>Tipo:</span>
        </span>

        <button
          onClick={() => handleToggleTipo("Certificado_Parametros")}
          className={`px-2 py-0.5 rounded flex items-center gap-1 border transition-colors ${
            filtros.tipoDocumento?.includes("Certificado_Parametros")
              ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <FileCheck className="w-2.5 h-2.5" />
          <span>CPU (Parámetros)</span>
        </button>

        <button
          onClick={() => handleToggleTipo("Partida_Registral")}
          className={`px-2 py-0.5 rounded flex items-center gap-1 border transition-colors ${
            filtros.tipoDocumento?.includes("Partida_Registral")
              ? "bg-purple-50 text-purple-700 border-purple-300 font-bold"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Building className="w-2.5 h-2.5" />
          <span>Partidas / CRI</span>
        </button>

        <button
          onClick={() => handleToggleTipo("Plano_Catastral")}
          className={`px-2 py-0.5 rounded flex items-center gap-1 border transition-colors ${
            filtros.tipoDocumento?.includes("Plano_Catastral")
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <MapPin className="w-2.5 h-2.5" />
          <span>Catastro & Planos</span>
        </button>

        <div className="w-px h-3.5 bg-slate-200 mx-1" />

        <span className="text-slate-500 flex items-center gap-1 mr-1">
          <span>Acceso:</span>
        </span>

        <button
          onClick={() => handleToggleConfidencial(false)}
          className={`px-2 py-0.5 rounded flex items-center gap-1 border transition-colors ${
            filtros.esConfidencial === false
              ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Globe className="w-2.5 h-2.5" />
          <span>Compartibles</span>
        </button>

        <button
          onClick={() => handleToggleConfidencial(true)}
          className={`px-2 py-0.5 rounded flex items-center gap-1 border transition-colors ${
            filtros.esConfidencial === true
              ? "bg-amber-50 text-amber-700 border-amber-300 font-bold"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Lock className="w-2.5 h-2.5" />
          <span>Confidenciales</span>
        </button>
      </div>
    </div>
  );
}
