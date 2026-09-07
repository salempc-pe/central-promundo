"use client";

import React, { useState, useEffect } from "react";
import { MatchEvaluationResult, EtapaNegociacion, Usuario } from "@/types";
import { createNegociacionAction, getBrokersAction } from "@/lib/actions/pipeline-actions";
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
  brokers?: Usuario[];
}

export function QuickDealDialog({
  match,
  open,
  onOpenChange,
  onSuccess,
  brokers = [],
}: QuickDealDialogProps) {
  const [brokersList, setBrokersList] = useState<Usuario[]>(brokers);

  useEffect(() => {
    if (brokers && brokers.length > 0) {
      setBrokersList(brokers);
    } else {
      getBrokersAction().then((loaded) => {
        if (loaded && loaded.length > 0) {
          setBrokersList(loaded);
        }
      });
    }
  }, [brokers]);

  const [brokerId, setBrokerId] = useState<string>(brokersList[0]?.id || "");
  const [etapa, setEtapa] = useState<EtapaNegociacion>("Ficha_Enviada");
  const [montoOferta, setMontoOferta] = useState<string>("");
  const [probabilidad, setProbabilidad] = useState<number>(10);
  const [nota, setNota] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [createdDealId, setCreatedDealId] = useState<string | null>(null);

  useEffect(() => {
    if (open && match) {
      if (brokersList.length > 0 && !brokerId) {
        setBrokerId(brokersList[0].id);
      }
      setEtapa(match.scoreMatch >= 80 ? "En_Evaluacion" : "Ficha_Enviada");
      setMontoOferta(String(match.terreno.precioTotal || ""));
      setProbabilidad(match.scoreMatch >= 80 ? 25 : 10);
      setNota(
        `[MOTOR DE MATCHING] Afinidad: ${match.scoreMatch}% (${match.nivelCompatibilidad}). Criterios compatibles: ${match.razones.join(", ")}.`
      );
      setCreatedDealId(null);
    }
  }, [open, match, brokersList, brokerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    setLoading(true);
    try {
      const res = await createNegociacionAction({
        terrenoId: match.terreno.id,
        clienteId: match.cliente.id,
        brokerId: brokerId || brokersList[0]?.id || "",
        etapaInicial: etapa,
        montoOferta: Number(montoOferta),
        probabilidadCierre: probabilidad,
        notaInicial: nota,
      });

      if (res.success && res.data) {
        setCreatedDealId(res.data.id);
        if (onSuccess) onSuccess();
      }
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
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-blue-600" />
            <DialogTitle className="text-sm font-mono font-bold text-slate-900">
              Crear Negociación Inmediata (Quick Deal)
            </DialogTitle>
          </div>
          <p className="text-3xs font-mono text-slate-500">
            Convierte esta compatibilidad algorítmica directamente en una oportunidad del Pipeline en PostgreSQL
          </p>
        </DialogHeader>

        {createdDealId ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-mono">
                ¡Negociación Registrada con Éxito en BD!
              </h4>
              <p className="text-3xs text-slate-500 font-mono mt-1">
                El lote <strong className="text-slate-800">{match.terreno.codigoInterno}</strong> y la constructora{" "}
                <strong className="text-slate-800">{match.cliente.razonSocial}</strong> ya se encuentran activos en el embudo comercial.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <Link href={`/pipeline?dealId=${createdDealId}`}>
                <Button size="sm" variant="default" className="text-2xs font-mono h-7 gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <ExternalLink className="w-3 h-3" />
                  <span>Ver en Pipeline Comercial</span>
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={handleClose} className="text-2xs font-mono h-7">
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            {/* Resumen del Cruce */}
            <div className="bg-slate-50/80 border border-slate-200 rounded p-2.5 text-2xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  Terreno:
                </span>
                <span className="font-bold text-slate-900">
                  {match.terreno.codigoInterno} ({match.terreno.distrito})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  Cliente:
                </span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">
                  {match.cliente.razonSocial}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Afinidad Algorítmica:</span>
                <Badge
                  variant={
                    match.scoreMatch >= 80
                      ? "success"
                      : match.scoreMatch >= 60
                      ? "default"
                      : "secondary"
                  }
                  className="font-mono text-3xs font-bold"
                >
                  {match.scoreMatch}% • {match.nivelCompatibilidad}
                </Badge>
              </div>
            </div>

            {/* Parámetros de la Oportunidad */}
            <div className="grid grid-cols-2 gap-2 text-2xs">
              <div>
                <label className="text-3xs font-mono text-slate-500 uppercase block mb-1">
                  Broker Responsable
                </label>
                <select
                  value={brokerId}
                  onChange={(e) => setBrokerId(e.target.value)}
                  className="w-full h-7 bg-white border border-slate-300 rounded text-3xs font-mono px-2 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {brokersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.rol === "admin" ? "Admin" : "Broker Senior"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-3xs font-mono text-slate-500 uppercase block mb-1">
                  Etapa Inicial
                </label>
                <select
                  value={etapa}
                  onChange={(e) => setEtapa(e.target.value as EtapaNegociacion)}
                  className="w-full h-7 bg-white border border-slate-300 rounded text-3xs font-mono px-2 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Ficha_Enviada">Ficha Enviada (10%)</option>
                  <option value="En_Evaluacion">En Evaluación (25%)</option>
                  <option value="Visita_Realizada">Visita Realizada (40%)</option>
                  <option value="LOI_Oferta">LOI / Carta Oferta (60%)</option>
                </select>
              </div>
            </div>

            {/* Monto de Oferta Preliminar */}
            <div>
              <label className="text-3xs font-mono text-slate-500 uppercase block mb-1">
                Monto de Oferta Estimado (USD)
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
                <Input
                  type="number"
                  value={montoOferta}
                  onChange={(e) => setMontoOferta(e.target.value)}
                  placeholder="0.00"
                  className="h-7 text-xs font-mono pl-7 bg-white border-slate-300"
                  required
                />
              </div>
            </div>

            {/* Nota de Bitácora Inicial */}
            <div>
              <label className="text-3xs font-mono text-slate-500 uppercase block mb-1">
                Nota Inicial para Bitácora Fiduciaria
              </label>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-300 rounded p-1.5 text-3xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                placeholder="Ingresar antecedentes de la compatibilidad o estrategia..."
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-7 text-3xs font-mono"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="h-7 text-3xs font-mono gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-3 h-3" />
                <span>{loading ? "Creando en BD..." : "Crear Oportunidad en Pipeline"}</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
