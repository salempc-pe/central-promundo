"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentoConTerreno, DocumentoFiltros, DocumentosKpis, EstadoVigencia } from "@/types/documentos";
import { TerrenoCompleto } from "@/types";
import {
  getDocumentos,
  getDocumentoStats,
  toggleConfidencial,
  deleteDocumento,
} from "@/lib/services/documentos";
import { getTerrenos } from "@/lib/services/terrenos";
import { DocumentosKpiBanner } from "@/components/documentos/documentos-kpi-banner";
import { DocumentosToolbar } from "@/components/documentos/documentos-toolbar";
import { DocumentosTable } from "@/components/documentos/documentos-table";
import { PdfViewerModal } from "@/components/documentos/pdf-viewer-modal";
import { DocumentoUploadDialog } from "@/components/documentos/documento-upload-dialog";
import { TerrenoDetailSheet } from "@/components/terrenos/terreno-detail-sheet";

interface DocumentosClientProps {
  initialDocs: DocumentoConTerreno[];
  initialKpis: DocumentosKpis;
}

export function DocumentosClient({
  initialDocs,
  initialKpis,
}: DocumentosClientProps) {
  const searchParams = useSearchParams();
  const [docs, setDocs] = useState<DocumentoConTerreno[]>(initialDocs);
  const [kpis, setKpis] = useState<DocumentosKpis>(initialKpis);
  const [filtros, setFiltros] = useState<DocumentoFiltros>({});
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Modales y Sheets
  const [viewerDoc, setViewerDoc] = useState<DocumentoConTerreno | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [selectedTerreno, setSelectedTerreno] = useState<TerrenoCompleto | null>(null);
  const [isTerrenoSheetOpen, setIsTerrenoSheetOpen] = useState<boolean>(false);

  // Sincronizar filtros desde searchParams al montar o navegar desde otros módulos
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("busqueda") || searchParams.get("codigo");
    const tId = searchParams.get("terrenoId") || searchParams.get("id");
    const rawEstado = searchParams.get("estado");
    const normalizedEstado = rawEstado
      ? (rawEstado.toLowerCase().replace(/[- ]/g, "_") as EstadoVigencia)
      : null;
    if (q || tId || normalizedEstado) {
      setFiltros((prev) => ({
        ...prev,
        busqueda: q || tId || prev.busqueda,
        terrenoId: tId || prev.terrenoId,
        estadoVigencia: normalizedEstado ? [normalizedEstado] : prev.estadoVigencia,
      }));
    }
  }, [searchParams]);

  const loadData = useCallback(async (currentFiltros: DocumentoFiltros) => {
    setLoading(true);
    try {
      const [newDocs, newStats] = await Promise.all([
        getDocumentos(currentFiltros),
        getDocumentoStats(),
      ]);
      setDocs(newDocs);
      setKpis(newStats);
    } catch (err) {
      console.error("Error loading documentos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(filtros);
  }, [filtros, loadData]);

  const handleFiltrosChange = (newFiltros: DocumentoFiltros) => {
    setFiltros(newFiltros);
  };

  const handleSelectFiltroEstado = (estado: EstadoVigencia | null) => {
    if (!estado) {
      setFiltros((prev) => ({ ...prev, estadoVigencia: undefined }));
    } else {
      const actuales = filtros.estadoVigencia || [];
      const nuevo = actuales.includes(estado) ? [] : [estado];
      setFiltros((prev) => ({
        ...prev,
        estadoVigencia: nuevo.length > 0 ? nuevo : undefined,
      }));
    }
  };

  const handleToggleConfidencial = async (id: string) => {
    await toggleConfidencial(id);
    loadData(filtros);
  };

  const handleDeleteDoc = async (id: string) => {
    await deleteDocumento(id);
    loadData(filtros);
  };

  const handleOpenTerreno = async (terrenoId: string) => {
    const todosTerrenos = await getTerrenos();
    const normId = terrenoId.toLowerCase().replace("terr-", "tr-");
    const encontrado = todosTerrenos.find(
      (t) =>
        t.id.toLowerCase() === terrenoId.toLowerCase() ||
        t.id.toLowerCase() === normId ||
        t.codigoInterno.toLowerCase() === terrenoId.toLowerCase()
    );
    if (encontrado) {
      setSelectedTerreno(encontrado);
      setIsTerrenoSheetOpen(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/70 p-3 space-y-3 overflow-hidden">
      {/* 1. Header de KPIs de Control Documental */}
      <DocumentosKpiBanner
        kpis={kpis}
        filtroEstadoActivo={filtros.estadoVigencia}
        onSelectFiltroEstado={handleSelectFiltroEstado}
      />

      {/* 2. Barra de Búsqueda y Filtros Rápidos */}
      <DocumentosToolbar
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onOpenUpload={() => setIsUploadOpen(true)}
        selectedCount={selectedCount}
      />

      {/* 3. Data Grid de Documentos (TanStack Table v8) */}
      <div className="flex-1 min-h-0">
        <DocumentosTable
          data={docs}
          onViewDoc={(doc) => setViewerDoc(doc)}
          onToggleConfidencial={handleToggleConfidencial}
          onDeleteDoc={handleDeleteDoc}
          onOpenTerreno={handleOpenTerreno}
          onSelectionChange={setSelectedCount}
        />
      </div>

      {/* 4. Visor de PDF Integrado / Modal Expandido */}
      <PdfViewerModal
        documento={viewerDoc}
        isOpen={Boolean(viewerDoc)}
        onClose={() => setViewerDoc(null)}
        onOpenTerrenoSheet={handleOpenTerreno}
      />

      {/* 5. Modal de Carga Interactiva (Drag & Drop con Calculadores de Vigencia) */}
      <DocumentoUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => loadData(filtros)}
      />

      {/* 6. Panel Lateral de 5 Pestañas del Terreno */}
      <TerrenoDetailSheet
        terreno={selectedTerreno}
        isOpen={isTerrenoSheetOpen}
        onClose={() => setIsTerrenoSheetOpen(false)}
        defaultTab="documentos"
      />
    </div>
  );
}
