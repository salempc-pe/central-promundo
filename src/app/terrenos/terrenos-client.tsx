"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import { TerrenoCompleto, TerrenoFiltros, Propietario } from "@/types";
import { getTerrenosColumns } from "@/components/terrenos/terrenos-columns";
import { TerrenosFilters } from "@/components/terrenos/terrenos-filters";
import { TerrenosToolbar } from "@/components/terrenos/terrenos-toolbar";
import { ActiveFilterChips } from "@/components/terrenos/active-filter-chips";
import { TerrenosTable } from "@/components/terrenos/terrenos-table";
import { TerrenoDetailSheet } from "@/components/terrenos/terreno-detail-sheet";
import { TerrenoCreateDialog } from "@/components/terrenos/terreno-create-dialog";
import { exportarTerrenosAExcel } from "@/lib/export-excel";
import { createTerrenoEnMemoria, createPropietarioEnMemoria } from "@/lib/services/terrenos";

interface TerrenosClientProps {
  initialTerrenos: TerrenoCompleto[];
  initialPropietarios?: Propietario[];
}

export function TerrenosClient({
  initialTerrenos,
  initialPropietarios = [],
}: TerrenosClientProps) {
  const searchParams = useSearchParams();
  const [terrenosList, setTerrenosList] = useState<TerrenoCompleto[]>(initialTerrenos);
  const [propietariosList, setPropietariosList] = useState<Propietario[]>(initialPropietarios);
  const [filtros, setFiltros] = useState<TerrenoFiltros>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [selectedTerreno, setSelectedTerreno] = useState<TerrenoCompleto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState("ficha");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Sincronizar desde searchParams al navegar desde el Dashboard, Header u otros módulos
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
      if (found && (tId || tab)) {
        setSelectedTerreno(found);
        setIsDetailOpen(true);
        if (tab) setDetailTab(tab);
      }
    }
  }, [searchParams, terrenosList]);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "codigoInterno", desc: false },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Filtrado acumulativo reactivo en memoria
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
          t.propietario?.razonSocialONombre?.toLowerCase().includes(q)
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

  // Selección de terreno para inspección en Sheet
  const handleSelectTerreno = (terreno: TerrenoCompleto, defaultTab: string = "ficha") => {
    setSelectedTerreno(terreno);
    setDetailTab(defaultTab);
    setIsDetailOpen(true);
  };

  const columns = useMemo(
    () => getTerrenosColumns({ onSelectTerreno: handleSelectTerreno }),
    []
  );

  const table = useReactTable({
    data: filteredTerrenos,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    enableMultiSort: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

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

  // Remover filtro unitario desde los chips
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

  // Contar filtros activos
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
    if (filtros.soloConCertificadoParametros) count++;
    if (filtros.estado?.length) count += filtros.estado.length;
    return count;
  }, [filtros]);

  // Exportación a Excel
  const handleExportExcel = () => {
    exportarTerrenosAExcel(filteredTerrenos, filtros);
  };

  // Manejador para registrar nuevo lote
  const handleCreateTerreno = async (nuevoTerreno: TerrenoCompleto) => {
    await createTerrenoEnMemoria(nuevoTerreno);
    setTerrenosList((prev) => [nuevoTerreno, ...prev]);
    setSelectedTerreno(nuevoTerreno);
    setDetailTab("ficha");
    setIsDetailOpen(true);
  };

  // Manejador para registrar nuevo titular desde el modal
  const handleCreatePropietario = async (
    data: Omit<Propietario, "id" | "createdAt" | "updatedAt">
  ) => {
    const nuevo = await createPropietarioEnMemoria(data);
    setPropietariosList((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.75rem)] -m-3 overflow-hidden bg-slate-100">
      {/* Barra de herramientas superior */}
      <TerrenosToolbar
        busqueda={filtros.busqueda || ""}
        onBusquedaChange={(val) => handleFilterChange({ busqueda: val })}
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen((prev) => !prev)}
        activeFiltersCount={activeFiltersCount}
        table={table}
        onExportExcel={handleExportExcel}
        totalFiltrados={filteredTerrenos.length}
        totalGeneral={terrenosList.length}
        onNuevoLote={() => setIsCreateOpen(true)}
      />

      {/* Barra de chips de filtros activos */}
      <ActiveFilterChips
        filtros={filtros}
        onRemoveFiltro={handleRemoveFiltro}
        onClearAll={handleResetFilters}
        totalFiltrados={filteredTerrenos.length}
        totalGeneral={terrenosList.length}
      />

      {/* Contenedor central: Sidebar de Filtros + Data Grid */}
      <div className="flex flex-1 overflow-hidden">
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

        {/* Data Grid Central TanStack Table */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TerrenosTable
            table={table}
            onSelectTerreno={handleSelectTerreno}
            selectedTerrenoId={selectedTerreno?.id || null}
          />
        </div>
      </div>

      {/* Sheet Lateral de Inspección Instantánea */}
      <TerrenoDetailSheet
        terreno={selectedTerreno}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        defaultTab={detailTab}
      />

      {/* Diálogo de Alta de Nuevo Lote */}
      <TerrenoCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTerreno}
        propietariosDisponibles={propietariosList}
        onCrearPropietario={handleCreatePropietario}
        totalTerrenosCount={terrenosList.length}
      />
    </div>
  );
}
