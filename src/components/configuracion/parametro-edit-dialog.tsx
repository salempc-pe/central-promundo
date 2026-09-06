"use client";

import React, { useState, useEffect } from "react";
import { ParametroUrbanisticoDistrital } from "@/types/configuracion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Save, X, AlertTriangle } from "lucide-react";

interface ParametroEditDialogProps {
  parametro: ParametroUrbanisticoDistrital | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    cambios: Partial<ParametroUrbanisticoDistrital>
  ) => Promise<void>;
}

export function ParametroEditDialog({
  parametro,
  isOpen,
  onClose,
  onSave,
}: ParametroEditDialogProps) {
  const [alturaMaxPisos, setAlturaMaxPisos] = useState(10);
  const [alturaMaxMetros, setAlturaMaxMetros] = useState(30.0);
  const [coeficienteEdificacion, setCoeficienteEdificacion] = useState(4.0);
  const [areaLibreMinPct, setAreaLibreMinPct] = useState(35.0);
  const [frenteMinimoM, setFrenteMinimoM] = useState(12.0);
  const [loteMinimoM2, setLoteMinimoM2] = useState(500.0);
  const [ordenanzaReferencia, setOrdenanzaReferencia] = useState("");
  const [notasNormativas, setNotasNormativas] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (parametro) {
      setAlturaMaxPisos(parametro.alturaMaxPisos);
      setAlturaMaxMetros(parametro.alturaMaxMetros);
      setCoeficienteEdificacion(parametro.coeficienteEdificacion);
      setAreaLibreMinPct(parametro.areaLibreMinPct);
      setFrenteMinimoM(parametro.frenteMinimoM);
      setLoteMinimoM2(parametro.loteMinimoM2);
      setOrdenanzaReferencia(parametro.ordenanzaReferencia);
      setNotasNormativas(parametro.notasNormativas);
    }
  }, [parametro]);

  if (!parametro) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(parametro.id, {
        alturaMaxPisos: Number(alturaMaxPisos),
        alturaMaxMetros: Number(alturaMaxMetros),
        coeficienteEdificacion: Number(coeficienteEdificacion),
        areaLibreMinPct: Number(areaLibreMinPct),
        frenteMinimoM: Number(frenteMinimoM),
        loteMinimoM2: Number(loteMinimoM2),
        ordenanzaReferencia,
        notasNormativas,
      });
      onClose();
    } catch (err) {
      console.error("Error al guardar parámetro normativo:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-white border border-slate-200 text-slate-900 shadow-xl p-0 overflow-hidden">
        <DialogHeader className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-blue-50 border border-blue-200 text-blue-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                Editar Parámetro: {parametro.zonificacion} — {parametro.distrito}
              </DialogTitle>
              <p className="text-3xs text-slate-500 font-sans">
                Ajuste de límites normativos y ordenanzas municipales distritales
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs font-sans">
          <div className="bg-amber-50/70 border border-amber-200 rounded p-2 text-2xs text-amber-800 flex items-start space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
            <span>
              <strong>Aviso de Impacto Normativo:</strong> Modificar los parámetros urbanísticos de {parametro.distrito} actualizará las cabidas y el cálculo del motor de matching en tiempo real. Este cambio quedará registrado en la bitácora de auditoría forense.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-3xs font-mono font-bold uppercase text-slate-600">
                Altura Máxima (Pisos)
              </label>
              <Input
                type="number"
                min={1}
                max={40}
                value={alturaMaxPisos}
                onChange={(e) => setAlturaMaxPisos(Number(e.target.value))}
                className="h-8 text-xs font-mono bg-white border-slate-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs font-mono font-bold uppercase text-slate-600">
                Altura Máxima (Metros)
              </label>
              <Input
                type="number"
                step="0.5"
                min={3}
                max={150}
                value={alturaMaxMetros}
                onChange={(e) => setAlturaMaxMetros(Number(e.target.value))}
                className="h-8 text-xs font-mono bg-white border-slate-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs font-mono font-bold uppercase text-slate-600">
                Coeficiente de Edificación (C.E.)
              </label>
              <Input
                type="number"
                step="0.1"
                min={0.5}
                max={15}
                value={coeficienteEdificacion}
                onChange={(e) =>
                  setCoeficienteEdificacion(Number(e.target.value))
                }
                className="h-8 text-xs font-mono bg-white border-slate-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs font-mono font-bold uppercase text-slate-600">
                Área Libre Mínima (%)
              </label>
              <Input
                type="number"
                step="1"
                min={10}
                max={70}
                value={areaLibreMinPct}
                onChange={(e) => setAreaLibreMinPct(Number(e.target.value))}
                className="h-8 text-xs font-mono bg-white border-slate-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs font-mono font-bold uppercase text-slate-600">
                Frente Mínimo de Lote (m)
              </label>
              <Input
                type="number"
                step="0.5"
                min={6}
                max={50}
                value={frenteMinimoM}
                onChange={(e) => setFrenteMinimoM(Number(e.target.value))}
                className="h-8 text-xs font-mono bg-white border-slate-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs font-mono font-bold uppercase text-slate-600">
                Lote Normativo Mínimo (m²)
              </label>
              <Input
                type="number"
                step="10"
                min={100}
                max={10000}
                value={loteMinimoM2}
                onChange={(e) => setLoteMinimoM2(Number(e.target.value))}
                className="h-8 text-xs font-mono bg-white border-slate-300"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-3xs font-mono font-bold uppercase text-slate-600">
              Ordenanza Municipal de Respaldo
            </label>
            <Input
              type="text"
              value={ordenanzaReferencia}
              onChange={(e) => setOrdenanzaReferencia(e.target.value)}
              className="h-8 text-xs bg-white border-slate-300"
              placeholder="Ej: Ord. 618-MM / Ord. 2361-MML"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-3xs font-mono font-bold uppercase text-slate-600">
              Notas y Disposiciones Normativas Específicas
            </label>
            <textarea
              value={notasNormativas}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNotasNormativas(e.target.value)
              }
              rows={2}
              className="w-full text-xs p-2 rounded border border-slate-300 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Observaciones de retiros, incentivos sostenibles o restricciones..."
            />
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-7 text-xs border-slate-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isSaving ? "Guardando..." : "Guardar Parámetros"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
