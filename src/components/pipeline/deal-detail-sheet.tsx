"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  NegociacionCompleta,
  TipoEventoBitacora,
  ETAPAS_CONFIG,
  Usuario,
} from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StageBadge } from "./stage-badge";
import {
  formatCurrency,
  formatArea,
  formatPricePerM2,
  formatDateSpanish,
} from "@/lib/utils";
import {
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  Send,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  FileText,
  Calendar,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

interface DealDetailSheetProps {
  deal: NegociacionCompleta | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestChangeStage: (deal: NegociacionCompleta) => void;
  onAddBitacora: (
    negociacionId: string,
    tipoEvento: TipoEventoBitacora,
    descripcion: string,
    usuarioId: string
  ) => Promise<void>;
  brokers: Usuario[];
}

export function DealDetailSheet({
  deal,
  isOpen,
  onClose,
  onRequestChangeStage,
  onAddBitacora,
  brokers,
}: DealDetailSheetProps) {
  const [activeTab, setActiveTab] = useState("finanzas");
  const [tipoNota, setTipoNota] = useState<TipoEventoBitacora>("Nota");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [selectedBrokerId, setSelectedBrokerId] = useState(brokers[0]?.id || "usr-01");
  const [isAddingNota, setIsAddingNota] = useState(false);

  if (!deal) return null;

  const config = ETAPAS_CONFIG[deal.etapa as keyof typeof ETAPAS_CONFIG];
  const montoOferta = Number(deal.montoOferta || 0);
  const precioLista = Number(deal.terreno.precioTotal || 0);
  const diffPct =
    precioLista > 0 ? ((montoOferta - precioLista) / precioLista) * 100 : 0;
  const precioM2Oferta =
    Number(deal.terreno.areaM2) > 0
      ? montoOferta / Number(deal.terreno.areaM2)
      : 0;
  const comision3Pct = montoOferta * 0.03;
  const probCierre = deal.probabilidadCierre ?? 0;
  const valorPonderado = montoOferta * (probCierre / 100);

  const handleAddNotaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaDescripcion.trim()) return;

    setIsAddingNota(true);
    try {
      await onAddBitacora(
        deal.id,
        tipoNota,
        nuevaDescripcion.trim(),
        selectedBrokerId || deal.brokerId
      );
      setNuevaDescripcion("");
    } finally {
      setIsAddingNota(false);
    }
  };

  const isEstancado =
    deal.diasEnEtapaActual > 14 &&
    deal.etapa !== "Cierre_Ganado" &&
    deal.etapa !== "Descartado";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="p-0 flex flex-col h-full w-full sm:max-w-xl lg:max-w-2xl bg-white select-none"
      >
        {/* Cabecera del Panel */}
        <SheetHeader className="p-3 bg-slate-50 text-slate-800 border-b border-slate-200">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <Link
                href={`/terrenos?q=${deal.terreno.codigoInterno}`}
                className="font-mono text-base font-bold text-blue-600 hover:text-blue-800 hover:underline"
                title="Ver terreno en Data Grid"
              >
                {deal.terreno.codigoInterno}
              </Link>
              <Link
                href={`/mapa?terrenoId=${deal.terreno.id}`}
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="Ver lote en mapa geoespacial"
              >
                <MapPin className="w-3.5 h-3.5" />
              </Link>
              <StageBadge etapa={deal.etapa} />
              {deal.etapa === "Cierre_Ganado" && (
                <Link href={`/comisiones?q=${deal.terreno.codigoInterno}`}>
                  <Badge variant="outline" className="font-mono text-3xs bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 cursor-pointer">
                    Ver Comisión →
                  </Badge>
                </Link>
              )}
              {isEstancado && (
                <span className="text-3xs font-mono bg-rose-100 text-rose-700 border border-rose-300 px-1 py-0.2 rounded font-bold flex items-center gap-0.5 animate-pulse">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  SLA &gt;14d
                </span>
              )}
            </div>

            <div className="text-right">
              <div className="text-sm font-bold font-mono text-emerald-700">
                {formatCurrency(deal.montoOferta, "USD")}
              </div>
              <div className="text-3xs font-mono text-slate-500">
                Pond: {formatCurrency(valorPonderado, "USD")} ({probCierre}%)
              </div>
            </div>
          </div>

          <div className="text-2xs text-slate-600 font-sans truncate">
            {deal.cliente.razonSocial} • {deal.terreno.distrito} — {deal.terreno.direccion}
          </div>
        </SheetHeader>

        {/* Barra de Pestañas */}
        <div className="p-2 bg-slate-100 border-b border-slate-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 h-7">
              <TabsTrigger value="finanzas" className="text-3xs font-mono">
                Economía del Deal
              </TabsTrigger>
              <TabsTrigger value="partes" className="text-3xs font-mono">
                Partes & Contacto
              </TabsTrigger>
              <TabsTrigger value="bitacora" className="text-3xs font-mono">
                Bitácora ({deal.bitacora.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Contenido de Pestañas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 1: ECONOMÍA Y FICHA TÉCNICA */}
          {activeTab === "finanzas" && (
            <div className="space-y-4">
              {/* Botón de Transición Rápida */}
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-3xs font-mono text-blue-700 uppercase font-bold">
                    Etapa Actual: {config?.label}
                  </div>
                  <div className="text-2xs text-blue-900">
                    Días en etapa: <span className="font-bold font-mono">{deal.diasEnEtapaActual} días</span> (Total: {deal.diasTotales}d)
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onRequestChangeStage(deal)}
                  className="h-7 text-2xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>Mover Etapa</span>
                </Button>
              </div>

              {/* Matriz Financiera */}
              <div>
                <h3 className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
                  Estructura Financiera & Comisión
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Monto Oferta</div>
                    <div className="text-sm font-bold font-mono text-emerald-700">
                      {formatCurrency(montoOferta, "USD")}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Precio Lista Predio</div>
                    <div className="text-sm font-bold font-mono text-slate-800">
                      {formatCurrency(precioLista, "USD")}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Diferencial (Gap)</div>
                    <div
                      className={`text-sm font-bold font-mono ${
                        diffPct < 0 ? "text-amber-700" : "text-emerald-700"
                      }`}
                    >
                      {diffPct >= 0 ? `+${diffPct.toFixed(1)}%` : `${diffPct.toFixed(1)}%`}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Oferta / m²</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {formatPricePerM2(precioM2Oferta, "USD")}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Probabilidad</div>
                    <div className="text-sm font-bold font-mono text-blue-700">
                      {probCierre}%
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Valor Ponderado</div>
                    <div className="text-sm font-bold font-mono text-purple-700">
                      {formatCurrency(valorPonderado, "USD")}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs col-span-2">
                    <div className="text-3xs text-slate-500 font-mono">
                      Comisión Promundo (3% Pactado)
                    </div>
                    <div className="text-sm font-bold font-mono text-amber-700">
                      {formatCurrency(comision3Pct, "USD")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ficha Técnica del Suelo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Parámetros Técnicos del Suelo ({deal.terreno.codigoInterno})
                  </h3>
                  <Link
                    href={`/terrenos?q=${deal.terreno.codigoInterno}`}
                    className="text-3xs font-mono text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    <span>Ver Ficha Completa</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-2xs font-mono">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <span className="text-slate-400">Área:</span>
                    <div className="font-bold text-slate-900">
                      {formatArea(deal.terreno.areaM2)}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <span className="text-slate-400">Zonificación:</span>
                    <div className="font-bold text-purple-700">
                      {deal.terreno.zonificacion}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <span className="text-slate-400">Altura Máx.:</span>
                    <div className="font-bold text-blue-700">
                      {deal.terreno.alturaMaxPisos ? `${deal.terreno.alturaMaxPisos} pisos` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <span className="text-slate-400">Frente Lineal:</span>
                    <div className="font-bold text-slate-900">
                      {deal.terreno.frenteLinealM ? `${deal.terreno.frenteLinealM} m` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <span className="text-slate-400">Fondo Promedio:</span>
                    <div className="font-bold text-slate-900">
                      {deal.terreno.fondoPromedioM ? `${deal.terreno.fondoPromedioM} m` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <span className="text-slate-400">Coef. Edificación:</span>
                    <div className="font-bold text-slate-900">
                      {deal.terreno.coeficienteEdificacion || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTES & CONTACTO */}
          {activeTab === "partes" && (
            <div className="space-y-4">
              {/* Constructora / Comprador */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-sm">
                      {deal.cliente.razonSocial}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-3xs font-mono">
                    {deal.cliente.tipoCliente}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                  <div>
                    <span className="text-slate-400">Contacto Principal:</span>
                    <div className="font-semibold text-slate-800">
                      {deal.cliente.contactoNombre || "Gerencia de Desarrollo"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Teléfono:</span>
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{deal.cliente.telefono || "N/A"}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Email:</span>
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{deal.cliente.email || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Ticket Min - Max:</span>
                    <div className="font-semibold text-emerald-700">
                      {formatCurrency(deal.cliente.ticketMin, "USD")} - {formatCurrency(deal.cliente.ticketMax, "USD")}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Zonas de Interés:</span>
                    <div className="text-slate-700 truncate">
                      {deal.cliente.zonasInteres?.join(", ") || "Lima Metropolitana"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Broker Líder */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <User className="w-4 h-4 text-slate-700" />
                  <span className="font-bold text-slate-900 text-sm">
                    Broker Responsable: {deal.broker.nombre}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                  <div>
                    <span className="text-slate-400">Rol:</span>
                    <div className="font-semibold text-slate-800 uppercase">
                      {deal.broker.rol.replace("_", " ")}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Email Corporativo:</span>
                    <div className="font-semibold text-slate-800">
                      {deal.broker.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Propietario del Lote */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    Propietario / Titular del Suelo
                  </span>
                </div>
                <div className="text-2xs font-mono space-y-1">
                  <div className="font-bold text-slate-800">
                    {deal.terreno.propietario.razonSocialONombre}
                  </div>
                  <div className="text-slate-600">
                    {deal.terreno.propietario.tipoDoc}: {deal.terreno.propietario.numeroDoc || "N/A"} • Tel: {deal.terreno.propietario.telefono || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BITÁCORA DE AUDITORÍA (TIMELINE) */}
          {activeTab === "bitacora" && (
            <div className="space-y-4">
              {/* Formulario Inline para Registrar Nuevo Evento */}
              <form
                onSubmit={handleAddNotaSubmit}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Registrar Nuevo Evento en Bitácora
                  </span>
                  <span className="text-3xs font-mono text-slate-400">
                    Inmutable
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-3xs font-mono text-slate-500 uppercase">
                      Tipo de Evento
                    </label>
                    <select
                      value={tipoNota}
                      onChange={(e) =>
                        setTipoNota(e.target.value as TipoEventoBitacora)
                      }
                      className="w-full h-7 text-2xs font-mono bg-white border border-slate-300 rounded px-1.5"
                    >
                      <option value="Nota">Nota Confidencial</option>
                      <option value="Llamada">Llamada Telefónica</option>
                      <option value="Reunion">Reunión Comercial</option>
                      <option value="Oferta_Presentada">Oferta Presentada</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-3xs font-mono text-slate-500 uppercase">
                      Broker Autor
                    </label>
                    <select
                      value={selectedBrokerId}
                      onChange={(e) => setSelectedBrokerId(e.target.value)}
                      className="w-full h-7 text-2xs font-mono bg-white border border-slate-300 rounded px-1.5"
                    >
                      {brokers.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <textarea
                    rows={2}
                    required
                    value={nuevaDescripcion}
                    onChange={(e) => setNuevaDescripcion(e.target.value)}
                    placeholder="Detalla acuerdos, llamadas, compromisos o feedback del cliente..."
                    className="w-full text-xs p-2 bg-white rounded-xs border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isAddingNota || !nuevaDescripcion.trim()}
                    className="h-7 text-2xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isAddingNota ? "Guardando..." : "Agregar a Bitácora"}</span>
                  </Button>
                </div>
              </form>

              {/* Timeline Histórico */}
              <div className="space-y-2">
                <div className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Historial Cronológico de Auditoría
                </div>

                <div className="space-y-2 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {deal.bitacora.map((ev) => (
                    <div
                      key={ev.id}
                      className="relative pl-8 space-y-1 group"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-slate-500 border-2 border-white shadow-xs group-hover:bg-blue-600 transition-colors" />

                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs space-y-1 text-2xs font-sans">
                        <div className="flex items-center justify-between font-mono text-3xs">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1 py-0.2 rounded font-bold uppercase ${
                                ev.tipoEvento === "Oferta_Presentada"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ev.tipoEvento === "Cambio_Estado"
                                  ? "bg-blue-100 text-blue-800"
                                  : ev.tipoEvento === "Reunion"
                                  ? "bg-purple-100 text-purple-800"
                                  : ev.tipoEvento === "Llamada"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {ev.tipoEvento.replace("_", " ")}
                            </span>
                            <span className="font-semibold text-slate-700">
                              {ev.usuario?.nombre || "Broker Promundo"}
                            </span>
                          </div>
                          <span className="text-slate-400">
                            {new Date(ev.createdAt).toLocaleString("es-PE", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="text-slate-800 leading-relaxed text-xs">
                          {ev.descripcion}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
