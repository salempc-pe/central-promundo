"use client";

import React, { useState } from "react";
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
  EtapaNegociacion,
  ETAPAS_CONFIG,
  Usuario,
  TerrenoCompleto,
  Cliente,
} from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Building, User, DollarSign, FileText, AlertTriangle, Loader2 } from "lucide-react";

interface DealCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    terrenoId: string;
    clienteId: string;
    brokerId: string;
    etapaInicial: EtapaNegociacion;
    montoOferta: number;
    probabilidadCierre: number;
    notaInicial: string;
  }) => Promise<void>;
  terrenosDisponibles: TerrenoCompleto[];
  clientesDisponibles: Cliente[];
  brokers: Usuario[];
  currentUserId?: string;
}

export function DealCreateDialog({
  isOpen,
  onClose,
  onSubmit,
  terrenosDisponibles,
  clientesDisponibles,
  brokers,
  currentUserId,
}: DealCreateDialogProps) {
  const [terrenoId, setTerrenoId] = useState<string>(
    terrenosDisponibles[0]?.id || ""
  );
  const [clienteId, setClienteId] = useState<string>(
    clientesDisponibles[0]?.id || ""
  );
  const [brokerId, setBrokerId] = useState<string>(() => {
    if (currentUserId && brokers.some((b) => b.id === currentUserId)) {
      return currentUserId;
    }
    return brokers[0]?.id || "";
  });
  const [etapaInicial, setEtapaInicial] = useState<EtapaNegociacion>("Ficha_Enviada");
  const [montoOferta, setMontoOferta] = useState<string>(
    terrenosDisponibles[0]?.precioTotal || "3000000"
  );
  const [probabilidad, setProbabilidad] = useState<number>(10);
  const [notaInicial, setNotaInicial] = useState<string>(
    "Apertura de proceso de negociación comercial con la constructora."
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bandera de inicialización para ejecutar la preselección de broker únicamente al abrir el diálogo
  const hasInitializedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
      setError(null);
      setSubmitting(false);
      return;
    }

    // Solo inicializar una vez por apertura cuando la lista de brokers esté disponible
    if (!hasInitializedRef.current && brokers.length > 0) {
      if (currentUserId && brokers.some((b) => b.id === currentUserId)) {
        setBrokerId(currentUserId);
      } else if (brokers[0]?.id) {
        setBrokerId(brokers[0].id);
      }
      hasInitializedRef.current = true;
    }

    if (!terrenoId && terrenosDisponibles.length > 0) {
      setTerrenoId(terrenosDisponibles[0].id);
      setMontoOferta(terrenosDisponibles[0].precioTotal);
    }
    if (!clienteId && clientesDisponibles.length > 0) {
      setClienteId(clientesDisponibles[0].id);
    }
  }, [isOpen, currentUserId, brokers, terrenosDisponibles, clientesDisponibles, terrenoId, clienteId]);

  const handleTerrenoChange = (id: string) => {
    setTerrenoId(id);
    const selected = terrenosDisponibles.find((t) => t.id === id);
    if (selected) {
      setMontoOferta(selected.precioTotal);
    }
  };

  const handleEtapaChange = (etapa: EtapaNegociacion) => {
    setEtapaInicial(etapa);
    setProbabilidad(ETAPAS_CONFIG[etapa].probabilidadDefault);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terrenoId) {
      setError("Selecciona un lote del inventario.");
      return;
    }
    if (!clienteId) {
      setError("Selecciona una constructora o cliente.");
      return;
    }
    if (!brokerId && (!brokers || brokers.length === 0)) {
      setError("No hay brokers registrados con cuenta Google/Gmail aprobada.");
      return;
    }
    const montoNum = parseFloat(montoOferta);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Ingresa un monto de oferta válido mayor a 0.");
      return;
    }
    if (!notaInicial.trim()) {
      setError("Ingresa una nota inicial para la bitácora.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const finalBrokerId = brokerId || (currentUserId && brokers.some((b) => b.id === currentUserId) ? currentUserId : brokers[0]?.id);
      if (!finalBrokerId) {
        throw new Error("Selecciona un broker responsable registrado con su Gmail.");
      }

      await onSubmit({
        terrenoId,
        clienteId,
        brokerId: finalBrokerId,
        etapaInicial,
        montoOferta: montoNum,
        probabilidadCierre: Number(probabilidad),
        notaInicial: notaInicial.trim(),
      });
      onClose();
    } catch (err: any) {
      console.error("DealCreateDialog submit error:", err);
      setError(err.message || "Error al crear la negociación.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTerreno = terrenosDisponibles.find((t) => t.id === terrenoId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white">
        <DialogHeader className="p-3.5 bg-slate-50 text-slate-800 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-600 font-bold">
            <Plus className="w-4 h-4" />
            <span>NUEVA OPORTUNIDAD COMERCIAL</span>
          </div>
          <DialogTitle className="text-sm font-bold text-slate-900 mt-1">
            Iniciar Negociación de Suelo
          </DialogTitle>
          <DialogDescription className="text-2xs text-slate-600 font-sans">
            Vincula un lote con una constructora interesada e inicia el pipeline con auditoría.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {/* Selector de Terreno */}
          <div className="space-y-1">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
              Terreno del Inventario *
            </label>
            <Select value={terrenoId} onValueChange={handleTerrenoChange}>
              <SelectTrigger className="h-8 text-xs font-mono bg-white border-slate-300">
                <SelectValue placeholder="Seleccionar terreno..." />
              </SelectTrigger>
              <SelectContent className="text-xs font-mono max-h-56">
                {terrenosDisponibles.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.codigoInterno} — {t.distrito} ({t.zonificacion}) • {formatCurrency(t.precioTotal, "USD")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTerreno && (
              <div className="text-3xs font-mono text-slate-500">
                {selectedTerreno.direccion} • {Number(selectedTerreno.areaM2).toFixed(0)} m²
              </div>
            )}
          </div>

          {/* Selector de Constructora / Cliente */}
          <div className="space-y-1">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
              Constructora / Fondo Comprador *
            </label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger className="h-8 text-xs font-mono bg-white border-slate-300">
                <SelectValue placeholder="Seleccionar constructora..." />
              </SelectTrigger>
              <SelectContent className="text-xs font-mono">
                {clientesDisponibles.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.razonSocial} ({c.tipoCliente})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Broker Responsable */}
            <div className="space-y-1">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                Broker Responsable *
              </label>
              <Select value={brokerId} onValueChange={setBrokerId}>
                <SelectTrigger className="h-8 text-xs font-mono bg-white border-slate-300">
                  <SelectValue placeholder="Seleccionar broker responsable..." />
                </SelectTrigger>
                <SelectContent className="text-xs font-mono max-h-56">
                  {brokers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <div className="flex items-center justify-between gap-3 w-full pr-2">
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-slate-900 leading-tight">{b.nombre}</span>
                          <span className="text-3xs text-slate-500 font-sans">{b.email}</span>
                        </div>
                        <span
                          className={`text-3xs px-1.5 py-0.5 rounded font-sans uppercase tracking-wider border shrink-0 ${
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

            {/* Etapa Inicial */}
            <div className="space-y-1">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                Etapa Inicial
              </label>
              <Select
                value={etapaInicial}
                onValueChange={(val) => handleEtapaChange(val as EtapaNegociacion)}
              >
                <SelectTrigger className="h-8 text-xs font-mono bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs font-mono">
                  {Object.values(ETAPAS_CONFIG).map((cfg) => (
                    <SelectItem key={cfg.id} value={cfg.id}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Monto de Oferta */}
            <div className="space-y-1">
              <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                Monto Oferta Inicial (USD) *
              </label>
              <Input
                type="number"
                step="1000"
                value={montoOferta}
                onChange={(e) => setMontoOferta(e.target.value)}
                className="h-8 text-xs font-mono font-bold text-emerald-700 bg-white border-slate-300"
              />
            </div>

            {/* Probabilidad */}
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

          {/* Nota Inicial en Bitácora */}
          <div className="space-y-1">
            <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
              Nota Inicial de Apertura *
            </label>
            <textarea
              required
              rows={2}
              value={notaInicial}
              onChange={(e) => setNotaInicial(e.target.value)}
              className="w-full text-xs p-2 rounded-xs border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
            />
          </div>

          {error && (
            <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-2xs rounded-xs flex items-center gap-1.5 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
              className="h-8 text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1 min-w-[140px]"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : (
                <Plus className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{submitting ? "Creando..." : "Crear Negociación"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
