"use client";

import React from "react";
import {
  Filter,
  X,
  RotateCcw,
  Building,
  Check,
  ChevronDown,
  Layers,
  MapPin,
  DollarSign,
  Maximize2,
  FileCheck,
} from "lucide-react";
import { TerrenoFiltros } from "@/types";
import {
  ZONIFICACIONES_LIMA,
  ZONIFICACIONES_PRIORITARIAS_FILTRO,
} from "@/lib/constants/zonificaciones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface TerrenosFiltersProps {
  filtros: TerrenoFiltros;
  onFilterChange: (nuevosFiltros: Partial<TerrenoFiltros>) => void;
  onReset: () => void;
  totalResultados: number;
  totalInventario: number;
  isOpen: boolean;
  onClose?: () => void;
}

const DISTRITOS_LIMA = [
  "Miraflores",
  "San Isidro",
  "Santiago de Surco",
  "Barranco",
  "San Miguel",
  "Magdalena del Mar",
  "Jesús María",
  "Lince",
  "San Borja",
  "Surquillo",
  "Pueblo Libre",
  "La Molina",
  "Ate",
  "Chorrillos",
  "Callao",
];

const ZONIFICACIONES = ZONIFICACIONES_PRIORITARIAS_FILTRO;

const ESTADOS = ["Disponible", "En Negociacion", "Separado", "Vendido"];

