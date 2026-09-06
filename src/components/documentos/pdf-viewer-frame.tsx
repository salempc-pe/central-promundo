"use client";

import React, { useState } from "react";
import {
  Download,
  ExternalLink,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfViewerFrameProps {
  url: string;
  nombreArchivo: string;
  className?: string;
  showToolbar?: boolean;
}

export function PdfViewerFrame({
  url,
  nombreArchivo,
  className = "",
  showToolbar = true,
}: PdfViewerFrameProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 20, 60));
  const handleResetZoom = () => setZoom(100);
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleOpenNewTab = () => {
    window.open(url, "_blank");
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`flex flex-col h-full bg-white text-slate-800 rounded-xs border border-slate-200 overflow-hidden ${className}`}>
      {/* Barra de herramientas superior */}
      {showToolbar && (
        <div className="h-9 bg-slate-100 border-b border-slate-200 flex items-center justify-between px-3 shrink-0">
          {/* Nombre de archivo e info */}
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-2xs font-mono text-slate-800 truncate font-semibold">
              {nombreArchivo}
            </span>
          </div>

          {/* Controles de visualización */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="h-6 w-6 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              title="Reducir zoom"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <button
              onClick={handleResetZoom}
              className="text-3xs font-mono text-slate-600 hover:text-slate-900 px-1 py-0.5 rounded hover:bg-slate-200"
              title="Restablecer zoom (100%)"
            >
              {zoom}%
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="h-6 w-6 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>

            <div className="w-px h-3.5 bg-slate-300 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              className="h-6 w-6 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              title="Rotar 90°"
            >
              <RotateCw className="w-3 h-3" />
            </Button>

            <div className="w-px h-3.5 bg-slate-300 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-6 w-6 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              title="Descargar archivo"
            >
              <Download className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenNewTab}
              className="h-6 w-6 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Contenedor del visor embebido con soporte de zoom y rotación */}
      <div className="flex-1 relative bg-slate-100 flex items-center justify-center overflow-auto p-2">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 space-y-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-3xs font-mono text-slate-600">
              Cargando documento...
            </span>
          </div>
        )}

        <div
          className="w-full h-full flex items-center justify-center transition-all duration-200"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
        >
          <object
            data={`${url}#toolbar=0&navpanes=0`}
            type="application/pdf"
            className="w-full h-full rounded-xs shadow-lg bg-white"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          >
            {/* Fallback iframe */}
            <iframe
              src={`${url}#toolbar=0`}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
            />
          </object>
        </div>

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/95 z-20 p-4 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-400" />
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800">
                Visualización no disponible directamente
              </div>
              <div className="text-3xs text-slate-500 max-w-sm">
                Tu navegador requiere abrir este tipo de documento en una ventana independiente o descargarlo.
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleOpenNewTab}
                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Abrir en Pestaña</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-7 text-xs border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5"
              >
                <Download className="w-3 h-3" />
                <span>Descargar PDF</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
