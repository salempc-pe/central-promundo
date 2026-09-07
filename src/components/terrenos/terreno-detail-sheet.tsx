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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ZONIFICACIONES_POR_CATEGORIA,
  getZonificacionBadgeClass,
  getZonificacionLabel,
} from "@/lib/constants/zonificaciones";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatArea, formatPricePerM2, formatBytes, formatDateSpanish } from "@/lib/utils";
import { calcularMatchingTerreno } from "@/lib/services/matching";
import {
  getDocumentosAction,
  toggleConfidencialAction,
  deleteDocumentoAction,
} from "@/lib/actions/documentos-actions";
import { getNegociacionesAction, getClientesAction } from "@/lib/actions/pipeline-actions";
import { VigenciaBadge } from "@/components/documentos/vigencia-badge";
import { PdfViewerModal } from "@/components/documentos/pdf-viewer-modal";
import { DocumentoUploadDialog } from "@/components/documentos/documento-upload-dialog";
import { StageBadge } from "@/components/pipeline/stage-badge";
import { Lock, Globe, Eye, Trash2, UploadCloud, GitPullRequest, Edit3, Check, Loader2 } from "lucide-react";
import { NegociacionCompleta } from "@/types";
import { Input } from "@/components/ui/input";
import { updateTerrenoAction, deleteTerrenoAction } from "@/lib/actions/terrenos-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface TerrenoDetailSheetProps {
  terreno: TerrenoCompleto | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
  onTerrenoUpdated?: (t: TerrenoCompleto) => void;
  onTerrenoDeleted?: (terrenoId: string) => void;
  clientes?: any[];
}

