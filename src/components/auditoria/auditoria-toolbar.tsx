"use client";

import React from "react";
import {
  AuditoriaFiltros,
  ModuloSistema,
  NivelSeveridadAuditoria,
} from "@/types/auditoria";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Download,
  FilterX,
  FileCode,
  Shield,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuditoriaToolbarProps {
  filtros: AuditoriaFiltros;
  onFiltrosChange: (filtros: AuditoriaFiltros) => void;
  onExportarCSV: () => void;
  totalEventosFiltrados: number;
}

export function AuditoriaToolbar({
  filtros,
  onFiltrosChange,
  onExportarCSV,
  totalEventosFiltrados,
}: AuditoriaToolbarProps) {
  const modulosDisponibles: { id: ModuloSistema; label: string }[] = [
    { id: "terrenos", label: "Terrenos" },
    { id: "documentos", label: "Documentos & CPU" },
    { id: "pipeline", label: "Pipeline Negociaciones" },
    { id: "matching", label: "Motor de Matching" },
    { id: "comisiones", label: "Comisiones & Finanzas" },
    { id: "reportes", label: "Métricas BI" },
    { id: "configuracion", label: "Configuración Normativa" },
    { id: "gis", label: "Infraestructura GIS & DB" },
    { id: "seguridad", label: "Seguridad & Auth" },
  ];

  const severidades: { id: NivelSeveridadAuditoria; label: string }[] = [
    { id: "INFO", label: "INFO (Operación Normal)" },
    { id: "WARNING", label: "WARNING (Advertencia / Reajuste)" },
    { id: "CRITICAL", label: "CRITICAL (Cierres / Parámetros)" },
    { id: "SECURITY", label: "SECURITY (Control de Acceso)" },
  ];

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltrosChange({ ...filtros, busqueda: e.target.value });
  };

  const toggleModulo = (mod: ModuloSistema) => {
    const current = filtros.modulo || [];
    const exists = current.includes(mod);
    const updated = exists
      ? current.filter((m) => m !== mod)
      : [...current, mod];
    onFiltrosChange({
      ...filtros,
      modulo: updated.length > 0 ? updated : undefined,
    });
  };

  const toggleSeveridad = (sev: NivelSeveridadAuditoria) => {
    const current = filtros.severidad || [];
    const exists = current.includes(sev);
    const updated = exists
      ? current.filter((s) => s !== sev)
      : [...current, sev];
    onFiltrosChange({
      ...filtros,
      severidad: updated.length > 0 ? updated : undefined,
    });
  };

  const handleReset = () => {
    onFiltrosChange({});
  };

  const hasFilters =
    Boolean(filtros.busqueda) ||
    Boolean(filtros.modulo?.length) ||
    Boolean(filtros.severidad?.length) ||
    Boolean(filtros.soloConDiff);

  return (
    <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col md:flex-row items-center justify-between gap-2 shadow-xs select-none font-sans">
      {/* Inputs y Filtros */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {/* Input Buscador */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por ID, entidad, IP o usuario..."
            value={filtros.busqueda || ""}
            onChange={handleBusquedaChange}
            className="h-7.5 pl-8 text-xs bg-slate-50 border-slate-200 font-sans"
          />
        </div>

        {/* Dropdown de Módulos */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-7.5 text-xs border-slate-200 ${
                filtros.modulo && filtros.modulo.length > 0
                  ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Layers className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              {filtros.modulo && filtros.modulo.length > 0
                ? `Módulos (${filtros.modulo.length})`
                : "Todos los Módulos"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60 bg-white border-slate-200 text-xs">
            <DropdownMenuLabel className="text-3xs uppercase font-mono text-slate-500">
              Filtrar por Módulo
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            {modulosDisponibles.map((mod) => (
              <DropdownMenuCheckboxItem
                key={mod.id}
                checked={filtros.modulo?.includes(mod.id) || false}
                onCheckedChange={() => toggleModulo(mod.id)}
                className="text-xs text-slate-700 cursor-pointer"
              >
                {mod.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dropdown de Severidad */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-7.5 text-xs border-slate-200 ${
                filtros.severidad && filtros.severidad.length > 0
                  ? "bg-amber-50 text-amber-700 border-amber-300 font-bold"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Shield className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              {filtros.severidad && filtros.severidad.length > 0
                ? `Severidad (${filtros.severidad.length})`
                : "Todas las Severidades"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60 bg-white border-slate-200 text-xs">
            <DropdownMenuLabel className="text-3xs uppercase font-mono text-slate-500">
              Filtrar por Severidad
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            {severidades.map((sev) => (
              <DropdownMenuCheckboxItem
                key={sev.id}
                checked={filtros.severidad?.includes(sev.id) || false}
                onCheckedChange={() => toggleSeveridad(sev.id)}
                className="text-xs text-slate-700 cursor-pointer"
              >
                {sev.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Toggle Solo con Diff */}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onFiltrosChange({
              ...filtros,
              soloConDiff: !filtros.soloConDiff,
            })
          }
          className={`h-7.5 text-xs border-slate-200 ${
            filtros.soloConDiff
              ? "bg-purple-50 text-purple-700 border-purple-300 font-bold"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <FileCode className="w-3.5 h-3.5 mr-1 text-slate-500" />
          Solo con Diff
        </Button>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7.5 text-xs text-rose-600 hover:bg-rose-50 px-2"
          >
            <FilterX className="w-3.5 h-3.5 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Contador y Exportación */}
      <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
        <span className="text-3xs font-mono text-slate-500 hidden sm:inline">
          Eventos: <strong>{totalEventosFiltrados}</strong>
        </span>

        <Button
          onClick={onExportarCSV}
          size="sm"
          variant="outline"
          className="h-7.5 text-xs bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
          Exportar CSV Forense
        </Button>
      </div>
    </div>
  );
}
