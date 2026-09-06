"use client";

import React, { useState } from "react";
import { MatchEvaluationResult, EtapaNegociacion } from "@/types";
import { createNegociacion } from "@/lib/services/negociaciones";
import { mockUsuarios } from "@/lib/mock/negociaciones-seed";
import {
  GitPullRequest,
  CheckCircle2,
  Building,
  User,
  DollarSign,
  Send,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface QuickDealDialogProps {
  match: MatchEvaluationResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuickDealDialog({
  match,
  open,
  onOpenChange,
  onSuccess,
}: QuickDealDialogProps) {
  const [brokerId, setBrokerId] = useState(mockUsuarios[0]?.id || "");
  const [etapa, setEtapa] = useState<EtapaNegociacion>("Ficha_Enviada");
  const [montoOferta, setMontoOferta] = useState<string>("");
  const [probabilidad, setProbabilidad] = useState<number>(10);
  const [nota, setNota] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [createdDealId, setCreatedDealId] = useState<string | null>(null);

  React.useEffect(() => {
    if (open && match) {
      setBrokerId(mockUsuarios[0]?.id || "");
      setEtapa(match.scoreMatch >= 80 ? "En_Evaluacion" : "Ficha_Enviada");
      setMontoOferta(String(match.terreno.precioTotal || ""));
      setProbabilidad(match.scoreMatch >= 80 ? 25 : 10);
      setNota(
        `[MOTOR DE MATCHING] Afinidad: ${match.scoreMatch}% (${match.nivelCompatibilidad}). Criterios compatibles: ${match.razones.join(", ")}.`
      );
      setCreatedDealId(null);
    }
  }, [open, match]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    setLoading(true);
    try {
      const deal = await createNegociacion({
        terrenoId: match.terreno.id,
        clienteId: match.cliente.id,
        brokerId: brokerId || mockUsuarios[0].id,
        etapaInicial: etapa,
        montoOferta: Number(montoOferta),
        probabilidadCierre: probabilidad,
        notaInicial: nota,
      });

      setCreatedDealId(deal.id);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error al crear negociación:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCreatedDealId(null);
    onOpenChange(false);
  };

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-4 bg-white border border-slate-200 text-slate-800 shadow-2xl">
        <DialogHeader className="pb-2 border-b border-slate-200">
          <DialogTitle className="text-sm font-mono flex items-center gap-2 text-slate-900">
            <GitPullRequest className="w-4 h-4 text-blue-600" />
            <span>Iniciar Negociación Comercial Directa</span>
          </DialogTitle>
        </DialogHeader>

        {createdDealId ? (
          <div className="py-6 text-center space-y-4 font-sans">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                ¡Negociación Creada en Pipeline!
              </h3>
              <p className="text-xs text-slate-600">
                La oportunidad comercial para{" "}
                <span className="text-slate-900 font-semibold">
                  {match.cliente.razonSocial}
                </span>{" "}
                ha sido registrada en la etapa{" "}
                <span className="text-blue-600 font-mono font-semibold">
                  {etapa.replace("_", " ")}
                </span>
                .
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <Link href={`/pipeline?dealId=${createdDealId}`} onClick={handleClose}>
                <Button
                  size="sm"
                  className="h-8 text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver en Pipeline Comercial</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-8 text-xs font-mono border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2 text-xs font-sans">
            {/* Tarjeta Resumen del Match */}
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1.5 font-mono text-2xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Terreno Objetivo:</span>
                <span className="text-slate-900 font-bold">
                  {match.terreno.codigoInterno} ({match.terreno.distrito})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Comprador:</span>
                <span className="text-blue-600 font-semibold truncate max-w-[200px]">
                  {match.cliente.razonSocial}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Afinidad Calculada:</span>
                <Badge
                  className={`font-mono text-3xs font-bold ${
                    match.scoreMatch >= 80
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                      : "bg-blue-50 text-blue-700 border border-blue-300"
                  }`}
                >
                  {match.scoreMatch}% Match ({match.nivelCompatibilidad})
                </Badge>
              </div>
            </div>

            {/* Broker Asignado */}
            <div className="space-y-1">
              <label className="text-2xs font-mono text-slate-600">
                Broker Responsable de la Cuenta:
              </label>
              <select
                value={brokerId}
                onChange={(e) => setBrokerId(e.target.value)}
                className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-slate-800 text-xs font-mono focus:outline-hidden focus:border-blue-500"
              >
                {mockUsuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.rol})
                  </option>
                ))}
              </select>
            </div>

            {/* Etapa Inicial */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-2xs font-mono text-slate-600">
                  Etapa Inicial:
                </label>
                <select
                  value={etapa}
                  onChange={(e) => setEtapa(e.target.value as EtapaNegociacion)}
                  className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-slate-800 text-xs font-mono focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Ficha_Enviada">Ficha Enviada</option>
                  <option value="En_Evaluacion">En Evaluación</option>
                  <option value="Visita_Realizada">Visita Realizada</option>
                  <option value="LOI_Oferta">Carta de Intención / LOI</option>
                </select>
              </div>

              {/* Monto de Oferta Base */}
              <div className="space-y-1">
                <label className="text-2xs font-mono text-slate-600">
                  Monto Oferta ($ USD):
                </label>
                <Input
                  type="number"
                  value={montoOferta}
                  onChange={(e) => setMontoOferta(e.target.value)}
                  className="h-8 text-xs bg-white border-slate-300 font-mono text-emerald-700"
                  required
                />
              </div>
            </div>

            {/* Nota de Auditoría Comercial */}
            <div className="space-y-1">
              <label className="text-2xs font-mono text-slate-600">
                Nota Inicial para la Bitácora de Auditoría:
              </label>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                rows={3}
                className="w-full p-2 bg-white border border-slate-300 rounded text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 text-xs font-mono text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="h-8 text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>{loading ? "Creando..." : "Crear en Pipeline"}</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