export function TerrenoDetailSheet({
  terreno,
  isOpen,
  onClose,
  defaultTab = "ficha",
  onTerrenoUpdated,
  onTerrenoDeleted,
  clientes,
}: TerrenoDetailSheetProps) {
  const [currentTerreno, setCurrentTerreno] = useState<TerrenoCompleto | null>(terreno);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [matches, setMatches] = useState<ClientMatchResult[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoConTerreno[]>([]);
  const [negociaciones, setNegociaciones] = useState<NegociacionCompleta[]>([]);
  const [viewerDoc, setViewerDoc] = useState<DocumentoConTerreno | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [bitacoraNotas, setBitacoraNotas] = useState<string[]>([]);
  const [nuevaNota, setNuevaNota] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPrecioTotal, setEditPrecioTotal] = useState("");
  const [editZonificacion, setEditZonificacion] = useState("");
  const [editAlturaMax, setEditAlturaMax] = useState("");

  // Estados de eliminación fiduciaria
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmAcknowledge, setConfirmAcknowledge] = useState(false);

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    setCurrentTerreno(terreno);
    if (terreno) {
      setEditPrecioTotal(terreno.precioTotal);
      setEditZonificacion(terreno.zonificacion);
      setEditAlturaMax(terreno.alturaMaxPisos ? String(terreno.alturaMaxPisos) : "");
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);
      setDeleteError(null);
      setConfirmAcknowledge(false);
    }
  }, [terreno, isOpen]);

  const handleDeleteTerreno = async () => {
    if (!currentTerreno) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteTerrenoAction(currentTerreno.id);
      if (!res.success) {
        setDeleteError(res.error || "No se pudo eliminar el terreno de la base de datos.");
        setIsDeleting(false);
        return;
      }

      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      onTerrenoDeleted?.(currentTerreno.id);
      onClose();
    } catch (err: any) {
      console.error("Error al eliminar terreno:", err);
      setDeleteError(err.message || "Error inesperado al intentar eliminar el terreno.");
      setIsDeleting(false);
    }
  };

  const loadDocs = React.useCallback(async (terrenoId: string) => {
    const docs = await getDocumentosAction({ terrenoId });
    setDocumentos(docs);
  }, []);

  const loadNegociaciones = React.useCallback(async (terrenoId: string) => {
    const negs = await getNegociacionesAction({ busqueda: terrenoId });
    const directes = negs.filter((n) => n.terrenoId === terrenoId || n.terreno?.id === terrenoId);
    setNegociaciones(directes.length > 0 ? directes : negs);
  }, []);

  useEffect(() => {
    if (currentTerreno) {
      if (clientes && clientes.length > 0) {
        setMatches(calcularMatchingTerreno(currentTerreno, clientes));
      } else {
        getClientesAction().then((cls) => {
          setMatches(calcularMatchingTerreno(currentTerreno, cls));
        });
      }
      loadDocs(currentTerreno.id);
      loadNegociaciones(currentTerreno.id);
    }
  }, [currentTerreno, clientes, loadDocs, loadNegociaciones]);

  if (!currentTerreno) return null;

  const handleAddNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNota.trim()) return;
    setBitacoraNotas([
      `[${new Date().toLocaleTimeString()}] ${nuevaNota.trim()}`,
      ...bitacoraNotas,
    ]);
    setNuevaNota("");
  };

  const handleUpdateEstado = async (nuevoEstado: any) => {
    setIsUpdating(true);
    try {
      const res = await updateTerrenoAction(currentTerreno.id, {
        estadoTerreno: nuevoEstado,
      });
      if (res.success && res.data) {
        setCurrentTerreno(res.data);
        onTerrenoUpdated?.(res.data);
      }
    } catch (err) {
      console.error("Error al actualizar estado del terreno:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGuardarEdicionParametros = async () => {
    const pTot = parseFloat(editPrecioTotal);
    if (isNaN(pTot) || pTot <= 0) return;

    setIsUpdating(true);
    try {
      const area = parseFloat(currentTerreno.areaM2);
      const nuevoPM2 = area > 0 ? pTot / area : parseFloat(currentTerreno.precioM2);

      const res = await updateTerrenoAction(currentTerreno.id, {
        precioTotal: pTot,
        precioM2: nuevoPM2,
        zonificacion: editZonificacion || currentTerreno.zonificacion,
        alturaMaxPisos: editAlturaMax ? parseInt(editAlturaMax, 10) : undefined,
      });

      if (res.success && res.data) {
        setCurrentTerreno(res.data);
        onTerrenoUpdated?.(res.data);
        setIsEditMode(false);
      }
    } catch (err) {
      console.error("Error guardando edición de parámetros:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const docCpu = currentTerreno.documentos?.find(
    (d) => d.tipoDocumento === "Certificado_Parametros"
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 flex flex-col h-full w-full sm:max-w-xl lg:max-w-2xl bg-white">
        {/* Cabecera del Panel de Inspección */}
        <SheetHeader className="p-3 bg-slate-50 text-slate-800 border-b border-slate-200">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-blue-600">
                {currentTerreno.codigoInterno}
              </span>
              <div className="flex items-center gap-1.5">
                <Select
                  value={currentTerreno.estadoTerreno}
                  onValueChange={handleUpdateEstado}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="h-6 text-3xs font-mono font-semibold px-2 py-0 border-slate-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="Disponible" className="text-3xs font-mono text-emerald-700 font-semibold">
                      Disponible
                    </SelectItem>
                    <SelectItem value="En Negociacion" className="text-3xs font-mono text-amber-700 font-semibold">
                      En Negociación
                    </SelectItem>
                    <SelectItem value="Vendido" className="text-3xs font-mono text-slate-600">
                      Vendido
                    </SelectItem>
                    <SelectItem value="Inactivo" className="text-3xs font-mono text-slate-400">
                      Inactivo
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isUpdating && <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-slate-900">
                {formatCurrency(Number(currentTerreno.precioTotal), currentTerreno.moneda)}
              </div>
              <div className="text-3xs font-mono text-slate-500">
                {formatPricePerM2(Number(currentTerreno.precioM2), currentTerreno.moneda)}
              </div>
            </div>
          </div>
          <div className="text-2xs text-slate-600 font-sans truncate">
            {currentTerreno.distrito} — {currentTerreno.direccion}
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
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Parámetros Urbanísticos Normativos
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="h-6 text-3xs font-mono border-slate-300 text-blue-700 bg-blue-50/50 hover:bg-blue-100 gap-1"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>{isEditMode ? "Cerrar Edición" : "Editar Parámetros"}</span>
                  </Button>
                </div>

                {isEditMode ? (
                  <div className="p-3 bg-blue-50/40 border border-blue-200 rounded space-y-2 mb-3">
                    <div className="text-3xs font-bold text-blue-900 font-mono uppercase">
                      Edición de Condiciones Comerciales & Parámetros
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-3xs text-slate-600 font-mono mb-0.5">
                          Precio Total ({currentTerreno.moneda}):
                        </label>
                        <Input
                          type="number"
                          value={editPrecioTotal}
                          onChange={(e) => setEditPrecioTotal(e.target.value)}
                          className="h-7 text-xs font-mono bg-white border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs text-slate-600 font-mono mb-0.5">
                          Zonificación:
                        </label>
                        <Select value={editZonificacion} onValueChange={setEditZonificacion}>
                          <SelectTrigger className="h-7 text-xs font-mono font-bold bg-white border-slate-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 max-h-64">
                            {Object.entries(ZONIFICACIONES_POR_CATEGORIA).map(
                              ([cat, items], idx) => (
                                <SelectGroup key={cat}>
                                  {idx > 0 && <SelectSeparator className="bg-slate-200 my-1" />}
                                  <SelectLabel className="text-3xs font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-1">
                                    {cat}
                                  </SelectLabel>
                                  {items.map((z) => (
                                    <SelectItem
                                      key={z.value}
                                      value={z.value}
                                      className="text-xs font-mono py-1 cursor-pointer"
                                    >
                                      <span className="font-bold text-slate-900">{z.value}</span>
                                      <span className="text-slate-500 ml-1.5 font-sans text-3xs">
                                        — {z.nombre}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-3xs text-slate-600 font-mono mb-0.5">
                          Altura Máx (Pisos):
                        </label>
                        <Input
                          type="number"
                          value={editAlturaMax}
                          onChange={(e) => setEditAlturaMax(e.target.value)}
                          className="h-7 text-xs font-mono bg-white border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        onClick={handleGuardarEdicionParametros}
                        disabled={isUpdating}
                        className="h-7 text-3xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        <span>Guardar Cambios en Base de Datos</span>
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Zonificación</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono font-bold border ${getZonificacionBadgeClass(
                          currentTerreno.zonificacion
                        )}`}
                      >
                        {currentTerreno.zonificacion}
                      </span>
                      <span
                        className="text-3xs text-slate-500 truncate"
                        title={getZonificacionLabel(currentTerreno.zonificacion)}
                      >
                        {getZonificacionLabel(currentTerreno.zonificacion).split(" - ")[1] || ""}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Área de Terreno</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {formatArea(Number(currentTerreno.areaM2))}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Frente Lineal</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {currentTerreno.frenteLinealM ? `${currentTerreno.frenteLinealM} m` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Fondo Promedio</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {currentTerreno.fondoPromedioM ? `${currentTerreno.fondoPromedioM} m` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Altura Máx.</div>
                    <div className="text-sm font-bold font-mono text-blue-700">
                      {currentTerreno.alturaMaxPisos ? `${currentTerreno.alturaMaxPisos} pisos` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Coef. Edificación</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {currentTerreno.coeficienteEdificacion || "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Área Libre Mín.</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {currentTerreno.areaLibreMinPct ? `${currentTerreno.areaLibreMinPct}%` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <div className="text-3xs text-slate-500 font-mono">Moneda</div>
                    <div className="text-sm font-bold font-mono text-emerald-700">
                      {currentTerreno.moneda} (Dólares)
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
                  {(currentTerreno.usosPermitidos || ["Multifamiliar"]).map((uso, i) => (
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
                    <span className="font-semibold text-slate-800">{currentTerreno.direccion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distrito:</span>
                    <span className="font-semibold text-slate-800">{currentTerreno.distrito}</span>
                  </div>
                  {currentTerreno.referencia && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Referencia:</span>
                      <span className="text-slate-700">{currentTerreno.referencia}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Coordenadas WGS84:</span>
                    <span className="font-bold text-slate-900">
                      {currentTerreno.latitud}, {currentTerreno.longitud}
                    </span>
                  </div>
                </div>
                {currentTerreno.latitud && (
                  <div className="mt-2 space-y-1.5">
                    <Link href={`/mapa?terrenoId=${currentTerreno.id}`}>
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
                          `https://www.google.com/maps?q=${currentTerreno.latitud},${currentTerreno.longitud}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                      <span>Abrir en Google Maps Externo</span>
                    </Button>
                  </div>
                )}

                {/* Zona de Baja / Eliminación de Lote */}
                <div className="pt-2 border-t border-slate-200 mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDeleteError(null);
                      setConfirmAcknowledge(false);
                      setIsDeleteDialogOpen(true);
                    }}
                    disabled={isDeleting}
                    className="w-full text-2xs h-7 gap-1.5 font-mono bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Eliminar Terreno</span>
                  </Button>
                </div>
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
                    {currentTerreno.propietario.razonSocialONombre}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-2xs font-mono pt-1">
                  <div>
                    <span className="text-slate-400">Documento:</span>
                    <div className="font-semibold text-slate-800">
                      {currentTerreno.propietario.tipoDoc}: {currentTerreno.propietario.numeroDoc || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Contacto / Rep.:</span>
                    <div className="font-semibold text-slate-800">
                      {currentTerreno.propietario.contactoRepresentante || "Directo"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Teléfono:</span>
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-slate-400" />
                      {currentTerreno.propietario.telefono || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <div className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                      <Mail className="w-2.5 h-2.5 text-slate-400" />
                      {currentTerreno.propietario.email || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {currentTerreno.propietario.notasInternas && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xs text-2xs text-amber-900">
                  <div className="font-bold uppercase tracking-wider font-mono text-3xs text-amber-800 mb-1">
                    Notas Internas del Broker (Confidencial)
                  </div>
                  {currentTerreno.propietario.notasInternas}
                </div>
              )}

              {currentTerreno.propietario.telefono && (
                <Button
                  className="w-full h-8 text-xs font-mono bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() =>
                    window.open(
                      `https://wa.me/${currentTerreno.propietario.telefono?.replace(/\D/g, "")}`,
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
                  <Link href={`/documentos?q=${currentTerreno.codigoInterno}`}>
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
                            await toggleConfidencialAction(doc.id);
                            loadDocs(currentTerreno.id);
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
                                await deleteDocumentoAction(doc.id);
                                loadDocs(currentTerreno.id);
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
                  <Link href={`/matching?terrenoId=${currentTerreno.id}`}>
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
                      href={`/pipeline?terrenoId=${currentTerreno.id}`}
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
                  [{new Date(currentTerreno.createdAt).toLocaleDateString()}] Alta inicial de lote en el sistema por broker administrador.
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
        onSuccess={() => loadDocs(currentTerreno.id)}
        defaultTerrenoId={currentTerreno.id}
      />

      {/* Modal Fiduciario de Confirmación de Eliminación */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(open);
            if (!open) {
              setDeleteError(null);
              setConfirmAcknowledge(false);
            }
          }
        }}
      >
        <DialogContent className="max-w-md bg-white border border-slate-200 p-5 rounded-xs shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="flex items-center gap-2 text-rose-700 font-mono text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Confirmar Baja Definitiva de Terreno</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-sans">
              Esta acción eliminará el lote permanentemente de la cartera fiduciaria y purgará sus registros técnicos asociados.
            </DialogDescription>
          </DialogHeader>

          <div className="my-3 space-y-3">
            {/* Tarjeta de Resumen del Activo */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-1.5 font-mono text-2xs">
              <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                <span className="font-bold text-blue-700 text-xs">{currentTerreno.codigoInterno}</span>
                <span className="font-bold text-slate-900 text-xs">
                  {formatCurrency(Number(currentTerreno.precioTotal), currentTerreno.moneda)}
                </span>
              </div>
              <div className="text-slate-700 font-sans font-medium text-xs truncate">
                {currentTerreno.direccion}, {currentTerreno.distrito}
              </div>
              <div className="grid grid-cols-2 gap-1 text-3xs text-slate-500 pt-0.5">
                <div>Área: <span className="text-slate-700 font-bold">{formatArea(Number(currentTerreno.areaM2))}</span></div>
                <div>Zonificación: <span className="text-purple-700 font-bold">{currentTerreno.zonificacion}</span></div>
                <div>Titular: <span className="text-slate-700 truncate">{currentTerreno.propietario?.razonSocialONombre || "No asignado"}</span></div>
                <div>Documentos: <span className="text-blue-700 font-bold">{documentos.length} archivo(s)</span></div>
              </div>
            </div>

            {/* Verificación de Negociaciones */}
            {negociaciones.length > 0 ? (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xs flex items-start gap-2 text-2xs text-amber-900 font-sans">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Eliminación bloqueada por seguridad fiduciaria:</div>
                  <p className="text-amber-800 leading-relaxed">
                    Este terreno cuenta con <strong>{negociaciones.length} negociación(es)</strong> activa(s) en el Pipeline Comercial. Para no comprometer auditorías de bitácora ni comisiones, reasigne o descarte las operaciones antes de eliminar, o cambie su estado comercial a <em>Inactivo</em>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2 bg-rose-50/60 border border-rose-200 rounded-xs text-3xs text-rose-800 font-sans leading-relaxed">
                  ⚠️ <strong>Aviso de eliminación irreversible:</strong> Al confirmar, se eliminará el registro en la base de datos Supabase PostgreSQL junto con todos los documentos vinculados ({documentos.length} archivo(s)). Esta acción no se puede deshacer.
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <Checkbox
                    id="confirm-delete-checkbox"
                    checked={confirmAcknowledge}
                    onCheckedChange={(checked) => setConfirmAcknowledge(Boolean(checked))}
                    disabled={isDeleting}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="confirm-delete-checkbox"
                    className="text-2xs text-slate-700 leading-tight cursor-pointer select-none font-sans"
                  >
                    Confirmo que deseo dar de baja definitiva este lote y entiendo que la acción es irreversible.
                  </label>
                </div>
              </div>
            )}

            {/* Error si ocurre */}
            {deleteError && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-xs text-2xs text-rose-800 font-mono flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="h-8 text-2xs font-mono border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDeleteTerreno}
              disabled={isDeleting || negociaciones.length > 0 || !confirmAcknowledge}
              className="h-8 text-2xs font-mono bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Eliminando de BD...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3" />
                  <span>Confirmar Eliminación</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

