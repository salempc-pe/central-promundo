"use client";

import React, { useState } from "react";
import { MatchingWeights, DEFAULT_MATCHING_WEIGHTS } from "@/types";
import { Sliders, RotateCcw, AlertTriangle, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface MatchingWeightsPopoverProps {
  weights: MatchingWeights;
  onWeightsChange: (newWeights: MatchingWeights) => void;
}

export function MatchingWeightsPopover({
  weights,
  onWeightsChange,
}: MatchingWeightsPopoverProps) {
  const [localWeights, setLocalWeights] = useState<MatchingWeights>(weights);
  const [isOpen, setIsOpen] = useState(false);

  const suma =
    localWeights.ticket +
    localWeights.zona +
    localWeights.zonificacion +
    localWeights.altura +
    localWeights.frenteArea;

  const esValido = suma === 100;

  const handleChange = (key: keyof MatchingWeights, val: number) => {
    setLocalWeights((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, val)),
    }));
  };

  const handleReset = () => {
    setLocalWeights(DEFAULT_MATCHING_WEIGHTS);
    onWeightsChange(DEFAULT_MATCHING_WEIGHTS);
  };

  const handleApply = () => {
    if (esValido) {
      onWeightsChange(localWeights);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs font-mono gap-1.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-600" />
          <span>Calibrar Pesos</span>
          {!esValido && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-3.5 bg-white border border-slate-200 text-slate-800 shadow-xl space-y-3 font-sans"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold font-mono text-slate-900">
              Ponderaciones del Algoritmo
            </span>
          </div>
          <button
            onClick={handleReset}
            className="text-3xs font-mono text-slate-500 hover:text-blue-600 flex items-center gap-1"
            title="Restablecer valores por defecto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Default</span>
          </button>
        </div>

        {/* Lista de controles de peso */}
        <div className="space-y-2.5 text-xs">
          {/* Factor 1: Ticket Presupuestal */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-2xs">
              <span className="text-slate-700 font-semibold">1. Ticket Presupuestal</span>
              <span className="text-blue-600 font-bold">{localWeights.ticket}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={localWeights.ticket}
              onChange={(e) => handleChange("ticket", Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Factor 2: Ubicación / Distritos */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-2xs">
              <span className="text-slate-700 font-semibold">2. Distritos Diana</span>
              <span className="text-emerald-600 font-bold">{localWeights.zona}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={localWeights.zona}
              onChange={(e) => handleChange("zona", Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Factor 3: Zonificación */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-2xs">
              <span className="text-slate-700 font-semibold">3. Zonificación y Usos</span>
              <span className="text-purple-600 font-bold">{localWeights.zonificacion}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={localWeights.zonificacion}
              onChange={(e) => handleChange("zonificacion", Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Factor 4: Altura Normativa */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-2xs">
              <span className="text-slate-700 font-semibold">4. Altura en Pisos</span>
              <span className="text-amber-600 font-bold">{localWeights.altura}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={localWeights.altura}
              onChange={(e) => handleChange("altura", Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Factor 5: Geometría y Frente */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-2xs">
              <span className="text-slate-700 font-semibold">5. Frente Lineal</span>
              <span className="text-cyan-600 font-bold">{localWeights.frenteArea}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={localWeights.frenteArea}
              onChange={(e) => handleChange("frenteArea", Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>
        </div>

        {/* Suma y Estado de Validación */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-2xs font-mono">
          <div className="flex items-center gap-1.5">
            {esValido ? (
              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                <Check className="w-3.5 h-3.5" /> Suma: 100%
              </span>
            ) : (
              <span className="text-rose-600 flex items-center gap-1 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> Suma: {suma}% (debe ser 100%)
              </span>
            )}
          </div>

          <Button
            size="sm"
            disabled={!esValido}
            onClick={handleApply}
            className="h-6 px-2.5 text-2xs font-mono bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
          >
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
