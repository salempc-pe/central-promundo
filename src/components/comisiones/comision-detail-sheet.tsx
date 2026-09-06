"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ComisionLiquidacion, EstadoLiquidacion } from "@/types/comisiones";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Building,
  User,
  DollarSign,
  Landmark,
  FileSpreadsheet,
  FileCheck2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Receipt,
  FileText,
  CreditCard,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface ComisionDetailSheetProps {
  liquidacion: ComisionLiquidacion | null;
  isOpen: boolean;
  onClose: () => void;
  onCambiarEstado: (
    item: ComisionLiquidacion,
    estadoSiguiente?: EstadoLiquidacion
  ) => void;
  onGenerarVoucher: (item: ComisionLiquidacion) => void;
}

export function ComisionDetailSheet({
  liquidacion,
  isOpen,
  onClose,
  onCambiarEstado,
  onGenerarVoucher,
}: ComisionDetailSheetProps) {
  const [activeTab, setActiveTab] = useState("cascada");

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
      month: "short",
      year: "numeric",
    });
  };

  const getEstadoBadge = (estado: EstadoLiquidacion) => {
    switch (estado) {
      case "Pendiente":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3 h-3 mr-1 text-slate-500" />
            Pendiente de Facturar
          </span>
        );
      case "Facturado":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <FileSpreadsheet className="w-3 h-3 mr-1 text-amber-600" />
            Facturado (En Cobranza)
          </span>
        );
      case "Cobrado":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-blue-600" />
            Cobrado en Banco
          </span>
        );
      case "Liquidado":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileCheck2 className="w-3 h-3 mr-1 text-emerald-600" />
            Liquidado al Broker
          </span>
        );
    }
  };

  const comisionBruta = parseFloat(liquidacion.montoComisionTotal as string) || 0;
  const ventaTotal = parseFloat(liquidacion.montoVentaFinal as string) || 0;
  const montoIGV = liquidacion.montoFacturadoIGV - comisionBruta;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl bg-white border-l border-slate-200 p-0 flex flex-col h-full shadow-2xl z-50 text-slate-900"
      >
        {/* Cabecera del Sheet */}
        <SheetHeader className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {liquidacion.codigoLiquidacion}
              </span>
              {getEstadoBadge(liquidacion.estadoLiquidacion)}
            </div>

            <div className="flex items-center space-x-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGenerarVoucher(liquidacion)}
                className="h-7 text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <FileCheck2 className="w-3.5 h-3.5 mr-1 text-slate-600" />
                Voucher PDF
              </Button>

              <Button
                size="sm"
                onClick={() => onCambiarEstado(liquidacion)}
                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
              >
                Gestionar Estado
              </Button>
            </div>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <SheetTitle className="text-sm font-bold text-slate-900">
                {liquidacion.cliente.razonSocial}
              </SheetTitle>
              <SheetDescription className="text-2xs text-slate-500 font-sans mt-0.5 flex items-center space-x-1.5">
                <span>
                  Terreno:{" "}
                  <Link
                    href={`/terrenos?q=${liquidacion.terreno.codigoInterno}`}
                    className="font-mono text-blue-600 hover:text-blue-800 hover:underline font-bold"
                  >
                    {liquidacion.terreno.codigoInterno}
                  </Link>
                </span>
                <span>•</span>
                <span>{liquidacion.terreno.distrito}</span>
                <span>•</span>
                <span>{liquidacion.terreno.zonificacion}</span>
                <span>•</span>
                <Link
                  href={`/pipeline?dealId=${liquidacion.negociacion.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 font-mono"
                >
                  <span>Ver Pipeline</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </SheetDescription>
            </div>

            <div className="text-right">
              <div className="text-3xs font-mono uppercase text-slate-500">
                Arancel Bruto (3.00%)
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {formatUSD(comisionBruta)}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Pestañas de Navegación */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-4 border-b border-slate-200 bg-white">
            <TabsList className="h-9 p-0 bg-transparent space-x-4 border-b-0">
              <TabsTrigger
                value="cascada"
                className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent text-xs font-medium px-1 text-slate-600"
              >
                Cascada Tributaria
              </TabsTrigger>
              <TabsTrigger
                value="splits"
                className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent text-xs font-medium px-1 text-slate-600"
              >
                Splits & Broker
              </TabsTrigger>
              <TabsTrigger
                value="auditoria"
                className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent text-xs font-medium px-1 text-slate-600"
              >
                Auditoría & Bancos
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: Cascada Tributaria y Financiera */}
          <TabsContent value="cascada" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
            {/* Tarjeta de Resumen Comercial */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-2">
              <div className="font-semibold text-slate-800 flex items-center space-x-1.5 border-b border-slate-200 pb-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Base Comercial de la Compraventa</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs font-mono">
                <div>
                  <span className="text-slate-500 block">Precio Venta Terreno:</span>
                  <strong className="text-slate-900">{formatUSD(ventaTotal)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Área Catastral:</span>
                  <strong className="text-slate-900">{liquidacion.terreno.areaM2} m²</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Precio / m²:</span>
                  <strong className="text-slate-900">{formatUSD(liquidacion.terreno.precioM2)}/m²</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Arancel Pactado:</span>
                  <strong className="text-blue-700">{liquidacion.pctComision}% Neto</strong>
                </div>
              </div>
            </div>

            {/* Cascada Matemática Tributaria (Perú SUNAT) */}
            <div className="border border-slate-200 rounded bg-white overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Desglose Tributario Facturación (SUNAT SPOT 12%)</span>
                <span className="text-3xs font-mono text-slate-500">Régimen General 3ra Cat</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs font-mono">
                <div className="px-3 py-2 flex items-center justify-between bg-white">
                  <span className="text-slate-600">(=) Comisión Bruta (Base Imponible)</span>
                  <span className="font-bold text-slate-900">{formatUSD(comisionBruta)}</span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between bg-slate-50/50">
                  <span className="text-slate-600">(+) IGV (18.00% Ley Tributaria)</span>
                  <span className="text-slate-700">{formatUSD(montoIGV)}</span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between bg-blue-50/40 font-bold border-t border-slate-200">
                  <span className="text-blue-900">(=) Total Factura Electrónica Comercial</span>
                  <span className="text-blue-700 text-sm">
                    {formatUSD(liquidacion.montoFacturadoIGV)}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between bg-amber-50/50">
                  <div className="flex flex-col">
                    <span className="text-amber-900 font-semibold">
                      (-) Detracción SPOT SUNAT ({liquidacion.pctDetraccion}%)
                    </span>
                    <span className="text-3xs text-amber-700 font-sans">
                      Aporte a Cta. Banco de la Nación ({formatPEN(liquidacion.montoDetraccionPEN)})
                    </span>
                  </div>
                  <span className="font-bold text-amber-800">
                    -{formatUSD(liquidacion.montoDetraccionUSD)}
                  </span>
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between bg-emerald-50/60 font-bold text-emerald-950 border-t border-slate-200">
                  <div className="flex flex-col">
                    <span className="text-emerald-900">(=) Neto a Depositar en Cta. Cte. Promundo</span>
                    <span className="text-3xs text-emerald-700 font-sans">
                      88% abonado por el comprador a cuenta bancaria comercial
                    </span>
                  </div>
                  <span className="text-base text-emerald-700 font-mono">
                    {formatUSD(liquidacion.montoCobradoNetoUSD)}
                  </span>
                </div>
              </div>
            </div>

            {/* Datos de Comprobante Factura */}
            <div className="border border-slate-200 rounded p-3 bg-white space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center space-x-1.5 border-b border-slate-200 pb-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                <span>Comprobante de Pago Emitido al Cliente</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-2xs font-mono">
                <div>
                  <span className="text-slate-500 block">Número de Factura:</span>
                  <strong className="text-slate-800">
                    {liquidacion.numeroFactura || "Pendiente de Emisión"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Fecha de Emisión:</span>
                  <strong className="text-slate-800">
                    {formatDate(liquidacion.fechaFactura)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Vencimiento Cobro:</span>
                  <strong className="text-slate-800">
                    {formatDate(liquidacion.fechaVencimientoFactura)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">RUC Receptor:</span>
                  <strong className="text-slate-800">{liquidacion.rucReceptor}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Razón Social Receptor:</span>
                  <strong className="text-slate-800 truncate block">
                    {liquidacion.razonSocialReceptor}
                  </strong>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Splits & Broker */}
          <TabsContent value="splits" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
            {/* Cuadro de Distribución de Aranceles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Margen Empresa */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-mono font-bold uppercase text-slate-500">
                    Promundo S.A.C.
                  </span>
                  <span className="text-3xs font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    {liquidacion.pctSplitEmpresa}% Split
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {formatUSD(liquidacion.comisionEmpresa)}
                </div>
                <p className="text-3xs text-slate-500">
                  Margen corporativo destinado a soporte operativo, due diligence legal y rentabilidad institucional.
                </p>
              </div>

              {/* Remuneración Broker */}
              <div className="bg-purple-50/50 border border-purple-200 rounded p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-mono font-bold uppercase text-purple-700">
                    Broker Asignado
                  </span>
                  <span className="text-3xs font-mono font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                    {liquidacion.pctSplitBroker}% Split
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-purple-800">
                  {formatUSD(liquidacion.comisionBroker)}
                </div>
                <p className="text-3xs text-purple-600 font-mono">
                  {liquidacion.broker.nombre} ({liquidacion.broker.rol.replace("_", " ")})
                </p>
              </div>
            </div>

            {/* Liquidación de Renta al Broker (4ta Categoría) */}
            <div className="border border-slate-200 rounded bg-white overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Liquidación Tributaria de Honorarios a Broker</span>
                <span className="text-3xs font-mono text-slate-500">
                  {liquidacion.tipoComprobanteBroker === "Recibo_Honorarios"
                    ? "4ta Categoría (RHE)"
                    : "3ra Categoría (Factura)"}
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-xs font-mono">
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-slate-600">Comisión Bruta del Broker (50%)</span>
                  <span className="font-bold text-slate-900">
                    {formatUSD(liquidacion.comisionBroker)}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between bg-slate-50/50">
                  <div className="flex flex-col">
                    <span className="text-slate-700">
                      (-) Retención IRPF 4ta Cat ({liquidacion.retencionIRBrokerPct}%)
                    </span>
                    {liquidacion.cuentaConSuspension1609 ? (
                      <span className="text-3xs text-emerald-600 font-semibold font-sans">
                        Cuenta con Suspensión Form. 1609 SUNAT (Retención 0%)
                      </span>
                    ) : (
                      <span className="text-3xs text-slate-500 font-sans">
                        Declarado y pagado por Promundo vía PLAME / PDT 616
                      </span>
                    )}
                  </div>
                  <span className="text-rose-600 font-bold">
                    -{formatUSD(liquidacion.montoRetencionIRBrokerUSD)}
                  </span>
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between bg-purple-50/60 font-bold text-purple-950 border-t border-slate-200">
                  <div className="flex flex-col">
                    <span className="text-purple-900">(=) Neto Líquido a Transferir al Broker</span>
                    <span className="text-3xs text-purple-700 font-sans">
                      Importe neto pagadero contra entrega de comprobante
                    </span>
                  </div>
                  <span className="text-base text-purple-800 font-mono">
                    {formatUSD(liquidacion.montoNetoBrokerUSD)}
                  </span>
                </div>
              </div>
            </div>

            {/* Datos Bancarios y Sustento del Broker */}
            <div className="border border-slate-200 rounded p-3 bg-white space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center space-x-1.5 border-b border-slate-200 pb-1.5">
                <Receipt className="w-3.5 h-3.5 text-purple-600" />
                <span>Comprobante y Cuenta Bancaria del Broker</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-2xs font-mono">
                <div>
                  <span className="text-slate-500 block">N° Comprobante:</span>
                  <strong className="text-slate-800">
                    {liquidacion.numeroComprobanteBroker || "Pendiente de Recepción"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Modalidad de Pago:</span>
                  <strong className="text-slate-800">
                    {liquidacion.modalidadPagoBroker
                      ? liquidacion.modalidadPagoBroker.replace("_", " ")
                      : "Transferencia"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Fecha Liquidación:</span>
                  <strong className="text-slate-800">
                    {formatDate(liquidacion.fechaPagoBroker)}
                  </strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Cuenta Bancaria Destino:</span>
                  <strong className="text-slate-800">
                    {liquidacion.bancoBroker || "No registrada"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">N° Operación Transferencia:</span>
                  <strong className="text-slate-800">
                    {liquidacion.nroOperacionPagoBroker || "-"}
                  </strong>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Auditoría & Bancos */}
          <TabsContent value="auditoria" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
            {/* Trazabilidad Bancaria de Cobranza */}
            <div className="border border-slate-200 rounded p-3 bg-white space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center space-x-1.5 border-b border-slate-200 pb-1.5">
                <Landmark className="w-3.5 h-3.5 text-blue-600" />
                <span>Acreditación Bancaria en Cuentas Promundo</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                <div>
                  <span className="text-slate-500 block">Cuenta Bancaria Comercial:</span>
                  <strong className="text-slate-800">
                    {liquidacion.bancoEmpresa || "Pendiente de ingreso"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">N° Operación Bancaria Cobro:</span>
                  <strong className="text-slate-800">
                    {liquidacion.nroOperacionCobro || "Pendiente"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Fecha Abono Comercial:</span>
                  <strong className="text-slate-800">
                    {formatDate(liquidacion.fechaCobro)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">N° Constancia SPOT (Banco Nación):</span>
                  <strong className="text-slate-800">
                    {liquidacion.numeroConstanciaDetraccion || "Sin depósito registrado"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Observaciones de Tesorería */}
            <div className="border border-slate-200 rounded p-3 bg-white space-y-2 text-xs">
              <div className="font-semibold text-slate-800 flex items-center space-x-1.5 border-b border-slate-200 pb-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Observaciones & Bitácora de Tesorería</span>
              </div>
              <p className="text-2xs text-slate-600 font-sans leading-relaxed">
                {liquidacion.observaciones || "Sin observaciones registradas por tesorería."}
              </p>
              <div className="text-3xs font-mono text-slate-400 pt-1">
                Última actualización: {new Date(liquidacion.updatedAt).toLocaleString("es-PE")}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
