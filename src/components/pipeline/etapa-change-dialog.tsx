"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NegociacionCompleta,
  EtapaNegociacion,
  TipoEventoBitacora,
  ETAPAS_CONFIG,
  Usuario,
} from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Building,
  User,
  AlertTriangle,
} from "lucide-react";

interface EtapaChangeDialogProps {
  deal: NegociacionCompleta | null;
  targetStage?: EtapaNegociacion | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    nuevaEtapa: EtapaNegociacion;
    tipoEvento: TipoEventoBitacora;
    notaBitacora: string;
    montoOferta: number;
    probabilidadCierre: number;
    usuarioId: string;
  }) => Promise<void>;
  brokers: Usuario[];
}

const ETAPAS_LIST: EtapaNegociacion[] = [
  "Ficha_Enviada",
  "En_Evaluacion",
  "Visita_Realizada",
  "LOI_Oferta",
  "Due_Diligence",
  "Cierre_Ganado",
  "Descartado",
];

const TIPOS_EVENTO: { id: TipoEventoBitacora; label: string }[] = [
  { id: "Cambio_Estado", label: "Cambio de Estado / Transición" },
  { id: "Oferta_Presentada", label: "Oferta / LOI Presentada" },
  { id: "Reunion", label: "Reunión Comercial / Mesa de Trabajo" },
  { id: "Llamada", label: "Llamada Telefónica de Seguimiento" },
  { id: "Nota", label: "Nota Interna Confidencial" },
];

