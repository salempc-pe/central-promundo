"use client";

import React from "react";
import { DocumentoConTerreno } from "@/types/documentos";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PdfViewerFrame } from "./pdf-viewer-frame";
import { VigenciaBadge } from "./vigencia-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  MapPin,
  Calendar,
  Lock,
  Globe,
  ExternalLink,
  Layers,
  FileCheck,
  Shield,
  FileText,
  X,
} from "lucide-react";
import { formatCurrency, formatArea, formatPricePerM2, formatDateSpanish, formatBytes } from "@/lib/utils";

interface PdfViewerModalProps {
  documento: DocumentoConTerreno | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTerrenoSheet?: (terrenoId: string) => void;
}

export function PdfViewerModal({
  documento,
  isOpen,
  onClose,
  onOpenTerrenoSheet,
}: PdfViewerModalProps) {
  if (!documento) return null;

  const t = documento.terreno;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[94vw] h-[90vh] p-0 flex flex-col bg-white border-slate-200 text-slate-800 overflow-hidden shadow-2xl">
        {/* Cabecera del Modal */}
        <DialogHeader className="h-11 px-4 bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <DialogTitle className="text-xs font-mono font-bold text-slate-900 truncate">
                {documento.nombreArchivo}
              </DialogTitle>
            </div>
            <VigenciaBadge
              estadoVigencia={documento.estadoVigencia}
              diasParaVencer={documento.diasParaVencer}
              fechaVencimiento={documento.fechaVencimiento}
            />
            {documento.esConfidencial ? (
              <Badge variant="outline" className="text-3xs bg-amber-50 text-amber-700 border-amber-300 gap-1 font-mono">
                <Lock className="w-2.5 h-2.5" /> Confidencial
              </Badge>
            ) : (
              <Badge variant="outline" className="text-3xs bg-blue-50 text-blue-700 border-blue-200 gap-1 font-mono">
                <Globe className="w-2.5 h-2.5" /> Compartible
              </Badge>
            )}
          </div>
          <DialogDescription className="sr-only">
            Visor de documento y parámetros técnicos de terreno {t.codigoInterno}
          </DialogDescription>
        </DialogHeader>

        {/* Cuerpo Principal de Doble Columna (70% Visor PDF / 30% Panel Técnico) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Columna Izquierda: Visor PDF */}
          <div className="flex-1 h-full min-h-[400px] bg-slate-100 p-2 overflow-hidden">
            <PdfViewerFrame
              url={documento.archivoUrl}
              nombreArchivo={documento.nombreArchivo}
              className="h-full w-full"
            />
          </div>

          {/* Columna Derecha: Panel de Parámetros & Metadatos */}
          <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 flex flex-col justify-between overflow-y-auto shrink-0 text-xs">
            <div className="space-y-4">
              {/* Bloque 1: Datos del Terreno Vinculado */}
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-3xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    LOTE ASOCIADO
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600">
                    {t.codigoInterno}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-xs font-semibold text-slate-800">
                    {t.distrito}
                  </div>
                  <div className="text-2xs text-slate-500 flex items-start gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span>{t.direccion}</span>
                  </div>
                </div>
              </div>

              {/* Matriz de Parámetros Urbanísticos Clave */}
              <div className="p-2.5 bg-slate-50 rounded-xs border border-slate-200 space-y-2">
                <span className="text-3xs font-mono font-bold text-slate-600 uppercase tracking-wider block">
                  PARÁMETROS URBANÍSTICOS
                </span>
                <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                  <div>
                    <span className="text-slate-500">Zonificación:</span>
                    <div className="font-bold text-purple-700 text-xs">
                      {t.zonificacion}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Altura Máx.:</span>
                    <div className="font-bold text-blue-700 text-xs">
                      {t.alturaMaxPisos ? `${t.alturaMaxPisos} pisos` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Área Terreno:</span>
                    <div className="font-bold text-slate-800">
                      {formatArea(Number(t.areaM2))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Precio / m²:</span>
                    <div className="font-bold text-emerald-700">
                      {formatPricePerM2(Number(t.precioM2), t.moneda)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloque 2: Metadatos del Documento Legal */}
              <div className="space-y-2">
                <span className="text-3xs font-mono font-bold text-slate-600 uppercase tracking-wider block pb-1 border-b border-slate-200">
                  METADATOS DEL DOCUMENTO
                </span>

                <div className="space-y-1.5 text-2xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipo:</span>
                    <span className="text-slate-800 font-semibold">{documento.tipoDocumento}</span>
                  </div>

                  {documento.numeroDocumento && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">N° Registro:</span>
                      <span className="text-slate-800 truncate max-w-[170px]">{documento.numeroDocumento}</span>
                    </div>
                  )}

                  {documento.entidadEmisora && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Emisor:</span>
                      <span className="text-slate-800 truncate max-w-[170px]">{documento.entidadEmisora}</span>
                    </div>
                  )}

                  {documento.fechaEmision && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Emisión:</span>
                      <span className="text-slate-700">{formatDateSpanish(documento.fechaEmision)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-500">Caducidad:</span>
                    <span className="text-slate-900 font-bold">
                      {documento.fechaVencimiento
                        ? formatDateSpanish(documento.fechaVencimiento)
                        : "Indefinida"}
                    </span>
                  </div>

                  {documento.tamanoBytes && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tamaño:</span>
                      <span className="text-slate-600">{formatBytes(documento.tamanoBytes)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bloque 3: Notas Técnicas */}
              {documento.notas && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xs text-3xs text-slate-700 space-y-1">
                  <span className="font-mono font-bold text-slate-600 uppercase">
                    NOTAS TÉCNICAS
                  </span>
                  <p className="leading-relaxed">{documento.notas}</p>
                </div>
              )}
            </div>

            {/* Footer con Botón para Abrir Ficha Completa del Terreno */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              {onOpenTerrenoSheet && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onOpenTerrenoSheet(t.id);
                  }}
                  className="w-full text-xs font-mono border-slate-300 hover:bg-slate-100 text-slate-800 gap-1.5"
                >
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ver Ficha Completa del Terreno</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
