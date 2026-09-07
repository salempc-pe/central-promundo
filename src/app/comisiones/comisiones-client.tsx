"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  ComisionLiquidacion,
  ComisionFiltros,
  ComisionesKpis,
  EstadoLiquidacion,
  UpdateLiquidacionInput,
} from "@/types/comisiones";
import {
  getComisionesAction,
  getComisionesKpisAction,
  updateEstadoComisionAction,
} from "@/lib/actions/comisiones-actions";
import { getBrokersAction } from "@/lib/actions/pipeline-actions";
import { exportarComisionesAExcel } from "@/lib/export-comisiones";
import { ComisionesKpiBanner } from "@/components/comisiones/comisiones-kpi-banner";
import { ComisionesToolbar } from "@/components/comisiones/comisiones-toolbar";
import { ComisionesTable } from "@/components/comisiones/comisiones-table";
import { ComisionDetailSheet } from "@/components/comisiones/comision-detail-sheet";
import { EstadoLiquidacionDialog } from "@/components/comisiones/estado-liquidacion-dialog";
import { ComisionVoucherModal } from "@/components/comisiones/comision-voucher-modal";
import { DollarSign, ShieldCheck } from "lucide-react";
import { Usuario } from "@/types";

interface ComisionesClientProps {
  initialComisiones?: ComisionLiquidacion[];
  initialKpis?: ComisionesKpis | null;
  initialBrokers?: Usuario[];
}