export function EtapaChangeDialog({
  deal,
  targetStage,
  isOpen,
  onClose,
  onConfirm,
  brokers,
}: EtapaChangeDialogProps) {
  const [nuevaEtapa, setNuevaEtapa] = useState<EtapaNegociacion>("En_Evaluacion");
  const [tipoEvento, setTipoEvento] = useState<TipoEventoBitacora>("Cambio_Estado");
  const [montoOferta, setMontoOferta] = useState<string>("");
  const [probabilidad, setProbabilidad] = useState<number>(25);
  const [usuarioId, setUsuarioId] = useState<string>("");
  const [notaBitacora, setNotaBitacora] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deal) {
      const initialTarget =
        targetStage || (deal.etapa as EtapaNegociacion) || "En_Evaluacion";
      setNuevaEtapa(initialTarget);
      setMontoOferta(deal.montoOferta || deal.terreno.precioTotal);
      setUsuarioId(deal.brokerId || brokers[0]?.id || "");
      setNotaBitacora("");
      setError(null);

      const config = ETAPAS_CONFIG[initialTarget];
      setProbabilidad(
        initialTarget === deal.etapa
          ? (deal.probabilidadCierre ?? config.probabilidadDefault)
          : config.probabilidadDefault
      );
    }
  }, [deal, targetStage, brokers]);

  const handleEtapaChange = (etapa: EtapaNegociacion) => {
    setNuevaEtapa(etapa);
    const config = ETAPAS_CONFIG[etapa];
    setProbabilidad(config.probabilidadDefault);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;

    if (!notaBitacora.trim() || notaBitacora.trim().length < 10) {
      setError("La nota de auditoría es obligatoria (mínimo 10 caracteres).");
      return;
    }

    const montoNum = parseFloat(montoOferta);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("El monto de oferta debe ser un número válido mayor a 0.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onConfirm({
        nuevaEtapa,
        tipoEvento,
        notaBitacora: notaBitacora.trim(),
        montoOferta: montoNum,
        probabilidadCierre: Number(probabilidad),
        usuarioId: usuarioId || brokers[0]?.id || "",
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al actualizar la etapa de la negociación.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!deal) return null;

  const currentConfig = ETAPAS_CONFIG[deal.etapa as EtapaNegociacion];
  const targetConfig = ETAPAS_CONFIG[nuevaEtapa];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white">
        {/* Cabecera del Modal */}
        <DialogHeader className="p-3.5 bg-slate-50 text-slate-800 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-600 font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>TRANSICIÓN COMERCIAL & AUDITORÍA OBLIGATORIA</span>
          </div>
          <DialogTitle className="text-sm font-bold text-slate-900 mt-1">
            Mover Negociación — {deal.terreno.codigoInterno}
          </DialogTitle>
          <DialogDescription className="text-2xs text-slate-600 font-sans">
            {deal.cliente.razonSocial} • {deal.terreno.distrito} ({deal.terreno.direccion})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {/* Visualizador de Transición de Etapa */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs flex items-center justify-between font-mono text-2xs">
            <div className="space-y-0.5">
              <span className="text-3xs text-slate-400 uppercase">Etapa Actual</span>
              <div className="font-bold text-slate-800">
                {currentConfig ? currentConfig.label : deal.etapa}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />

            <div className="space-y-0.5 text-right">
              <span className="text-3xs text-slate-400 uppercase">Nueva Etapa</span>
              <div className="font-bold text-blue-700">
                {targetConfig ? targetConfig.label : nuevaEtapa}
              </div>
            </div>
          </div>

          {/* Formulario de Campos */}
          <div className="grid grid-cols-2 gap-3">
            {/* Selector de Nueva Etapa */}
            <div className="space-y-1">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                Nueva Etapa *
              </label>
              <Select
                value={nuevaEtapa}
                onValueChange={(val) => handleEtapaChange(val as EtapaNegociacion)}
              >
                <SelectTrigger className="h-8 text-xs font-mono bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs font-mono">
                  {ETAPAS_LIST.map((etapa) => (
                    <SelectItem key={etapa} value={etapa}>
                      {ETAPAS_CONFIG[etapa].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Tipo de Evento en Bitácora */}
            <div className="space-y-1">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                Tipo de Evento *
              </label>
              <Select
                value={tipoEvento}
                onValueChange={(val) => setTipoEvento(val as TipoEventoBitacora)}
              >
                <SelectTrigger className="h-8 text-xs font-mono bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs font-mono">
                  {TIPOS_EVENTO.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Monto de Oferta (USD) */}
            <div className="space-y-1">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                Monto de Oferta (USD) *
              </label>
              <Input
                type="number"
                step="1000"
                value={montoOferta}
                onChange={(e) => setMontoOferta(e.target.value)}
                className="h-8 text-xs font-mono font-bold text-emerald-700 bg-white border-slate-300"
                placeholder="ej. 3500000"
              />
            </div>

            {/* Probabilidad de Cierre (%) */}
            <div className="space-y-1">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                Probabilidad Estimada (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={probabilidad}
                onChange={(e) => setProbabilidad(Number(e.target.value))}
                className="h-8 text-xs font-mono font-bold text-blue-700 bg-white border-slate-300"
              />
            </div>
          </div>

          {/* Broker Autor del Registro */}
          <div className="space-y-1">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
              Broker Responsable del Evento *
            </label>
            <Select value={usuarioId} onValueChange={setUsuarioId}>
              <SelectTrigger className="h-8 text-xs font-mono bg-white border-slate-300">
                <SelectValue placeholder="Seleccionar broker responsable..." />
              </SelectTrigger>
              <SelectContent className="text-xs font-mono max-h-56">
                {brokers.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    <div className="flex items-center justify-between gap-3 w-full pr-2">
                      <span className="font-semibold text-slate-900">{b.nombre}</span>
                      <span
                        className={`text-3xs px-1.5 py-0.5 rounded font-sans uppercase tracking-wider border ${
                          b.rol === "admin"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : b.rol === "broker_senior"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {b.rol.replace("_", " ")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nota Descriptiva OBLIGATORIA */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Nota de Auditoría / Justificación *
              </label>
              <span className="text-3xs text-rose-600 font-mono font-bold">
                Campo Obligatorio
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={notaBitacora}
              onChange={(e) => setNotaBitacora(e.target.value)}
              placeholder="Detalla el motivo del cambio de etapa, acuerdos alcanzados con la constructora, resultado de visitas o condiciones de la oferta..."
              className="w-full text-xs p-2 rounded-xs border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
            />
            <div className="text-3xs text-slate-400 font-mono">
              Este evento se insertará de forma inmutable en la bitácora de auditoría legal de la empresa.
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-2xs rounded-xs flex items-center gap-1.5 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botones de Acción */}
          <DialogFooter className="pt-2 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs font-mono"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="h-8 text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{submitting ? "Guardando..." : "Confirmar & Registrar Evento"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
