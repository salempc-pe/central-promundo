"use client";

import React from "react";
import { EstadoLiquidacion, ComisionFiltros } from "@/types/comisiones";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Download,
  FilterX,
  User,
  MapPin,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ComisionesToolbarProps {
  filtros: ComisionFiltros;
  onFiltrosChange: (filtros: ComisionFiltros) => void;
  onExportarExcel: () => void;
  totalRegistros: number;
  registrosFiltrados: number;
  brokersDisponibles: { id: string; nombre: string }[];
  distritosDisponibles: string[];
}

export function ComisionesToolbar({
  filtros,
  onFiltrosChange,
  onExportarExcel,
  totalRegistros,
  registrosFiltrados,
  brokersDisponibles,
  distritosDisponibles,
}: ComisionesToolbarProps) {
  const estadosConfig: { id: EstadoLiquidacion; label: string; icon: React.ElementType }[] = [
    { id: "Pendiente", label: "Pendientes", icon: Clock },
    { id: "Facturado", label: "Facturados", icon: FileSpreadsheet },
    { id: "Cobrado", label: "Cobrados", icon: CheckCircle2 },
    { id: "Liquidado", label: "Liquidados", icon: Users },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltrosChange({ ...filtros, busqueda: e.target.value });
  };

  const handleToggleEstado = (estado: EstadoLiquidacion) => {
    const actuales = filtros.estado || [];
    let nuevos: EstadoLiquidacion[];
    if (actuales.includes(estado)) {
      nuevos = actuales.filter((e) => e !== estado);
    } else {
      nuevos = [...actuales, estado];
    }
    onFiltrosChange({ ...filtros, estado: nuevos.length > 0 ? nuevos : undefined });
  };

  const handleToggleBroker = (brokerId: string) => {
    const actuales = filtros.brokerId || [];
    let nuevos: string[];
    if (actuales.includes(brokerId)) {
      nuevos = actuales.filter((b) => b !== brokerId);
    } else {
      nuevos = [...actuales, brokerId];
    }
    onFiltrosChange({ ...filtros, brokerId: nuevos.length > 0 ? nuevos : undefined });
  };

  const handleToggleDistrito = (distrito: string) => {
    const actuales = filtros.distrito || [];
    let nuevos: string[];
    if (actuales.includes(distrito)) {
      nuevos = actuales.filter((d) => d !== distrito);
    } else {
      nuevos = [...actuales, distrito];
    }
    onFiltrosChange({ ...filtros, distrito: nuevos.length > 0 ? nuevos : undefined });
  };

  const handleResetFilters = () => {
    onFiltrosChange({});
  };

  const hasActiveFilters =
    Boolean(filtros.busqueda) ||
    Boolean(filtros.estado?.length) ||
    Boolean(filtros.brokerId?.length) ||
    Boolean(filtros.distrito?.length);

  return (
    <div className="bg-white border border-slate-200 rounded p-2 flex flex-col md:flex-row items-center justify-between gap-2 select-none shadow-xs">
      {/* Buscador Rápido y Filtros Semafóricos */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por lote, cliente, broker..."
            value={filtros.busqueda || ""}
            onChange={handleSearchChange}
            className="pl-8 h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
          />
        </div>

        {/* Chips de Selección Rápida por Estado */}
        <div className="flex items-center gap-1">
          {estadosConfig.map((item) => {
            const isSelected = filtros.estado?.includes(item.id);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleToggleEstado(item.id)}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-2xs font-mono font-medium transition-colors border ${
                  isSelected
                    ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className={`w-3 h-3 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dropdown Selector de Brokers */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 text-xs border-slate-200 ${
                filtros.brokerId && filtros.brokerId.length > 0
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <User className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Brokers
              {filtros.brokerId && filtros.brokerId.length > 0 && (
                <span className="ml-1 px-1 rounded-full bg-blue-600 text-white text-3xs font-mono font-bold">
                  {filtros.brokerId.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-white border-slate-200 text-xs">
            <DropdownMenuLabel className="text-3xs uppercase font-mono text-slate-500">
              Filtrar por Broker
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            {brokersDisponibles.map((broker) => (
              <DropdownMenuCheckboxItem
                key={broker.id}
                checked={filtros.brokerId?.includes(broker.id) || false}
                onCheckedChange={() => handleToggleBroker(broker.id)}
                className="text-xs text-slate-700 cursor-pointer"
              >
                {broker.nombre}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dropdown Selector de Distritos */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 text-xs border-slate-200 ${
                filtros.distrito && filtros.distrito.length > 0
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Distritos
              {filtros.distrito && filtros.distrito.length > 0 && (
                <span className="ml-1 px-1 rounded-full bg-blue-600 text-white text-3xs font-mono font-bold">
                  {filtros.distrito.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 bg-white border-slate-200 text-xs max-h-64 overflow-y-auto">
            <DropdownMenuLabel className="text-3xs uppercase font-mono text-slate-500">
              Distrito del Terreno
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            {distritosDisponibles.map((distrito) => (
              <DropdownMenuCheckboxItem
                key={distrito}
                checked={filtros.distrito?.includes(distrito) || false}
                onCheckedChange={() => handleToggleDistrito(distrito)}
                className="text-xs text-slate-700 cursor-pointer"
              >
                {distrito}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Limpiar Filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-8 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 px-2"
          >
            <FilterX className="w-3.5 h-3.5 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Acciones de Exportación y Conteo */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
        <span className="text-3xs font-mono text-slate-500">
          Mostrando <strong className="text-slate-800">{registrosFiltrados}</strong> de {totalRegistros} expedientes
        </span>

        <Button
          onClick={onExportarExcel}
          variant="outline"
          size="sm"
          className="h-8 text-xs bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
          Exportar Excel
        </Button>
      </div>
    </div>
  );
}
