"use client";

import React, { useState, useEffect } from "react";
import {
  ComisionLiquidacion,
  EstadoLiquidacion,
  UpdateLiquidacionInput,
  TipoComprobante,
  ModalidadPagoBroker,
} from "@/types/comisiones";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileSpreadsheet,
  Landmark,
  FileCheck2,
  Clock,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface EstadoLiquidacionDialogProps {
  liquidacion: ComisionLiquidacion | null;
  targetEstado?: EstadoLiquidacion;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (input: UpdateLiquidacionInput) => Promise<void>;
}

export function EstadoLiquidacionDialog({
  liquidacion,
  targetEstado,
  isOpen,
  onClose,
  onConfirm,
}: EstadoLiquidacionDialogProps) {
  const [estado, setEstado] = useState<EstadoLiquidacion>("Facturado");
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [numeroFactura, setNumeroFactura] = useState("");
  const [fechaFactura, setFechaFactura] = useState("");
  const [fechaVencimientoFactura, setFechaVencimientoFactura] = useState("");
  const [numeroConstanciaDetraccion, setNumeroConstanciaDetraccion] = useState("");
  const [fechaDetraccion, setFechaDetraccion] = useState("");
  const [bancoEmpresa, setBancoEmpresa] = useState("BCP USD Cta Cte 193-9821034-1-45");
  const [nroOperacionCobro, setNroOperacionCobro] = useState("");
  const [fechaCobro, setFechaCobro] = useState("");

  const [tipoComprobanteBroker, setTipoComprobanteBroker] =
    useState<TipoComprobante>("Recibo_Honorarios");
  const [numeroComprobanteBroker, setNumeroComprobanteBroker] = useState("");
  const [cuentaConSuspension1609, setCuentaConSuspension1609] = useState(false);
  const [bancoBroker, setBancoBroker] = useState("");
  const [nroOperacionPagoBroker, setNroOperacionPagoBroker] = useState("");
  const [fechaPagoBroker, setFechaPagoBroker] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    if (liquidacion) {
      const siguiente =
        targetEstado ||
        (liquidacion.estadoLiquidacion === "Pendiente"
          ? "Facturado"
          : liquidacion.estadoLiquidacion === "Facturado"
          ? "Cobrado"
          : "Liquidado");

      setEstado(siguiente);
      setNumeroFactura(liquidacion.numeroFactura || "");
      setFechaFactura(
        liquidacion.fechaFactura
          ? new Date(liquidacion.fechaFactura).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setFechaVencimientoFactura(
        liquidacion.fechaVencimientoFactura
          ? new Date(liquidacion.fechaVencimientoFactura).toISOString().split("T")[0]
          : ""
      );
      setNumeroConstanciaDetraccion(
        liquidacion.numeroConstanciaDetraccion || ""
      );
      setFechaDetraccion(
        liquidacion.fechaDetraccion
          ? new Date(liquidacion.fechaDetraccion).toISOString().split("T")[0]
          : ""
      );
      setBancoEmpresa(
        liquidacion.bancoEmpresa || "BCP USD Cta Cte 193-9821034-1-45"
      );
      setNroOperacionCobro(liquidacion.nroOperacionCobro || "");
      setFechaCobro(
        liquidacion.fechaCobro
          ? new Date(liquidacion.fechaCobro).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setTipoComprobanteBroker(
        liquidacion.tipoComprobanteBroker || "Recibo_Honorarios"
      );
      setNumeroComprobanteBroker(liquidacion.numeroComprobanteBroker || "");
      setCuentaConSuspension1609(Boolean(liquidacion.cuentaConSuspension1609));
      setBancoBroker(
        liquidacion.bancoBroker ||
          `BCP Ahorros USD (${liquidacion.broker.nombre})`
      );
      setNroOperacionPagoBroker(liquidacion.nroOperacionPagoBroker || "");
      setFechaPagoBroker(
        liquidacion.fechaPagoBroker
          ? new Date(liquidacion.fechaPagoBroker).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setObservaciones(liquidacion.observaciones || "");
    }
  }, [liquidacion, targetEstado, isOpen]);

  if (!liquidacion) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: UpdateLiquidacionInput = {
        id: liquidacion.id,
        nuevoEstado: estado,
        observaciones,
      };

      if (estado === "Facturado" || estado === "Cobrado" || estado === "Liquidado") {
        payload.numeroFactura = numeroFactura;
        payload.fechaFactura = fechaFactura;
        payload.fechaVencimientoFactura = fechaVencimientoFactura;
      }

      if (estado === "Cobrado" || estado === "Liquidado") {
        payload.numeroConstanciaDetraccion = numeroConstanciaDetraccion;
        payload.fechaDetraccion = fechaDetraccion;
        payload.bancoEmpresa = bancoEmpresa;
        payload.nroOperacionCobro = nroOperacionCobro;
        payload.fechaCobro = fechaCobro;
      }

      if (estado === "Liquidado") {
        payload.tipoComprobanteBroker = tipoComprobanteBroker;
        payload.numeroComprobanteBroker = numeroComprobanteBroker;
        payload.cuentaConSuspension1609 = cuentaConSuspension1609;
        payload.retencionIRBrokerPct = cuentaConSuspension1609 ? 0 : 8;
        payload.bancoBroker = bancoBroker;
        payload.nroOperacionPagoBroker = nroOperacionPagoBroker;
        payload.fechaPagoBroker = fechaPagoBroker;
      }

      await onConfirm(payload);
      onClose();
    } catch (err) {
      console.error("Error al actualizar liquidación:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-white border border-slate-200 text-slate-900 shadow-xl p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-slate-200 bg-slate-50">
          <DialogTitle className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>Transición de Liquidación {liquidacion.codigoLiquidacion}</span>
          </DialogTitle>
          <DialogDescription className="text-2xs text-slate-500 font-sans mt-0.5">
            Lote: {liquidacion.terreno.codigoInterno} ({liquidacion.terreno.distrito}) — Cliente: {liquidacion.cliente.razonSocial}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {/* Selector de Nuevo Estado */}
          <div>
            <label className="block text-2xs font-mono font-bold text-slate-600 uppercase mb-1">
              Fase del Flujo Financiero
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["Pendiente", "Facturado", "Cobrado", "Liquidado"] as EstadoLiquidacion[]).map(
                (e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEstado(e)}
                    className={`py-1.5 px-2 rounded text-2xs font-mono font-bold border transition-colors ${
                      estado === e
                        ? "bg-blue-50 text-blue-700 border-blue-400"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {e}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Formulario Dinámico según Estado Seleccionado */}
          {estado === "Facturado" && (
            <div className="border border-amber-200 bg-amber-50/40 rounded p-3 space-y-2">
              <div className="font-semibold text-amber-900 flex items-center space-x-1.5 border-b border-amber-200/60 pb-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                <span>Emisión de Factura Comercial (+18% IGV)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-3xs font-mono text-slate-600 mb-0.5">
                    N° Factura Electrónica (ej. F001-0004300)
                  </label>
                  <Input
                    value={numeroFactura}
                    onChange={(e) => setNumeroFactura(e.target.value)}
                    placeholder="F001-0004300"
                    required
                    className="h-8 text-xs font-mono bg-white border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-mono text-slate-600 mb-0.5">
                    Fecha de Emisión
                  </label>
                  <Input
                    type="date"
                    value={fechaFactura}
                    onChange={(e) => setFechaFactura(e.target.value)}
                    required
                    className="h-8 text-xs font-mono bg-white border-slate-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-3xs font-mono text-slate-600 mb-0.5">
                    Fecha Vencimiento de Cobro (Crédito comercial)
                  </label>
                  <Input
                    type="date"
                    value={fechaVencimientoFactura}
                    onChange={(e) => setFechaVencimientoFactura(e.target.value)}
                    className="h-8 text-xs font-mono bg-white border-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {estado === "Cobrado" && (
            <div className="border border-blue-200 bg-blue-50/40 rounded p-3 space-y-2">
              <div className="font-semibold text-blue-900 flex items-center space-x-1.5 border-b border-blue-200/60 pb-1">
                <Landmark className="w-3.5 h-3.5 text-blue-600" />
                <span>Cobranza Bancaria y Depósito SPOT (Banco Nación)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-3xs font-mono text-slate-600 mb-0.5">
                    Cuenta Bancaria Receptora
                  </label>
                  <Input
                    value={bancoEmpresa}
                    onChange={(e) => setBancoEmpresa(e.target.value)}
                    placeholder="BCP USD Cta Cte"
                    required
                    className="h-8 text-xs font-mono bg-white border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-mono text-slate-600 mb-0.5">
                    N° Operación Bancaria Abono
                  </label>
                  <Input
                    value={nroOperacionCobro}
                    onChange={(e) => setNroOperacionCobro(e.target.value)}
                    placeholder="OP-BCP-9842104"
                    required
                    className="h-8 text-xs font-mono bg-white border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-mono text-slate-600 mb-0.5">
                    N° Constancia Detracción (BN)
                  </label>
                  <Input
                    value={numeroConstanciaDetraccion}
                    onChange={(e) => setNumeroConstanciaDetraccion(e.target.value)}
                    placeholder="BN-2026-9812401"
                    className="h-8 text-xs font-mono bg-white border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-mono text-slate-600 mb-0.5">
                    Fecha de Cobro
                  </label>
                  <Input
                    type="date"
                    value={fechaCobro}
                    onChange={(e) => setFechaCobro(e.target.value)}
                    required
                    className="h-8 text-xs font-mono bg-white border-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {estado === "Liquidado" && (
            <div className="border border-purple-200 bg-purple-50/40 rounded p-3 space-y-2">
              <div className="font-semibold text-purple-900 flex items-center space-x-1.5 border-b border-purple-200/60 pb-1">
                <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Liquidación y Transferencia al Broker</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-3xs font-mono text-slate-600 mb-0.5">
                    Tipo Comprobante Broker
                  </label>
                  <select
                    value={tipoComprobanteBroker}
                    onChange={(e) =>
                      setTipoComprobanteBroker(e.target.value as TipoComprobante)
                    }
                    className="w-full h-8 px-2 text-xs font-mono bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Recibo_Honorarios">Recibo por Honorarios (4ta Cat)</option>
                    <option value="Factura">Factura (3ra Cat / Persona Jurídica)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-3xs font-mono text-slate-600 mb-0.5">
                    N° Comprobante Broker
                  </label>
                  <Input
                    value={numeroComprobanteBroker}
                    onChange={(e) => setNumeroComprobanteBroker(e.target.value)}
                    placeholder="E001-220"
                    required
                    className="h-8 text-xs font-mono bg-white border-slate-200"
                  />
                </div>

                <div className="col-span-2 flex items-center space-x-2 py-1 bg-white p-2 rounded border border-purple-100">
                  <Checkbox
                    id="chk-suspension"
                    checked={cuentaConSuspension1609}
                    onCheckedChange={(c) => setCuentaConSuspension1609(Boolean(c))}
                  />
                  <label
                    htmlFor="chk-suspension"
                    className="text-2xs text-slate-700 cursor-pointer font-sans"
                  >
                    Broker cuenta con <strong>Constancia de Suspensión Form. 1609 SUNAT</strong> (Retención 0% en vez de 8%).
                  </label>
                </div>

                <div>
                  <label className="block text-3xs font-mono text-slate-600 mb-0.5">
                    N° Operación Transferencia
                  </label>
                  <Input
                    value={nroOperacionPagoBroker}
                    onChange={(e) => setNroOperacionPagoBroker(e.target.value)}
                    placeholder="TRANS-BCP-992140"
                    required
                    className="h-8 text-xs font-mono bg-white border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-mono text-slate-600 mb-0.5">
                    Fecha de Transferencia
                  </label>
                  <Input
                    type="date"
                    value={fechaPagoBroker}
                    onChange={(e) => setFechaPagoBroker(e.target.value)}
                    required
                    className="h-8 text-xs font-mono bg-white border-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Observaciones de Auditoría */}
          <div>
            <label className="block text-2xs font-mono font-bold text-slate-600 uppercase mb-1">
              Notas & Justificación de Tesorería
            </label>
            <Input
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Anotar detalles de la transacción bancaria o comprobante..."
              className="h-8 text-xs bg-white border-slate-200 text-slate-800"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? "Guardando..." : "Confirmar y Actualizar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
