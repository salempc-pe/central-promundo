"use client";

import React from "react";
import { X, Filter, RotateCcw } from "lucide-react";
import { TerrenoFiltros } from "@/types";
import { Button } from "@/components/ui/button";

interface ActiveFilterChipsProps {
  filtros: TerrenoFiltros;
  onRemoveFiltro: (key: keyof TerrenoFiltros, value?: string) => void;
  onClearAll: () => void;
  totalFiltrados: number;
  totalGeneral: number;
}

export function ActiveFilterChips({
  filtros,
  onRemoveFiltro,
  onClearAll,
  totalFiltrados,
  totalGeneral,
}: ActiveFilterChipsProps) {
  const chips: { key: keyof TerrenoFiltros; label: string; value?: string }[] = [];

  // Búsqueda
  if (filtros.busqueda && filtros.busqueda.trim() !== "") {
    chips.push({ key: "busqueda", label: `Búsqueda: "${filtros.busqueda}"` });
  }

  // Distritos
  if (filtros.distrito && filtros.distrito.length > 0) {
    filtros.distrito.forEach((d) => {
      chips.push({ key: "distrito", label: `Distrito: ${d}`, value: d });
    });
  }

  // Zonificación
  if (filtros.zonificacion && filtros.zonificacion.length > 0) {
    filtros.zonificacion.forEach((z) => {
      chips.push({ key: "zonificacion", label: `Zonif: ${z}`, value: z });
    });
  }

  // Área
  if (filtros.areaMin || filtros.areaMax) {
    const min = filtros.areaMin ? `${filtros.areaMin}m²` : "0";
    const max = filtros.areaMax ? `${filtros.areaMax}m²` : "∞";
    chips.push({ key: "areaMin", label: `Área: ${min} - ${max}` });
  }

  // Precio/m2
  if (filtros.precioM2Max) {
    chips.push({ key: "precioM2Max", label: `Precio/m² ≤ $${filtros.precioM2Max}` });
  }

  // Precio Total
  if (filtros.precioTotalMax) {
    chips.push({ key: "precioTotalMax", label: `Precio Total ≤ $${(filtros.precioTotalMax / 1000000).toFixed(1)}M` });
  }

  // Altura
  if (filtros.alturaMinPisos) {
    chips.push({ key: "alturaMinPisos", label: `Altura ≥ ${filtros.alturaMinPisos} pisos` });
  }

  // Frente
  if (filtros.frenteLinealMin) {
    chips.push({ key: "frenteLinealMin", label: `Frente ≥ ${filtros.frenteLinealMin} m` });
  }

  // Certificado CPU
  if (filtros.soloConCertificadoParametros) {
    chips.push({ key: "soloConCertificadoParametros", label: "Solo con CPU adjunto" });
  }

  // Estado
  if (filtros.estado && filtros.estado.length > 0) {
    filtros.estado.forEach((st) => {
      chips.push({ key: "estado", label: `Estado: ${st}`, value: st });
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xs text-xs">
      <div className="flex items-center text-3xs font-mono font-bold uppercase text-slate-500 mr-1 gap-1">
        <Filter className="w-2.5 h-2.5 text-blue-600" />
        <span>Filtros Activos ({chips.length}):</span>
      </div>

      {chips.map((chip, idx) => (
        <span
          key={`${chip.key}-${chip.value || idx}`}
          className="inline-flex items-center gap-1 bg-white text-slate-800 border border-slate-300 rounded-xs px-1.5 py-0.5 text-2xs font-medium font-mono shadow-2xs group hover:border-slate-400"
        >
          <span>{chip.label}</span>
          <button
            onClick={() => onRemoveFiltro(chip.key, chip.value)}
            className="text-slate-400 hover:text-slate-900 rounded-xs p-0.5 hover:bg-slate-100"
            title="Eliminar filtro"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="text-3xs font-mono text-blue-600 hover:text-blue-800 underline ml-auto flex items-center gap-0.5 font-semibold"
      >
        <RotateCcw className="w-2.5 h-2.5" />
        <span>Limpiar todos</span>
      </button>
    </div>
  );
}
