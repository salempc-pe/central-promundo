"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Building,
  MapPin,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  Mail,
  ExternalLink,
  Layers,
  DollarSign,
  TrendingUp,
  Clock,
  Send,
  Download,
  Share2,
} from "lucide-react";
import { TerrenoCompleto, ClientMatchResult, DocumentoConTerreno } from "@/types";
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
import { formatCurrency, formatArea, formatPricePerM2, formatBytes, formatDateSpanish } from "@/lib/utils";
import { getMatchingForTerreno } from "@/lib/services/terrenos";
import { getDocumentosByTerrenoId, toggleConfidencial, deleteDocumento } from "@/lib/services/documentos";
import { getNegociacionesByTerrenoId } from "@/lib/services/negociaciones";
import { VigenciaBadge } from "@/components/documentos/vigencia-badge";
import { PdfViewerModal } from "@/components/documentos/pdf-viewer-modal";
import { DocumentoUploadDialog } from "@/components/documentos/documento-upload-dialog";
import { StageBadge } from "@/components/pipeline/stage-badge";
import { Lock, Globe, Eye, Trash2, UploadCloud, GitPullRequest } from "lucide-react";
import { NegociacionCompleta } from "@/types";

interface TerrenoDetailSheetProps {
  terreno: TerrenoCompleto | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export function TerrenoDetailSheet({
  terreno,
  isOpen,
  onClose,
  defaultTab = "ficha",
}: TerrenoDetailSheetProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [matches, setMatches] = useState<ClientMatchResult[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoConTerreno[]>([]);
  const [negociaciones, setNegociaciones] = useState<NegociacionCompleta[]>([]);
  const [viewerDoc, setViewerDoc] = useState<DocumentoConTerreno | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [bitacoraNotas, setBitacoraNotas] = useState<string[]>([]);
  const [nuevaNota, setNuevaNota] = useState("");

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  const loadDocs = React.useCallback(async (terrenoId: string) => {
    const docs = await getDocumentosByTerrenoId(terrenoId);
    setDocumentos(docs);
  }, []);

  const loadNegociaciones = React.useCallback(async (terrenoId: string) => {
    const negs = await getNegociacionesByTerrenoId(terrenoId);
    setNegociaciones(negs);
  }, []);

  useEffect(() => {
    if (terreno) {
      getMatchingForTerreno(terreno).then(setMatches);
      loadDocs(terreno.id);
      loadNegociaciones(terreno.id);
    }
  }, [terreno, loadDocs, loadNegociaciones]);


  if (!terreno) return null;

  const handleAddNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNota.trim()) return;
    setBitacoraNotas([
      `[${new Date().toLocaleTimeString()}] ${nuevaNota.trim()}`,
      ...bitacoraNotas,
    ]);
    setNuevaNota("");
  };

