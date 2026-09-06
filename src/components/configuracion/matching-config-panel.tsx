"use client";

import React, { useState, useEffect } from "react";
import { ConfiguracionMatchingGlobal } from "@/types/configuracion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
} from "lucide-react";

interface MatchingConfigPanelProps {
  config: ConfiguracionMatchingGlobal;
  onSaveConfig: (config: ConfiguracionMatchingGlobal) => Promise<void>;
  onResetConfig: () => Promise<void>;
}

export function MatchingConfigPanel({
  config,
  onSaveConfig,
  onResetConfig,
}: MatchingConfigPanelProps) {
  const [ticket, setTicket] = useState(config.weights.ticket);
  const [zona, setZona] = useState(config.weights.zona);
  const [zonificacion, setZonificacion] = useState(config.weights.zonificacion);
  const [altura, setAltura] = useState(config.weights.altura);
  const [frenteArea, setFrenteArea] = useState(config.weights.frenteArea);

  const [toleranciaPrecio, setToleranciaPrecio] = useState(
    config.toleranciaPrecioPct
  );
  const [toleranciaAltura, setToleranciaAltura] = useState(
    config.toleranciaAlturaPisos
  );
  const [bonusCpu, setBonusCpu] = useState(config.bonusCpuVigente);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setTicket(config.weights.ticket);
    setZona(config.weights.zona);
    setZonificacion(config.weights.zonificacion);
    setAltura(config.weights.altura);
    setFrenteArea(config.weights.frenteArea);
    setToleranciaPrecio(config.toleranciaPrecioPct);
    setToleranciaAltura(config.toleranciaAlturaPisos);
    setBonusCpu(config.bonusCpuVigente);
  }, [config]);

  const sumaPonderaciones = ticket + zona + zonificacion + altura + frenteArea;
  const esValido100 = sumaPonderaciones === 100;

  // Presets
  const applyPreset = (p: {
    ticket: number;
    zona: number;
    zon: number;
    alt: number;
    frente: number;
  }) => {
    setTicket(p.ticket);
    setZona(p.zona);
    setZonificacion(p.zon);
    setAltura(p.alt);
    setFrenteArea(p.frente);
  };

  const handleSave = async () => {
    if (!esValido100) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveConfig({
        ...config,
        weights: {
          ticket,
          zona,
          zonificacion,
          altura,
          frenteArea,
        },
        toleranciaPrecioPct: toleranciaPrecio,
        toleranciaAlturaPisos: toleranciaAltura,
        bonusCpuVigente: bonusCpu,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error al guardar calibración de matching:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      await onResetConfig();
    } catch (err) {
      console.error("Error al resetear matching:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded shadow-xs p-4 space-y-4 select-none">
      {/* Cabecera y Presets */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Calibración Algorítmica del Motor de Matching (Módulo E)
            </h3>
            <p className="text-3xs text-slate-500 font-sans">
              Ponderación cuantitativa de afinidad lote-constructora y tolerancias de mercado
            </p>
          </div>
        </div>

        {/* Botones de Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-2xs font-mono">
          <span className="text-3xs text-slate-400 mr-1">Presets:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPreset({ ticket: 30, zona: 25, zon: 20, alt: 15, frente: 10 })
            }
            className="h-6 text-3xs px-2 border-slate-200 hover:bg-slate-100"
          >
            Balanceado
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPreset({ ticket: 45, zona: 15, zon: 15, alt: 15, frente: 10 })
            }
            className="h-6 text-3xs px-2 border-slate-200 hover:bg-slate-100"
          >
            Foco Financiero
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPreset({ ticket: 20, zona: 15, zon: 30, alt: 25, frente: 10 })
            }
            className="h-6 text-3xs px-2 border-slate-200 hover:bg-slate-100"
          >
            Foco Normativo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPreset({ ticket: 20, zona: 40, zon: 20, alt: 10, frente: 10 })
            }
            className="h-6 text-3xs px-2 border-slate-200 hover:bg-slate-100"
          >
            Foco Clúster
          </Button>
        </div>
      </div>

      {/* Validador de Suma 100% */}
      <div
        className={`p-2.5 rounded border text-xs font-mono flex items-center justify-between ${
          esValido100
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}
      >
        <div className="flex items-center space-x-2">
          {esValido100 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>
            {esValido100
              ? "Regla de Ponderación Cumplida: La suma de factores es exactamente 100.0%."
              : `Error de Ponderación: La suma actual es ${sumaPonderaciones}%. Debe sumar estrictamente 100%.`}
          </span>
        </div>
        <div className="font-bold text-sm">
          Suma: <strong>{sumaPonderaciones}%</strong>
        </div>
      </div>

      {/* Grid de Sliders de los 5 Criterios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Factor 1: Ticket */}
        <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
          <div className="flex justify-between items-center text-2xs font-mono">
            <label className="font-bold text-slate-800">
              1. Ticket Financiero ($ USD)
            </label>
            <span className="font-bold text-blue-700 text-xs">
              {ticket}%
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={ticket}
            onChange={(e) => setTicket(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-3xs text-slate-500 font-sans">
            Afinidad del precio total del lote frente a la capacidad de inversión de la constructora.
          </p>
        </div>

        {/* Factor 2: Zona */}
        <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
          <div className="flex justify-between items-center text-2xs font-mono">
            <label className="font-bold text-slate-800">
              2. Ubicación / Clúster Territorial
            </label>
            <span className="font-bold text-blue-700 text-xs">{zona}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={50}
            step={5}
            value={zona}
            onChange={(e) => setZona(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-3xs text-slate-500 font-sans">
            Coincidencia exacta de distrito o clúster colindante (Lima Top, Moderna, etc.).
          </p>
        </div>

        {/* Factor 3: Zonificación */}
        <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
          <div className="flex justify-between items-center text-2xs font-mono">
            <label className="font-bold text-slate-800">
              3. Zonificación Normativa
            </label>
            <span className="font-bold text-blue-700 text-xs">
              {zonificacion}%
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={40}
            step={5}
            value={zonificacion}
            onChange={(e) => setZonificacion(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-3xs text-slate-500 font-sans">
            Compatibilidad técnica del uso de suelo (RDA, RDM, CZ, CM, I1) contra el producto comercial.
          </p>
        </div>

        {/* Factor 4: Altura */}
        <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
          <div className="flex justify-between items-center text-2xs font-mono">
            <label className="font-bold text-slate-800">
              4. Altura Máxima Edificable (Pisos)
            </label>
            <span className="font-bold text-blue-700 text-xs">{altura}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={35}
            step={5}
            value={altura}
            onChange={(e) => setAltura(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-3xs text-slate-500 font-sans">
            Capacidad de pisos proyectados en el frente del lote vs. requerimiento de densidad del cliente.
          </p>
        </div>

        {/* Factor 5: Área y Frente */}
        <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200 md:col-span-2">
          <div className="flex justify-between items-center text-2xs font-mono">
            <label className="font-bold text-slate-800">
              5. Frente Lineal & Metros Cuadrados de Terreno
            </label>
            <span className="font-bold text-blue-700 text-xs">{frenteArea}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={frenteArea}
            onChange={(e) => setFrenteArea(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-3xs text-slate-500 font-sans">
            Adecuación física del terreno para cabida arquitectónica, estacionamientos y retiros reglamentarios.
          </p>
        </div>
      </div>

      {/* Sección de Tolerancias y Holguras */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <h4 className="text-2xs font-mono font-bold uppercase text-slate-700">
          Tolerancias y Parámetros de Holgura de Mercado
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1">
            <label className="text-3xs font-mono text-slate-600 font-medium">
              Tolerancia de Ticket (+/- %)
            </label>
            <Input
              type="number"
              min={5}
              max={30}
              value={toleranciaPrecio}
              onChange={(e) => setToleranciaPrecio(Number(e.target.value))}
              className="h-7 text-xs font-mono bg-white border-slate-300"
            />
            <span className="text-3xs text-slate-400 font-sans">
              Holgura de precio para calificar como gap subsanable.
            </span>
          </div>

          <div className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1">
            <label className="text-3xs font-mono text-slate-600 font-medium">
              Holgura de Altura (+/- Pisos)
            </label>
            <Input
              type="number"
              min={0}
              max={5}
              value={toleranciaAltura}
              onChange={(e) => setToleranciaAltura(Number(e.target.value))}
              className="h-7 text-xs font-mono bg-white border-slate-300"
            />
            <span className="text-3xs text-slate-400 font-sans">
              Diferencia en pisos tolerada antes de penalizar.
            </span>
          </div>

          <div className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1">
            <label className="text-3xs font-mono text-slate-600 font-medium">
              Bonus CPU Vigente (Puntos)
            </label>
            <Input
              type="number"
              min={0}
              max={15}
              value={bonusCpu}
              onChange={(e) => setBonusCpu(Number(e.target.value))}
              className="h-7 text-xs font-mono bg-white border-slate-300"
            />
            <span className="text-3xs text-slate-400 font-sans">
              Puntos planos sumados si el lote tiene CPU &lt; 36 meses.
            </span>
          </div>
        </div>
      </div>

      {/* Footer de Acciones */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-7 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-400" />
          Restablecer Fábrica (30/25/20/15/10)
        </Button>

        <div className="flex items-center space-x-2">
          {saveSuccess && (
            <span className="text-2xs font-mono text-emerald-700 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Calibración guardada exitosamente</span>
            </span>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!esValido100 || isSaving}
            className={`h-7 text-xs font-medium ${
              esValido100
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            {isSaving ? "Guardando..." : "Guardar Calibración"}
          </Button>
        </div>
      </div>
    </div>
  );
}