export function TerrenosFilters({
  filtros,
  onFilterChange,
  onReset,
  totalResultados,
  totalInventario,
  isOpen,
  onClose,
}: TerrenosFiltersProps) {
  const [verTodasZonif, setVerTodasZonif] = React.useState(false);

  if (!isOpen) return null;

  const toggleDistrito = (d: string) => {
    const curr = filtros.distrito || [];
    const next = curr.includes(d) ? curr.filter((item) => item !== d) : [...curr, d];
    onFilterChange({ distrito: next.length > 0 ? next : undefined });
  };

  const toggleZonificacion = (z: string) => {
    const curr = filtros.zonificacion || [];
    const next = curr.includes(z) ? curr.filter((item) => item !== z) : [...curr, z];
    onFilterChange({ zonificacion: next.length > 0 ? next : undefined });
  };

  const toggleEstado = (st: any) => {
    const curr = filtros.estado || [];
    const next = curr.includes(st) ? curr.filter((item) => item !== st) : [...curr, st];
    onFilterChange({ estado: next.length > 0 ? next : undefined });
  };

  return (
    <div className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header del Sidebar de Filtros */}
      <div className="p-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
            Filtros Acumulativos
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-6 px-1.5 text-3xs font-mono text-slate-500 hover:text-slate-900 gap-0.5"
            title="Restablecer filtros"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700 lg:hidden"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Contador reactivo */}
      <div className="px-3 py-1.5 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-2xs font-mono">
        <span className="text-slate-600">Resultados:</span>
        <span className="font-bold text-blue-800">
          {totalResultados} de {totalInventario} lotes
        </span>
      </div>

      {/* Contenido scrolleable de filtros */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {/* 1. Distritos */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>Distritos</span>
            </label>
            {filtros.distrito && filtros.distrito.length > 0 && (
              <span className="text-3xs font-mono font-bold text-blue-600">
                {filtros.distrito.length} selecc.
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto pr-1 border border-slate-100 p-1 rounded-xs bg-slate-50/40">
            {DISTRITOS_LIMA.map((d) => {
              const selected = filtros.distrito?.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDistrito(d)}
                  className={`text-left px-1.5 py-1 rounded-xs text-3xs font-mono transition-colors truncate ${
                    selected
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* 2. Zonificación */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>Zonificación Urbanística</span>
            </label>
            {filtros.zonificacion && filtros.zonificacion.length > 0 && (
              <span className="text-3xs font-mono font-bold text-purple-700">
                {filtros.zonificacion.length} selecc.
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto pr-0.5">
            {(verTodasZonif
              ? ZONIFICACIONES_LIMA
              : ZONIFICACIONES_LIMA.filter((z) =>
                  ZONIFICACIONES_PRIORITARIAS_FILTRO.includes(z.value)
                )
            ).map((z) => {
              const selected = filtros.zonificacion?.includes(z.value);
              return (
                <button
                  key={z.value}
                  onClick={() => toggleZonificacion(z.value)}
                  title={`${z.value} — ${z.nombre} (${z.categoria})`}
                  className={`px-1.5 py-0.5 rounded-xs text-2xs font-mono font-bold border transition-colors ${
                    selected
                      ? "bg-purple-700 text-white border-purple-700 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {z.value}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-0.5">
            <button
              onClick={() => setVerTodasZonif(!verTodasZonif)}
              className="text-3xs font-mono text-purple-700 hover:text-purple-900 font-bold underline"
            >
              {verTodasZonif
                ? "Mostrar principales (10)"
                : `+ Ver todas (${ZONIFICACIONES_LIMA.length})`}
            </button>
          </div>
        </div>

        <Separator />

        {/* 3. Área de Terreno (m2) */}
        <div className="space-y-1.5">
          <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-slate-400" />
            <span>Rango de Área (m²)</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <Input
              type="number"
              placeholder="Mín m²"
              value={filtros.areaMin || ""}
              onChange={(e) =>
                onFilterChange({
                  areaMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-6 text-2xs font-mono"
            />
            <Input
              type="number"
              placeholder="Máx m²"
              value={filtros.areaMax || ""}
              onChange={(e) =>
                onFilterChange({
                  areaMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-6 text-2xs font-mono"
            />
          </div>
          {/* Presets rápidos */}
          <div className="grid grid-cols-2 gap-1 pt-1">
            <button
              onClick={() => onFilterChange({ areaMin: 0, areaMax: 1000 })}
              className="text-3xs font-mono bg-slate-100 hover:bg-slate-200 py-0.5 px-1 rounded text-slate-700"
            >
              &lt; 1,000 m²
            </button>
            <button
              onClick={() => onFilterChange({ areaMin: 1000, areaMax: 2500 })}
              className="text-3xs font-mono bg-slate-100 hover:bg-slate-200 py-0.5 px-1 rounded text-slate-700"
            >
              1,000 - 2,500 m²
            </button>
            <button
              onClick={() => onFilterChange({ areaMin: 2500, areaMax: 5000 })}
              className="text-3xs font-mono bg-slate-100 hover:bg-slate-200 py-0.5 px-1 rounded text-slate-700"
            >
              2,500 - 5,000 m²
            </button>
            <button
              onClick={() => onFilterChange({ areaMin: 5000, areaMax: undefined })}
              className="text-3xs font-mono bg-slate-100 hover:bg-slate-200 py-0.5 px-1 rounded text-slate-700"
            >
              &gt; 5,000 m²
            </button>
          </div>
        </div>

        <Separator />

        {/* 4. Precio por m2 y Precio Total */}
        <div className="space-y-1.5">
          <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-slate-400" />
            <span>Presupuesto (USD)</span>
          </label>
          <div className="space-y-1">
            <div className="text-3xs text-slate-500 font-mono">Precio/m² Máximo ($)</div>
            <Input
              type="number"
              placeholder="ej. 2500"
              value={filtros.precioM2Max || ""}
              onChange={(e) =>
                onFilterChange({
                  precioM2Max: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-6 text-2xs font-mono"
            />
          </div>
          <div className="space-y-1 pt-1">
            <div className="text-3xs text-slate-500 font-mono">Precio Total Máximo ($)</div>
            <Input
              type="number"
              placeholder="ej. 5000000"
              value={filtros.precioTotalMax || ""}
              onChange={(e) =>
                onFilterChange({
                  precioTotalMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-6 text-2xs font-mono"
            />
          </div>
        </div>

        <Separator />

        {/* 5. Parámetros Técnicos Mínimos */}
        <div className="space-y-2">
          <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-400" />
            <span>Exigencias Normativas</span>
          </label>
          <div className="space-y-1">
            <div className="text-3xs text-slate-500 font-mono">Altura Mínima (Pisos)</div>
            <div className="flex gap-1">
              {[5, 8, 10, 14, 18].map((pisos) => (
                <button
                  key={pisos}
                  onClick={() =>
                    onFilterChange({
                      alturaMinPisos:
                        filtros.alturaMinPisos === pisos ? undefined : pisos,
                    })
                  }
                  className={`flex-1 py-0.5 rounded-xs text-3xs font-mono border ${
                    filtros.alturaMinPisos === pisos
                      ? "bg-blue-600 text-white font-bold border-blue-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {pisos}+
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xs text-slate-500 font-mono">Frente Lineal Mínimo (m)</div>
            <Input
              type="number"
              placeholder="ej. 20"
              value={filtros.frenteLinealMin || ""}
              onChange={(e) =>
                onFilterChange({
                  frenteLinealMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-6 text-2xs font-mono"
            />
          </div>
        </div>

        <Separator />

        {/* 6. Certificado de Parámetros */}
        <div className="space-y-1.5">
          <div className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1">
            <FileCheck className="w-3 h-3 text-slate-400" />
            <span>Documentación</span>
          </div>
          <div
            onClick={() =>
              onFilterChange({
                soloConCertificadoParametros: !filtros.soloConCertificadoParametros,
              })
            }
            className="flex items-center space-x-2 cursor-pointer pt-0.5 select-none group"
          >
            <Checkbox
              checked={!!filtros.soloConCertificadoParametros}
              onCheckedChange={(checked) =>
                onFilterChange({ soloConCertificadoParametros: !!checked })
              }
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-2xs font-medium text-slate-700 group-hover:text-slate-900 leading-tight">
              Solo lotes con CPU adjunto
            </span>
          </div>
        </div>

        <Separator />

        {/* 7. Estado Comercial */}
        <div className="space-y-1.5">
          <div className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
            Estado Comercial
          </div>
          <div className="space-y-1">
            {ESTADOS.map((st) => {
              const checked = filtros.estado?.includes(st as any);
              return (
                <div
                  key={st}
                  onClick={() => toggleEstado(st)}
                  className="flex items-center space-x-2 cursor-pointer text-2xs text-slate-700 hover:text-slate-900 select-none group"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleEstado(st)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="group-hover:text-slate-900">{st}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