  const docCpu = terreno.documentos?.find(
    (d) => d.tipoDocumento === "Certificado_Parametros"
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 flex flex-col h-full w-full sm:max-w-xl lg:max-w-2xl">
        {/* Cabecera del Panel de Inspección */}
        <SheetHeader className="p-3 bg-slate-50 text-slate-800 border-b border-slate-200">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-blue-600">
                {terreno.codigoInterno}
              </span>
              <Badge
                variant={
                  terreno.estadoTerreno === "Disponible"
                    ? "success"
                    : terreno.estadoTerreno === "En Negociacion"
                    ? "warning"
                    : "secondary"
                }
                className="text-3xs"
              >
                {terreno.estadoTerreno}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-slate-900">
                {formatCurrency(Number(terreno.precioTotal), terreno.moneda)}
              </div>
              <div className="text-3xs font-mono text-slate-500">
                {formatPricePerM2(Number(terreno.precioM2), terreno.moneda)}
              </div>
            </div>
          </div>
          <div className="text-2xs text-slate-600 font-sans truncate">
            {terreno.distrito} — {terreno.direccion}
          </div>
        </SheetHeader>

        {/* Pestañas de Navegación del Sheet */}
        <div className="p-2 bg-slate-100 border-b border-slate-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 h-7">
              <TabsTrigger value="ficha" className="text-3xs">
                Ficha Técnica
              </TabsTrigger>
              <TabsTrigger value="propietario" className="text-3xs">
                Propietario
              </TabsTrigger>
              <TabsTrigger value="documentos" className="text-3xs">
                Documentos ({documentos.length})
              </TabsTrigger>
              <TabsTrigger value="matching" className="text-3xs">
                Matching ({matches.length})
              </TabsTrigger>
              <TabsTrigger value="bitacora" className="text-3xs">
                Bitácora
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Contenido Principal de las Pestañas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 1: FICHA TÉCNICA */}
          {activeTab === "ficha" && (
            <div className="space-y-4">
              {/* Matriz de Parámetros Urbanísticos */}
              <div>
                <h3 className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
                  Parámetros Urbanísticos Normativos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Zonificación</div>
                    <div className="text-sm font-bold font-mono text-purple-700">
                      {terreno.zonificacion}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Área de Terreno</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {formatArea(Number(terreno.areaM2))}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Frente Lineal</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {terreno.frenteLinealM ? `${terreno.frenteLinealM} m` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Fondo Promedio</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {terreno.fondoPromedioM ? `${terreno.fondoPromedioM} m` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Altura Máx.</div>
                    <div className="text-sm font-bold font-mono text-blue-700">
                      {terreno.alturaMaxPisos ? `${terreno.alturaMaxPisos} pisos` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Coef. Edificación</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {terreno.coeficienteEdificacion || "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Área Libre Mín.</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {terreno.areaLibreMinPct ? `${terreno.areaLibreMinPct}%` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Moneda</div>
                    <div className="text-sm font-bold font-mono text-emerald-700">
                      {terreno.moneda} (Dólares)
                    </div>
                  </div>
                </div>
              </div>

              {/* Usos Permitidos */}
              <div>
                <h3 className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-1.5">
                  Usos Urbanos Permitidos
                </h3>
                <div className="flex flex-wrap gap-1">
                  {(terreno.usosPermitidos || ["Multifamiliar"]).map((uso, i) => (
                    <Badge key={i} variant="outline" className="text-2xs bg-slate-50">
                      {uso}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Ubicación y Coordenadas GIS */}
              <div>
                <h3 className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-1.5">
                  Georreferenciación & Ubicación
                </h3>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2 text-2xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dirección:</span>
                    <span className="font-semibold text-slate-800">{terreno.direccion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distrito:</span>
                    <span className="font-semibold text-slate-800">{terreno.distrito}</span>
                  </div>
                  {terreno.referencia && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Referencia:</span>
                      <span className="text-slate-700">{terreno.referencia}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Coordenadas WGS84:</span>
                    <span className="font-bold text-slate-900">
                      {terreno.latitud}, {terreno.longitud}
                    </span>
                  </div>
                </div>
                {terreno.latitud && (
                  <div className="mt-2 space-y-1.5">
                    <Link href={`/mapa?terrenoId=${terreno.id}`}>
                      <Button
                        size="sm"
                        className="w-full text-2xs h-7 gap-1.5 font-mono bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Ver en Mapa Geoespacial del Sistema</span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-2xs h-7 gap-1 font-mono border-slate-200 text-slate-600 hover:text-slate-900"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps?q=${terreno.latitud},${terreno.longitud}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                      <span>Abrir en Google Maps Externo</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROPIETARIO */}
          {activeTab === "propietario" && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-2 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    {terreno.propietario.razonSocialONombre}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-2xs font-mono pt-1">
                  <div>
                    <span className="text-slate-400">Documento:</span>
                    <div className="font-semibold text-slate-800">
                      {terreno.propietario.tipoDoc}: {terreno.propietario.numeroDoc || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Contacto / Rep.:</span>
                    <div className="font-semibold text-slate-800">
                      {terreno.propietario.contactoRepresentante || "Directo"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Teléfono:</span>
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-slate-400" />
                      {terreno.propietario.telefono || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <div className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                      <Mail className="w-2.5 h-2.5 text-slate-400" />
                      {terreno.propietario.email || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {terreno.propietario.notasInternas && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xs text-2xs text-amber-900">
                  <div className="font-bold uppercase tracking-wider font-mono text-3xs text-amber-800 mb-1">
                    Notas Internas del Broker (Confidencial)
                  </div>
                  {terreno.propietario.notasInternas}
                </div>
              )}

              {terreno.propietario.telefono && (
                <Button
                  className="w-full h-8 text-xs font-mono bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() =>
                    window.open(
                      `https://wa.me/${terreno.propietario.telefono?.replace(/\D/g, "")}`,
                      "_blank"
                    )
                  }
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Abrir Conversación en WhatsApp</span>
                </Button>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENTOS */}
          {activeTab === "documentos" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Documentación Legal & Parámetros ({documentos.length})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link href={`/documentos?q=${terreno.codigoInterno}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-3xs font-mono border-slate-300 text-slate-700 hover:text-slate-900 gap-1"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span>Ir a Documentos</span>
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => setIsUploadOpen(true)}
                    className="h-6 text-3xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1"
                  >
                    <UploadCloud className="w-3 h-3" />
                    <span>+ Cargar Documento</span>
                  </Button>
                </div>
              </div>

              {documentos.length > 0 ? (
                <div className="space-y-2">
                  {documentos.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs flex flex-col gap-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          {doc.tipoDocumento === "Certificado_Parametros" ? (
                            <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          ) : doc.tipoDocumento === "Partida_Registral" ? (
                            <Building className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                          ) : doc.tipoDocumento === "Plano_Catastral" ? (
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <button
                              onClick={() => setViewerDoc(doc)}
                              className="text-left font-mono font-semibold text-slate-900 dark:text-slate-100 text-xs hover:text-blue-600 dark:hover:text-blue-400 truncate block max-w-[280px]"
                              title={doc.nombreArchivo}
                            >
                              {doc.nombreArchivo}
                            </button>
                            <div className="text-3xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>{doc.tipoDocumento}</span>
                              <span>•</span>
                              <span>{formatBytes(doc.tamanoBytes)}</span>
                              {doc.numeroDocumento && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[120px]">
                                    {doc.numeroDocumento}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <VigenciaBadge
                            estadoVigencia={doc.estadoVigencia}
                            diasParaVencer={doc.diasParaVencer}
                            fechaVencimiento={doc.fechaVencimiento}
                          />
                        </div>
                      </div>

                      {/* Barra de Acciones del Documento */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-3xs font-mono">
                        <button
                          onClick={async () => {
                            await toggleConfidencial(doc.id);
                            loadDocs(terreno.id);
                          }}
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                          {doc.esConfidencial ? (
                            <span className="text-amber-600 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Confidencial (Oculto)
                            </span>
                          ) : (
                            <span className="text-blue-600 flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" /> Compartible en Ficha
                            </span>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewerDoc(doc)}
                            className="h-6 px-1.5 text-3xs font-mono text-blue-600 hover:text-blue-800 gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Visor</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.archivoUrl, "_blank")}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
                            title="Descargar"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (window.confirm(`¿Eliminar ${doc.nombreArchivo}?`)) {
                                await deleteDocumento(doc.id);
                                loadDocs(terreno.id);
                              }
                            }}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xs text-slate-400 text-xs space-y-2">
                  <div>No hay documentos adjuntos para este lote.</div>
                  <Button
                    size="sm"
                    onClick={() => setIsUploadOpen(true)}
                    className="h-7 text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1"
                  >
                    <UploadCloud className="w-3 h-3" />
                    <span>Cargar Primer Documento</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MATCHING DE CONSTRUCTORAS */}
          {activeTab === "matching" && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-2xs font-bold text-blue-900 uppercase font-mono">
                    Algoritmo de Matching Inmobiliario Promundo
                  </div>
                  <Link href={`/matching?terrenoId=${terreno.id}`}>
                    <Button
                      size="sm"
                      className="h-6 px-2 text-3xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span>Abrir Módulo de Matching</span>
                    </Button>
                  </Link>
                </div>
                <div className="text-3xs text-blue-700 font-sans">
                  Cruce automático ponderando: Ticket financiero (30%), Distrito (25%), Zonificación (20%), Altura (15%) y Frente (10%).
                </div>
              </div>

              <div className="space-y-2">
                {matches.map((m, idx) => (
                  <Card key={m.cliente.id} className="border-slate-200">
                    <CardContent className="p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-xs">
                            {m.cliente.razonSocial}
                          </span>
                          <span className="text-3xs text-slate-400 font-mono ml-2">
                            ({m.cliente.tipoCliente})
                          </span>
                        </div>
                        <Badge
                          variant={
                            m.scoreMatch >= 80
                              ? "success"
                              : m.scoreMatch >= 50
                              ? "warning"
                              : "secondary"
                          }
                          className="font-mono text-2xs font-bold"
                        >
                          {m.scoreMatch}% Match
                        </Badge>
                      </div>

                      {/* Criterios cumplidos */}
                      <div className="flex flex-wrap gap-1 text-3xs font-mono pt-1">
                        {m.razon.map((r, i) => (
                          <span
                            key={i}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1 py-0.5 rounded flex items-center gap-0.5"
                          >
                            <CheckCircle2 className="w-2 h-2" />
                            <span>{r}</span>
                          </span>
                        ))}
                      </div>

                      {/* Acción comercial */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                        <span className="text-3xs text-slate-500 font-mono">
                          Contacto: {m.cliente.contactoNombre || "Gerencia de Desarrollo"}
                        </span>
                        <Button
                          size="sm"
                          className="h-6 text-3xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Enviar Ficha Comercial</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BITÁCORA Y AUDITORÍA */}
          {activeTab === "bitacora" && (
            <div className="space-y-4">
              {/* Negociaciones Activas del Lote */}
              {negociaciones.length > 0 && (
                <div className="space-y-2">
                  <div className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
                    <span>Negociaciones Vinculadas ({negociaciones.length})</span>
                    <Link
                      href={`/pipeline?terrenoId=${terreno.id}`}
                      className="text-blue-600 hover:underline flex items-center gap-0.5 normal-case font-semibold"
                    >
                      <span>Ir al Pipeline</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                  <div className="space-y-1.5">
                    {negociaciones.map((neg) => (
                      <div
                        key={neg.id}
                        className="p-2 bg-blue-50/60 border border-blue-200 rounded-xs flex items-center justify-between text-2xs font-mono"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 font-sans">
                            {neg.cliente.razonSocial}
                          </div>
                          <div className="text-3xs text-slate-500">
                            Broker: {neg.broker.nombre} • Oferta: {formatCurrency(neg.montoOferta, "USD")}
                          </div>
                        </div>
                        <StageBadge etapa={neg.etapa} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleAddNota} className="space-y-1.5">
                <label className="text-2xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                  Registrar Nota Operativa / Evento
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={nuevaNota}
                    onChange={(e) => setNuevaNota(e.target.value)}
                    placeholder="ej. Llamada con cliente Besco interesada en 1,500m2..."
                    className="flex-1 h-7 text-xs px-2 border border-slate-300 rounded-xs"
                  />
                  <Button type="submit" size="sm" className="h-7 text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white">
                    Agregar
                  </Button>
                </div>
              </form>

              <div className="space-y-1.5 pt-2">
                <div className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Historial de Auditoría
                </div>
                {bitacoraNotas.map((nota, i) => (
                  <div
                    key={i}
                    className="p-2 bg-slate-50 border-l-2 border-l-blue-600 border border-slate-200 rounded-xs text-2xs font-mono text-slate-800"
                  >
                    {nota}
                  </div>
                ))}
                {negociaciones.flatMap((n) => n.bitacora).map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2 bg-slate-50 border-l-2 border-l-purple-600 border border-slate-200 rounded-xs text-2xs font-mono text-slate-800 space-y-0.5"
                  >
                    <div className="text-3xs text-slate-500 flex justify-between">
                      <span className="font-bold text-purple-700">[{ev.tipoEvento.replace("_", " ")}] {ev.usuario?.nombre}</span>
                      <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>{ev.descripcion}</div>
                  </div>
                ))}
                <div className="p-2 bg-slate-50 border-l-2 border-l-slate-400 border border-slate-200 rounded-xs text-2xs font-mono text-slate-600">
                  [{new Date(terreno.createdAt).toLocaleDateString()}] Alta inicial de lote en el sistema por broker administrador.
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>

      {/* Visor de PDF Integrado */}
      <PdfViewerModal
        documento={viewerDoc}
        isOpen={Boolean(viewerDoc)}
        onClose={() => setViewerDoc(null)}
      />

      {/* Modal de Carga de Documentos */}
      <DocumentoUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => loadDocs(terreno.id)}
        defaultTerrenoId={terreno.id}
      />
    </Sheet>
  );
}

