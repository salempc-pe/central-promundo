"use client";

import React from "react";
import { ComisionLiquidacion } from "@/types/comisiones";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, Download } from "lucide-react";

interface ComisionVoucherModalProps {
  liquidacion: ComisionLiquidacion | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ComisionVoucherModal({
  liquidacion,
  isOpen,
  onClose,
}: ComisionVoucherModalProps) {
  if (!liquidacion) return null;

  const formatUSD = (monto: number | string | null | undefined) => {
    if (monto === null || monto === undefined) return "$0.00";
    const val = typeof monto === "string" ? parseFloat(monto) : monto;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatPEN = (monto: number | null | undefined) => {
    if (monto === null || monto === undefined) return "S/ 0.00";
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(monto || 0);
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const comisionBruta = parseFloat(liquidacion.montoComisionTotal as string) || 0;
  const ventaTotal = parseFloat(liquidacion.montoVentaFinal as string) || 0;
  const igvTotal = liquidacion.montoFacturadoIGV - comisionBruta;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-white border border-slate-300 text-slate-900 shadow-2xl p-0 overflow-hidden print:border-none print:shadow-none">
        <DialogHeader className="p-3 border-b border-slate-200 bg-slate-50 flex flex-row items-center justify-between print:hidden">
          <DialogTitle className="text-xs font-mono font-bold text-slate-700 uppercase">
            Vista Previa de Ficha de Liquidación Formal
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-7 text-xs bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Imprimir / Guardar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 border-slate-200"
            >
              <X className="w-3.5 h-3.5 text-slate-600" />
            </Button>
          </div>
        </DialogHeader>

        {/* Documento Imprimible Formal (Membrete Corporativo) */}
        <div className="p-8 bg-white text-slate-900 font-sans space-y-6 print:p-0">
          {/* Encabezado con Membrete */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs tracking-tighter">
                  P
                </div>
                <span className="text-base font-bold tracking-wider uppercase font-mono text-slate-900">
                  PROMUNDO S.A.C.
                </span>
              </div>
              <p className="text-3xs text-slate-500 font-mono mt-0.5">
                RUC: 20608941258 • Land Intelligence & Real Estate Investment Banking
              </p>
              <p className="text-3xs text-slate-500 font-mono">
                Av. Víctor Andrés Belaúnde 147, Torre Real 3, San Isidro, Lima, Perú
              </p>
            </div>

            <div className="text-right font-mono">
              <div className="text-xs font-bold bg-slate-100 px-2 py-1 rounded border border-slate-300">
                {liquidacion.codigoLiquidacion}
              </div>
              <div className="text-3xs text-slate-500 mt-1">
                Fecha Emisión: {formatDate(new Date())}
              </div>
            </div>
          </div>

          {/* Título Principal */}
          <div className="text-center py-1 bg-slate-100 border border-slate-200 rounded">
            <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-800">
              Voucher de Liquidación de Comisión Inmobiliaria
            </h2>
          </div>

          {/* 1. Datos Generales de la Operación */}
          <div className="space-y-1.5 text-xs">
            <div className="font-mono text-2xs font-bold uppercase text-slate-700 bg-slate-50 p-1 border-l-2 border-blue-600">
              1. Datos de la Operación y Predio
            </div>
            <table className="w-full text-2xs font-mono border border-slate-200 border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 w-1/4">Código Lote / Predio:</td>
                  <td className="p-1.5 text-slate-900 w-1/4 font-bold">{liquidacion.terreno.codigoInterno}</td>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 w-1/4">Distrito / Zonif.:</td>
                  <td className="p-1.5 text-slate-900 w-1/4">{liquidacion.terreno.distrito} ({liquidacion.terreno.zonificacion})</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">Dirección:</td>
                  <td className="p-1.5 text-slate-900" colSpan={3}>{liquidacion.terreno.direccion}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">Cliente Comprador:</td>
                  <td className="p-1.5 text-slate-900 font-bold">{liquidacion.cliente.razonSocial}</td>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">RUC Cliente:</td>
                  <td className="p-1.5 text-slate-900">{liquidacion.rucReceptor}</td>
                </tr>
                <tr>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">Broker Responsable:</td>
                  <td className="p-1.5 text-slate-900 font-bold">{liquidacion.broker.nombre}</td>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">Área Terreno:</td>
                  <td className="p-1.5 text-slate-900">{liquidacion.terreno.areaM2} m²</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Liquidación Tributaria y Comercial */}
          <div className="space-y-1.5 text-xs">
            <div className="font-mono text-2xs font-bold uppercase text-slate-700 bg-slate-50 p-1 border-l-2 border-emerald-600">
              2. Desglose Económico e Impuestos de Ley (SUNAT)
            </div>
            <table className="w-full text-2xs font-mono border border-slate-200 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-left">
                  <th className="p-1.5 text-slate-700 font-bold">Concepto</th>
                  <th className="p-1.5 text-slate-700 font-bold text-center">Tasa / Base</th>
                  <th className="p-1.5 text-slate-700 font-bold text-right">Monto USD</th>
                  <th className="p-1.5 text-slate-700 font-bold text-right">Referencial PEN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-1.5 text-slate-800">Precio Final de Venta del Terreno (Escritura)</td>
                  <td className="p-1.5 text-center text-slate-600">100.00%</td>
                  <td className="p-1.5 text-right font-bold text-slate-900">{formatUSD(ventaTotal)}</td>
                  <td className="p-1.5 text-right text-slate-500">-</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-1.5 text-slate-800 font-bold">Arancel de Corretaje Promundo (Base Imponible)</td>
                  <td className="p-1.5 text-center font-bold text-blue-700">{liquidacion.pctComision}%</td>
                  <td className="p-1.5 text-right font-bold text-slate-900">{formatUSD(comisionBruta)}</td>
                  <td className="p-1.5 text-right text-slate-500">-</td>
                </tr>
                <tr>
                  <td className="p-1.5 text-slate-800">(+) IGV (Impuesto General a las Ventas)</td>
                  <td className="p-1.5 text-center text-slate-600">18.00%</td>
                  <td className="p-1.5 text-right text-slate-800">{formatUSD(igvTotal)}</td>
                  <td className="p-1.5 text-right text-slate-500">-</td>
                </tr>
                <tr className="bg-blue-50/40 font-bold">
                  <td className="p-1.5 text-blue-900">Total Factura Comercial Electrónica ({liquidacion.numeroFactura || "Sin Facturar"})</td>
                  <td className="p-1.5 text-center text-blue-900">118.00%</td>
                  <td className="p-1.5 text-right text-blue-900">{formatUSD(liquidacion.montoFacturadoIGV)}</td>
                  <td className="p-1.5 text-right text-blue-900">{formatPEN(liquidacion.montoFacturadoIGV * 3.75)}</td>
                </tr>
                <tr className="bg-amber-50/40">
                  <td className="p-1.5 text-amber-900">(-) Detracción SPOT SUNAT (Cta. Banco de la Nación)</td>
                  <td className="p-1.5 text-center text-amber-900">{liquidacion.pctDetraccion}%</td>
                  <td className="p-1.5 text-right text-amber-900 font-bold">-{formatUSD(liquidacion.montoDetraccionUSD)}</td>
                  <td className="p-1.5 text-right text-amber-900 font-bold">-{formatPEN(liquidacion.montoDetraccionPEN)}</td>
                </tr>
                <tr className="bg-emerald-50/60 font-bold">
                  <td className="p-1.5 text-emerald-950">(=) Neto Depositado en Cta. Cte. Promundo (Comercial)</td>
                  <td className="p-1.5 text-center text-emerald-950">88.00%</td>
                  <td className="p-1.5 text-right text-emerald-800 text-xs">{formatUSD(liquidacion.montoCobradoNetoUSD)}</td>
                  <td className="p-1.5 text-right text-emerald-800">{formatPEN(liquidacion.montoCobradoNetoUSD * 3.75)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Distribución y Liquidación al Broker */}
          <div className="space-y-1.5 text-xs">
            <div className="font-mono text-2xs font-bold uppercase text-slate-700 bg-slate-50 p-1 border-l-2 border-purple-600">
              3. Distribución de Aranceles & Liquidación de Broker
            </div>
            <table className="w-full text-2xs font-mono border border-slate-200 border-collapse">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 w-1/2">Margen Retenido Promundo S.A.C. ({liquidacion.pctSplitEmpresa}%):</td>
                  <td className="p-1.5 text-right font-bold text-slate-900 w-1/2">{formatUSD(liquidacion.comisionEmpresa)}</td>
                </tr>
                <tr>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">Comisión Bruta Broker ({liquidacion.pctSplitBroker}%):</td>
                  <td className="p-1.5 text-right font-bold text-purple-900">{formatUSD(liquidacion.comisionBroker)}</td>
                </tr>
                <tr>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">
                    (-) Retención IRPF 4ta Categoría ({liquidacion.retencionIRBrokerPct}%):
                    {liquidacion.cuentaConSuspension1609 && " [Con Suspensión Form. 1609]"}
                  </td>
                  <td className="p-1.5 text-right font-bold text-rose-600">-{formatUSD(liquidacion.montoRetencionIRBrokerUSD)}</td>
                </tr>
                <tr className="bg-purple-50/60 font-bold text-purple-950">
                  <td className="p-1.5 text-purple-900">(=) Neto Líquido Transferido al Broker:</td>
                  <td className="p-1.5 text-right text-purple-900 text-xs">{formatUSD(liquidacion.montoNetoBrokerUSD)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Firmas de Conformidad */}
          <div className="pt-10 grid grid-cols-2 gap-8 text-center text-2xs font-mono">
            <div>
              <div className="border-t border-slate-400 pt-1 mx-6 font-bold text-slate-800">
                GERENCIA DE TESORERÍA
              </div>
              <div className="text-3xs text-slate-500">Promundo S.A.C.</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 mx-6 font-bold text-slate-800">
                {liquidacion.broker.nombre.toUpperCase()}
              </div>
              <div className="text-3xs text-slate-500">Broker Asignado / Intermediario</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
