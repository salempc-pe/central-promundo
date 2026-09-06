"use client";

import React from "react";
import { RangoPeriodoReporte, FiltroReportes } from "@/types/reportes";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  Download,
  FileText,
  FilterX,
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

interface ReportesToolbarProps {
  filtros: FiltroReportes;
  onFiltrosChange: (filtros: FiltroReportes) => void;
  onOpenReporteEjecutivo: () => void;
  onExportarExcel: () => void;
  brokersDisponibles: { id: string; nombre: string }[];
}

export function ReportesToolbar({
  filtros,
  onFiltrosChange,
  onOpenReporteEjecutivo,
  onExportarExcel,
  brokersDisponibles,
}: ReportesToolbarProps) {
  const periodos: { id: RangoPeriodoReporte; label: string }[] = [
    { id: "YTD", label: "YTD 2026" },
    { id: "Q3", label: "Q3 (Actual)" },
    { id: "Q2", label: "Q2" },
    { id: "Q1", label: "Q1" },
    { id: "12M", label: "Últimos 12M" },
    { id: "Historico", label: "Histórico" },
  ];

  const handlePeriodoChange = (periodo: RangoPeriodoReporte) => {
    onFiltrosChange({ ...filtros, rangoPeriodo: periodo });
  };

  const handleBrokerChange = (brokerId: string) => {
    onFiltrosChange({
      ...filtros,
      brokerId: filtros.brokerId === brokerId ? undefined : brokerId,
    });
  };

  const handleReset = () => {
    onFiltrosChange({ rangoPeriodo: "YTD" });
  };

  const activeBroker = brokersDisponibles.find((b) => b.id === filtros.brokerId);

  return (
    <div className="bg-white border border-slate-200 rounded p-2 flex flex-col md:flex-row items-center justify-between gap-2 select-none shadow-xs">
      {/* Selector de Período Segmentado */}
      <div className="flex flex-wrap items-center gap-1 w-full md:w-auto">
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200">
          {periodos.map((p) => {
            const isSelected = filtros.rangoPeriodo === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePeriodoChange(p.id)}
                className={`px-2 py-1 rounded text-2xs font-mono font-medium transition-colors ${
                  isSelected
                    ? "bg-white text-blue-700 font-bold shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Dropdown de Broker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-7.5 text-xs border-slate-200 ${
                activeBroker
                  ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <User className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              {activeBroker ? activeBroker.nombre : "Todos los Brokers"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 bg-white border-slate-200 text-xs">
            <DropdownMenuLabel className="text-3xs uppercase font-mono text-slate-500">
              Filtrar por Broker
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuCheckboxItem
              checked={!filtros.brokerId}
              closeOnSelect={true}
              onCheckedChange={() =>
                onFiltrosChange({ ...filtros, brokerId: undefined })
              }
              className="text-xs text-slate-700 cursor-pointer font-medium"
            >
              Todos los Brokers
            </DropdownMenuCheckboxItem>
            {brokersDisponibles.map((broker) => (
              <DropdownMenuCheckboxItem
                key={broker.id}
                checked={filtros.brokerId === broker.id}
                closeOnSelect={true}
                onCheckedChange={() => handleBrokerChange(broker.id)}
                className="text-xs text-slate-700 cursor-pointer"
              >
                {broker.nombre}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {filtros.brokerId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7.5 text-xs text-rose-600 hover:bg-rose-50 px-2"
          >
            <FilterX className="w-3.5 h-3.5 mr-1" />
            Restablecer
          </Button>
        )}
      </div>

      {/* Botones de Acción de Alto Nivel */}
      <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
        <Button
          onClick={onOpenReporteEjecutivo}
          size="sm"
          className="h-7.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
        >
          <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
          Informe Ejecutivo Comité
        </Button>

        <Button
          onClick={onExportarExcel}
          variant="outline"
          size="sm"
          className="h-7.5 text-xs bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
          Descargar Excel
        </Button>
      </div>
    </div>
  );
}
