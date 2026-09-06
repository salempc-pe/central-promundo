"use client";

import React from "react";
import { MatchEvaluationResult } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building,
  DollarSign,
  MapPin,
  Maximize2,
  Send,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

interface MatchDetailDrawerProps {
  match: MatchEvaluationResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartDeal: (match: MatchEvaluationResult) => void;
}

export function MatchDetailDrawer({
  match,
  open,
  onOpenChange,
  onStartDeal,
}: MatchDetailDrawerProps) {
  if (!match) return null;

  const { terreno, cliente, breakdown, gaps, razones } = match;

  const handleWhatsApp = () => {
    const texto = `Hola ${cliente.contactoNombre || cliente.razonSocial}, desde Promundo Land Intelligence tenemos un lote altamente compatible (${match.scoreMatch}% de afinidad) con su mandato de inversión:\n\n` +
      `📍 Lote: ${terreno.codigoInterno} - ${terreno.distrito}\n` +
      `📐 Área: ${terreno.areaM2} m² | Frente: ${terreno.frenteLinealM || "N/A"} m\n` +
      `🏢 Zonificación: ${terreno.zonificacion} | Altura: ${terreno.alturaMaxPisos || "N/A"} pisos\n` +
      `💰 Precio: $${Number(terreno.precioTotal).toLocaleString("en-US")} USD\n\n` +
      `¿Podemos coordinar una llamada para revisar la ficha técnica confidencial?`;
    window.open(`https://wa.me/${(cliente.telefono || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(texto)}`, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg bg-white border-l border-slate-200 text-slate-800 p-0 flex flex-col h-full shadow-2xl"
      >
        {/* Header Fijo */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <SheetTitle className="text-xs font-mono text-slate-900 uppercase tracking-wider">
                Auditoría de Afinidad Inmobiliaria
              </SheetTitle>
            </div>
            <div className="text-2xs text-slate-500 font-mono">
              Cruce: <span className="text-slate-900 font-bold">{terreno.codigoInterno}</span> ↔{" "}
              <span className="text-blue-600 font-bold">{cliente.razonSocial}</span>
            </div>
          </div>

          <Badge
            className={`font-mono text-xs font-bold px-2 py-0.5 ${
              match.scoreMatch >= 80
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                : match.scoreMatch >= 68
                ? "bg-blue-50 text-blue-700 border border-blue-300"
                : "bg-amber-50 text-amber-700 border border-amber-300"
            }`}
          >
            {match.scoreMatch}% Match ({match.nivelCompatibilidad})
          </Badge>
        </div>

        {/* Contenido Desplazable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
          {/* Recomendación Comercial */}
          <div className="bg-blue-50/60 border border-blue-200 rounded p-3 text-2xs space-y-1">
            <div className="font-mono font-bold text-blue-700 uppercase">
              Recomendación Operativa del Motor:
            </div>
            <p className="text-slate-700 leading-relaxed">
              {match.recomendacionComercial}
            </p>
          </div>

          {/* Desglose de los 5 Criterios */}
          <div className="space-y-2">
            <h4 className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-600">
              Desglose Ponderado de Puntos (100% Base)
            </h4>

            <div className="space-y-2 bg-slate-50 border border-slate-200 rounded p-3 text-2xs font-mono">
              {/* 1. Ticket */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">1. Ticket Presupuestal:</span>
                  <span className="text-slate-900 font-bold">{breakdown.ticketScore} pts</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${(breakdown.ticketScore / 30) * 100}%` }}
                  />
                </div>
              </div>

              {/* 2. Ubicación */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">2. Ubicación / Distritos:</span>
                  <span className="text-slate-900 font-bold">{breakdown.zonaScore} pts</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${(breakdown.zonaScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              {/* 3. Zonificación */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">3. Zonificación y Usos:</span>
                  <span className="text-slate-900 font-bold">{breakdown.zonifScore} pts</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all"
                    style={{ width: `${(breakdown.zonifScore / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* 4. Altura */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">4. Altura Normativa:</span>
                  <span className="text-slate-900 font-bold">{breakdown.alturaScore} pts</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all"
                    style={{ width: `${(breakdown.alturaScore / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* 5. Frente Lineal */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">5. Geometría / Frente:</span>
                  <span className="text-slate-900 font-bold">{breakdown.frenteAreaScore} pts</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-600 h-full rounded-full transition-all"
                    style={{ width: `${(breakdown.frenteAreaScore / 10) * 100}%` }}
                  />
                </div>
              </div>

              {breakdown.bonusCpuVigente > 0 && (
                <div className="pt-1.5 border-t border-slate-200 flex justify-between text-emerald-700 font-bold">
                  <span>Bonus CPU Vigente:</span>
                  <span>+{breakdown.bonusCpuVigente} pts</span>
                </div>
              )}
            </div>
          </div>

          {/* Análisis de Gaps & Hallazgos */}
          <div className="space-y-2">
            <h4 className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-600">
              Análisis Cuantitativo de Brechas (Gaps)
            </h4>

            <div className="space-y-1.5">
              {gaps.map((g, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded border text-2xs flex items-start gap-2 ${
                    g.tipo === "optimo"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : g.tipo === "alerta"
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {g.tipo === "optimo" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : g.tipo === "alerta" ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold">{g.mensaje}</div>
                    {g.delta && (
                      <div className="text-3xs font-mono opacity-80 mt-0.5">
                        Esperado: {g.delta.esperado} | Actual: {g.delta.actual}
                        {g.delta.diferenciaPct !== undefined &&
                          ` (${g.delta.diferenciaPct > 0 ? "+" : ""}${g.delta.diferenciaPct}%)`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparativa Técnica Frente a Mandato */}
          <div className="space-y-2">
            <h4 className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-600">
              Comparativa Lote vs Mandato de Inversión
            </h4>

            <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
              {/* Lote */}
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1">
                <div className="text-3xs font-bold text-slate-600 uppercase">
                  Parámetros del Lote
                </div>
                <div>Distrito: {terreno.distrito}</div>
                <div>Zonif: {terreno.zonificacion}</div>
                <div>Precio: ${Number(terreno.precioTotal).toLocaleString("en-US")}</div>
                <div>Altura: {terreno.alturaMaxPisos || "N/A"} pisos</div>
                <div>Frente: {terreno.frenteLinealM || "N/A"} m</div>
              </div>

              {/* Mandato Comprador */}
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1">
                <div className="text-3xs font-bold text-slate-600 uppercase">
                  Mandato Comprador
                </div>
                <div>Zonas: {(cliente.zonasInteres || []).join(", ") || "Todas"}</div>
                <div>Zonif: {(cliente.zonificacionesInteres || []).join(", ") || "Todas"}</div>
                <div>
                  Presup: ${Number(cliente.ticketMin || 0).toLocaleString("en-US")} - $
                  {Number(cliente.ticketMax || 0).toLocaleString("en-US")}
                </div>
                <div>Altura Mín: {cliente.alturaMinimaInteres || 0} pisos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Acciones Fija Inferior */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsApp}
            className="h-8 text-xs font-mono border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onStartDeal(match);
            }}
            className="h-8 text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1.5 flex-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Iniciar Negociación Comercial</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