export function ComisionesClient({
  initialComisiones = [],
  initialKpis = null,
  initialBrokers = [],
}: ComisionesClientProps = {}) {
  const searchParams = useSearchParams();
  const [liquidaciones, setLiquidaciones] = useState<ComisionLiquidacion[]>(initialComisiones);
  const [kpis, setKpis] = useState<ComisionesKpis | null>(initialKpis);
  const [brokers, setBrokers] = useState<Usuario[]>(initialBrokers);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<ComisionFiltros>({});

  useEffect(() => {
    if (!initialBrokers || initialBrokers.length === 0) {
      getBrokersAction().then((b) => {
        if (b && b.length > 0) setBrokers(b);
      });
    }
  }, [initialBrokers]);

  useEffect(() => {
    const q =
      searchParams.get("q") ||
      searchParams.get("busqueda") ||
      searchParams.get("terrenoId") ||
      searchParams.get("codigo");
    const brokerId = searchParams.get("brokerId");
    const estado = searchParams.get("estado");
    if (q || brokerId || estado) {
      setFiltros((prev) => ({
        ...prev,
        busqueda: q || prev.busqueda,
        brokerId: brokerId ? [brokerId] : prev.brokerId,
        estado: estado ? [estado as EstadoLiquidacion] : prev.estado,
      }));
    }
  }, [searchParams]);

  // Modales y Panels
  const [selectedLiquidacion, setSelectedLiquidacion] =
    useState<ComisionLiquidacion | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [liquidacionToChange, setLiquidacionToChange] =
    useState<ComisionLiquidacion | null>(null);
  const [targetEstado, setTargetEstado] = useState<EstadoLiquidacion | undefined>(
    undefined
  );
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const [voucherLiquidacion, setVoucherLiquidacion] =
    useState<ComisionLiquidacion | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Catálogos para la toolbar con datos reales de la BD
  const brokersDisponibles = useMemo(() => {
    return brokers.map((u) => ({ id: u.id, nombre: u.nombre }));
  }, [brokers]);

  const distritosDisponibles = useMemo(() => {
    const dists = new Set(liquidaciones.map((l) => l.terreno?.distrito).filter(Boolean));
    return Array.from(dists).sort() as string[];
  }, [liquidaciones]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [lista, metricas] = await Promise.all([
        getComisionesAction(filtros),
        getComisionesKpisAction(),
      ]);
      setLiquidaciones(lista);
      setKpis(metricas);

      if (selectedLiquidacion) {
        const refrescada = lista.find((item) => item.id === selectedLiquidacion.id);
        if (refrescada) setSelectedLiquidacion(refrescada);
      }
    } catch (err) {
      console.error("Error al cargar datos de comisiones:", err);
    } finally {
      setLoading(false);
    }
  }, [filtros, selectedLiquidacion]);

  useEffect(() => {
    if (Object.keys(filtros).length > 0) {
      loadData();
    }
  }, [filtros, loadData]);

  // Handlers
  const handleVerDetalle = (item: ComisionLiquidacion) => {
    setSelectedLiquidacion(item);
    setIsSheetOpen(true);
  };

  const handleCambiarEstado = (
    item: ComisionLiquidacion,
    estadoSiguiente?: EstadoLiquidacion
  ) => {
    setLiquidacionToChange(item);
    setTargetEstado(estadoSiguiente);
    setIsStatusDialogOpen(true);
  };

  const handleConfirmEstadoChange = async (input: UpdateLiquidacionInput) => {
    try {
      const dbEstado = input.nuevoEstado === "Liquidado" ? "Cobrado" : (input.nuevoEstado as "Pendiente" | "Facturado" | "Cobrado");
      await updateEstadoComisionAction(input.id, dbEstado);
      await loadData();
    } catch (err) {
      console.error("Error en transición de estado:", err);
    }
  };

  const handleGenerarVoucher = (item: ComisionLiquidacion) => {
    setVoucherLiquidacion(item);
    setIsVoucherModalOpen(true);
  };

  const handleExportarExcel = () => {
    exportarComisionesAExcel(liquidaciones, filtros);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70 overflow-hidden select-none p-3 space-y-2.5">
      {/* Encabezado del Módulo */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded px-3.5 py-2 shadow-xs shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white shadow-xs">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Comisiones, Liquidaciones y Reportes Financieros
              </h1>
              <span className="text-3xs font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Módulo F (PostgreSQL)
              </span>
            </div>
            <p className="text-3xs text-slate-500 font-mono">
              Control de aranceles de corretaje (3.00%), facturación con IGV (18%), régimen SPOT SUNAT (12%) y liquidación neta a brokers.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-3xs font-mono text-slate-500">
          <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>SUNAT SPOT 12% Validado</span>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <span>TC Ref.:</span>
            <strong className="text-slate-700">3.750 PEN/USD</strong>
          </div>
        </div>
      </div>

      {/* Banner de KPIs Financieros */}
      {kpis && <ComisionesKpiBanner kpis={kpis} />}

      {/* Barra de Filtros y Búsqueda */}
      <ComisionesToolbar
        filtros={filtros}
        onFiltrosChange={setFiltros}
        onExportarExcel={handleExportarExcel}
        totalRegistros={liquidaciones.length}
        registrosFiltrados={liquidaciones.length}
        brokersDisponibles={brokersDisponibles}
        distritosDisponibles={distritosDisponibles}
      />

      {/* Data Grid de Alta Densidad */}
      <div className="flex-1 min-h-[380px] overflow-hidden">
        <ComisionesTable
          data={liquidaciones}
          onVerDetalle={handleVerDetalle}
          onCambiarEstado={handleCambiarEstado}
          onGenerarVoucher={handleGenerarVoucher}
        />
      </div>

      {/* Drawer Lateral de Detalle y Desglose Tributario */}
      <ComisionDetailSheet
        liquidacion={selectedLiquidacion}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onCambiarEstado={handleCambiarEstado}
        onGenerarVoucher={handleGenerarVoucher}
      />

      {/* Diálogo de Transición de Estado y Bancos */}
      <EstadoLiquidacionDialog
        liquidacion={liquidacionToChange}
        targetEstado={targetEstado}
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onConfirm={handleConfirmEstadoChange}
      />

      {/* Modal de Voucher Imprimible */}
      <ComisionVoucherModal
        liquidacion={voucherLiquidacion}
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />
    </div>
  );
}
