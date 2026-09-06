"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { TerrenoCompleto, TerrenoFiltros } from "@/types";
import { TerrenosFilters } from "@/components/terrenos/terrenos-filters";
import { ActiveFilterChips } from "@/components/terrenos/active-filter-chips";
import { TerrenoDetailSheet } from "@/components/terrenos/terreno-detail-sheet";
import { TerrenosMapDynamic } from "@/components/mapa/mapa-dynamic";
import { TerrenosSplitList } from "@/components/mapa/terrenos-split-list";
import { MapaToolbar } from "@/components/mapa/mapa-toolbar";
import { cn } from "@/lib/utils";

interface MapaClientProps {
  initialTerrenos: TerrenoCompleto[];
}

export function MapaClient({ initialTerrenos }: MapaClientProps) {
  const searchParams = useSearchParams();
  const [terrenosList] = useState<TerrenoCompleto[]>(initialTerrenos);
  const [filtros, setFiltros] = useState<TerrenoFiltros>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isSplitView, setIsSplitView] = useState(true);
  const [selectedTerreno, setSelectedTerreno] = useState<TerrenoCompleto | null>(null);
  const [hoveredTerrenoId, setHoveredTerrenoId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState("ficha");

  // Sincronizar desde searchParams al navegar desde otros módulos
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("busqueda");
    const tId = searchParams.get("terrenoId") || searchParams.get("id") || searchParams.get("codigo");
    const tab = searchParams.get("tab");

    if (q) {
      setFiltros((prev) => ({ ...prev, busqueda: q }));
    } else if (tId) {
      setFiltros((prev) => ({ ...prev, busqueda: tId }));
    }

    const targetId = tId || q;
    if (targetId) {
      const normTarget = targetId.toLowerCase().replace("terr-", "tr-");
      const found = terrenosList.find(
        (t) =>
          t.id.toLowerCase() === targetId.toLowerCase() ||
          t.id.toLowerCase() === normTarget ||
          t.codigoInterno.toLowerCase() === targetId.toLowerCase()
      );
      if (found) {
        setSelectedTerreno(found);
        if (tab) {
          setDetailTab(tab);
          setIsDetailOpen(true);
        }
      }
    }
  }, [searchParams, terrenosList]);

  // Motor de filtrado reactivo idéntico al Data Grid
  const filteredTerrenos = useMemo(() => {
    let list = [...terrenosList];

    // 1. Búsqueda libre
    if (filtros.busqueda && filtros.busqueda.trim() !== "") {
      const q = filtros.busqueda.toLowerCase().trim();
      const normQ = q.replace("terr-", "tr-");
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(normQ) ||
          t.codigoInterno.toLowerCase().includes(q) ||
          t.distrito.toLowerCase().includes(q) ||
          t.direccion.toLowerCase().includes(q) ||
          t.zonificacion.toLowerCase().includes(q) ||
          t.propietario?.razonSocialONombre?.toLowerCase().includes(q) ||
          (t.referencia && t.referencia.toLowerCase().includes(q))
      );
    }

    // 2. Distrito (multi-select)
    if (filtros.distrito && filtros.distrito.length > 0) {
      const distritosLower = filtros.distrito.map((d) => d.toLowerCase());
      list = list.filter((t) => distritosLower.includes(t.distrito.toLowerCase()));
    }

    // 3. Zonificación (multi-select)
    if (filtros.zonificacion && filtros.zonificacion.length > 0) {
      list = list.filter((t) => filtros.zonificacion!.includes(t.zonificacion));
    }

    // 4. Área m2
    if (filtros.areaMin !== undefined && filtros.areaMin > 0) {
      list = list.filter((t) => Number(t.areaM2) >= filtros.areaMin!);
    }
    if (filtros.areaMax !== undefined && filtros.areaMax > 0) {
      list = list.filter((t) => Number(t.areaM2) <= filtros.areaMax!);
    }

    // 5. Presupuesto
    if (filtros.precioM2Max !== undefined && filtros.precioM2Max > 0) {
      list = list.filter((t) => Number(t.precioM2) <= filtros.precioM2Max!);
    }
    if (filtros.precioTotalMax !== undefined && filtros.precioTotalMax > 0) {
      list = list.filter((t) => Number(t.precioTotal) <= filtros.precioTotalMax!);
    }

    // 6. Altura
    if (filtros.alturaMinPisos !== undefined && filtros.alturaMinPisos > 0) {
      list = list.filter((t) => (t.alturaMaxPisos || 0) >= filtros.alturaMinPisos!);
    }

    // 7. Frente
    if (filtros.frenteLinealMin !== undefined && filtros.frenteLinealMin > 0) {
      list = list.filter((t) => Number(t.frenteLinealM || 0) >= filtros.frenteLinealMin!);
    }

    // 8. Estado
    if (filtros.estado && filtros.estado.length > 0) {
      list = list.filter((t) => filtros.estado!.includes(t.estadoTerreno as any));
    }

    // 9. Solo con CPU adjunto
    if (filtros.soloConCertificadoParametros) {
      list = list.filter((t) =>
        t.documentos.some((d) => d.tipoDocumento === "Certificado_Parametros")
      );
    }

    return list;
  }, [terrenosList, filtros]);

  // Selección cartográfica de lote (centrado y popup HUD sin abrir Sheet invasivo)
  const handleSelectTerreno = useCallback((terreno: TerrenoCompleto) => {
    setSelectedTerreno(terreno);
  }, []);

  // Apertura explícita del Sheet de inspección profunda (5 pestañas)
  const handleOpenDetail = useCallback((terreno: TerrenoCompleto, defaultTab: string = "ficha") => {
    setSelectedTerreno(terreno);
    setDetailTab(defaultTab);
    setIsDetailOpen(true);
  }, []);

  // Manejo de hover memorizado
  const handleHoverTerreno = useCallback((id: string | null) => {
    setHoveredTerrenoId(id);
  }, []);

  // Manejo de actualización de filtros parciales
  const handleFilterChange = (nuevosFiltros: Partial<TerrenoFiltros>) => {
    setFiltros((prev) => ({
      ...prev,
      ...nuevosFiltros,
    }));
  };

  // Restablecer filtros
  const handleResetFilters = () => {
    setFiltros({});
  };

  // Remover filtro individual desde los chips
  const handleRemoveFiltro = (key: keyof TerrenoFiltros, value?: string) => {
    setFiltros((prev) => {
      const copy = { ...prev };
      if (key === "distrito" && value && Array.isArray(copy.distrito)) {
        const next = copy.distrito.filter((d) => d !== value);
        copy.distrito = next.length > 0 ? next : undefined;
      } else if (key === "zonificacion" && value && Array.isArray(copy.zonificacion)) {
        const next = copy.zonificacion.filter((z) => z !== value);
        copy.zonificacion = next.length > 0 ? next : undefined;
      } else if (key === "estado" && value && Array.isArray(copy.estado)) {
        const next = copy.estado.filter((st) => st !== value);
        copy.estado = next.length > 0 ? next : undefined;
      } else if (key === "areaMin") {
        delete copy.areaMin;
        delete copy.areaMax;
      } else {
        delete copy[key];
      }
      return copy;
    });
  };

  // Conteo de filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filtros.busqueda) count++;
    if (filtros.distrito?.length) count += filtros.distrito.length;
    if (filtros.zonificacion?.length) count += filtros.zonificacion.length;
    if (filtros.areaMin || filtros.areaMax) count++;
    if (filtros.precioM2Max) count++;
    if (filtros.precioTotalMax) count++;
    if (filtros.alturaMinPisos) count++;
    if (filtros.frenteLinealMin) count++;
    if (filtros.estado?.length) count += filtros.estado.length;
    if (filtros.soloConCertificadoParametros) count++;
    return count;
  }, [filtros]);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-slate-50/70">
      {/* Barra de Herramientas Superior del Mapa */}
      <MapaToolbar
        totalFiltrados={filteredTerrenos.length}
        totalGeneral={terrenosList.length}
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen((prev) => !prev)}
        isSplitView={isSplitView}
        onToggleSplitView={() => setIsSplitView((prev) => !prev)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Barra de Chips de Filtros Activos */}
      <ActiveFilterChips
        filtros={filtros}
        onRemoveFiltro={handleRemoveFiltro}
        onClearAll={handleResetFilters}
        totalFiltrados={filteredTerrenos.length}
        totalGeneral={terrenosList.length}
      />

      {/* Contenedor Principal: Filtros + Split View (Mapa 60% / Panel 40%) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Barra Lateral de Filtros Acumulativos */}
        <TerrenosFilters
          filtros={filtros}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          totalResultados={filteredTerrenos.length}
          totalInventario={terrenosList.length}
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
        />

        {/* Sección Cartográfica y Panel de Lotes */}
        <div className="flex-1 flex overflow-hidden min-w-0">
          {/* Contenedor del Mapa WebGL (60% o 100% según isSplitView) */}
          <div
            className={cn(
              "h-full transition-all duration-300 relative",
              isSplitView ? "flex-1 min-w-[50%]" : "w-full"
            )}
          >
            <TerrenosMapDynamic
              terrenos={filteredTerrenos}
              selectedTerrenoId={selectedTerreno?.id || null}
              hoveredTerrenoId={hoveredTerrenoId}
              onSelectTerreno={handleSelectTerreno}
              onOpenInspect={handleOpenDetail}
              onHoverTerreno={handleHoverTerreno}
            />
          </div>

          {/* Panel Lateral de Lotes (40% de ancho en Split View) */}
          {isSplitView && (
            <div className="w-80 lg:w-96 xl:w-[420px] h-full shrink-0 flex flex-col min-w-0 transition-all">
              <TerrenosSplitList
                terrenos={filteredTerrenos}
                selectedTerrenoId={selectedTerreno?.id || null}
                hoveredTerrenoId={hoveredTerrenoId}
                onSelectTerreno={handleSelectTerreno}
                onOpenInspect={handleOpenDetail}
                onHoverTerreno={handleHoverTerreno}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sheet Lateral de Inspección Instantánea (5 Pestañas) */}
      <TerrenoDetailSheet
        terreno={selectedTerreno}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        defaultTab={detailTab}
      />
    </div>
  );
}
