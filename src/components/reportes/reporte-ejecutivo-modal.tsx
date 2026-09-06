"use client";

import React from "react";
import { ReporteEjecutivo } from "@/types/reportes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";

interface ReporteEjecutivoModalProps {
  reporte: ReporteEjecutivo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReporteEjecutivoModal({
  reporte,
  isOpen,
  onClose,
}: ReporteEjecutivoModalProps) {
  if (!reporte) return null;

  const { kpis, rankingBrokers, absorcionMercado, resumenEjecutivo } = reporte;

  const formatUSD = (monto: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-white border border-slate-300 text-slate-900 shadow-2xl p-0 overflow-hidden print:border-none print:shadow-none">
        {/* Cabecera del Modal (Oculta en Impresión) */}
        <DialogHeader className="p-3 border-b border-slate-200 bg-slate-50 flex flex-row items-center justify-between print:hidden">
          <DialogTitle className="text-xs font-mono font-bold text-slate-700 uppercase">
            Vista Previa de Informe Ejecutivo para Comité de Inversión
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
        <div className="p-8 bg-white text-slate-900 font-sans space-y-5 print:p-0 max-h-[85vh] overflow-y-auto print:max-h-none">
          {/* Membrete Oficial */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
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
                RUC: 20608941258 • Land Intelligence & Investment Banking
              </p>
              <p className="text-3xs text-slate-500 font-mono">
                Av. Víctor Andrés Belaúnde 147, Torre Real 3, San Isidro, Lima, Perú
              </p>
            </div>

            <div className="text-right font-mono">
              <div className="text-xs font-bold bg-slate-100 px-2 py-1 rounded border border-slate-300">
                {reporte.id}
              </div>
              <div className="text-3xs text-slate-500 mt-1">
                Período: <strong>{reporte.periodoAnalizado}</strong>
              </div>
              <div className="text-3xs text-slate-400">
                Fecha: {new Date(reporte.fechaGeneracion).toLocaleDateString("es-PE")}
              </div>
            </div>
          </div>

          {/* Título */}
          <div className="text-center py-1.5 bg-slate-100 border border-slate-200 rounded">
            <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-800">
              INFORME EJECUTIVO DE RENDIMIENTO COMERCIAL & ABSORCIÓN DE SUELO URBANO
            </h2>
          </div>

          {/* 1. Diagnóstico Estratégico */}
          <div className="space-y-2 text-xs">
            <div className="font-mono text-2xs font-bold uppercase text-slate-700 bg-slate-50 p-1 border-l-2 border-blue-600">
              1. Diagnóstico Ejecutivo & Puntos Clave
            </div>
            <p className="text-2xs text-slate-700 font-sans leading-relaxed italic bg-slate-50/50 p-2 rounded border border-slate-100">
              &quot;{resumenEjecutivo.diagnosticoGeneral}&quot;
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-2xs font-sans">
              <div className="space-y-1">
                <span className="font-bold text-slate-800 font-mono uppercase text-3xs block text-blue-700">
                  Aspectos Destacados de Gestión:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  {resumenEjecutivo.puntosClave.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-800 font-mono uppercase text-3xs block text-amber-700">
                  Alertas Operativas & Oportunidades:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  {resumenEjecutivo.alertasRiesgoOperativo.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                  {resumenEjecutivo.oportunidadesDeMercado.slice(0, 1).map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 2. Cuadro Macro de KPIs Financieros */}
          <div className="space-y-1.5 text-xs">
            <div className="font-mono text-2xs font-bold uppercase text-slate-700 bg-slate-50 p-1 border-l-2 border-emerald-600">
              2. Balance Consolidado de Transacciones & Aranceles
            </div>
            <table className="w-full text-2xs font-mono border border-slate-200 border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 w-1/4">Volumen Transaccionado:</td>
                  <td className="p-1.5 text-slate-900 w-1/4 font-bold">{formatUSD(kpis.volumenTotalTransaccionadoUSD)}</td>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600 w-1/4">Aranceles 3.00%:</td>
                  <td className="p-1.5 text-emerald-700 w-1/4 font-bold">{formatUSD(kpis.totalArancelesComisionUSD)}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">Margen Empresa (50%):</td>
                  <td className="p-1.5 text-slate-900 font-bold">{formatUSD(kpis.margenNetoPromundoUSD)}</td>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">Ticket Promedio / Lote:</td>
                  <td className="p-1.5 text-slate-900">{formatUSD(kpis.ticketPromedioTransaccionUSD)}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">Tasa Conversión (Win Rate):</td>
                  <td className="p-1.5 text-purple-700 font-bold">{kpis.tasaConversionPipelinePct}%</td>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">Ciclo Medio de Venta:</td>
                  <td className="p-1.5 text-slate-900">{kpis.diasPromedioCicloCierre} días</td>
                </tr>
                <tr>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">Absorción de Suelo:</td>
                  <td className="p-1.5 text-slate-900">{kpis.tasaAbsorcionInventarioPct}% ({kpis.areaTotalTransaccionadaM2} m²)</td>
                  <td className="p-1.5 bg-slate-50 font-semibold text-slate-600">Pipeline Activo Ponderado:</td>
                  <td className="p-1.5 text-blue-700 font-bold">{formatUSD(kpis.volumenPipelinePonderadoUSD)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Resumen de Brokers */}
          <div className="space-y-1.5 text-xs">
            <div className="font-mono text-2xs font-bold uppercase text-slate-700 bg-slate-50 p-1 border-l-2 border-purple-600">
              3. Producción y Cumplimiento de Cuota por Broker
            </div>
            <table className="w-full text-2xs font-mono border border-slate-200 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-left">
                  <th className="p-1.5 text-slate-700">Broker</th>
                  <th className="p-1.5 text-center text-slate-700">Rol</th>
                  <th className="p-1.5 text-center text-slate-700">Cierres</th>
                  <th className="p-1.5 text-center text-slate-700">Win Rate</th>
                  <th className="p-1.5 text-right text-slate-700">Volumen Venta</th>
                  <th className="p-1.5 text-right text-slate-700">Arancel 3%</th>
                  <th className="p-1.5 text-center text-slate-700">Cuota %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rankingBrokers.map((b) => (
                  <tr key={b.brokerId}>
                    <td className="p-1.5 font-sans font-semibold text-slate-800">{b.brokerNombre}</td>
                    <td className="p-1.5 text-center text-slate-500 uppercase text-3xs">{b.brokerRol.replace("_", " ")}</td>
                    <td className="p-1.5 text-center font-bold text-slate-900">{b.cierresGanados}</td>
                    <td className="p-1.5 text-center text-purple-700">{b.tasaConversionPct}%</td>
                    <td className="p-1.5 text-right font-bold text-slate-900">{formatUSD(b.volumenTransaccionadoUSD)}</td>
                    <td className="p-1.5 text-right text-emerald-700">{formatUSD(b.comisionesGeneradasUSD)}</td>
                    <td className="p-1.5 text-center font-bold text-blue-700">{b.cumplimientoCuotaPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Firmas de Conformidad */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-2xs font-mono">
            <div>
              <div className="border-t border-slate-400 pt-1 mx-6 font-bold text-slate-800">
                DIRECCIÓN GENERAL / SOCIO PRINCIPAL
              </div>
              <div className="text-3xs text-slate-500">Promundo Land Intelligence</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 mx-6 font-bold text-slate-800">
                GERENCIA COMERCIAL & BROKERAGE
              </div>
              <div className="text-3xs text-slate-500">Comité de Inversiones Inmobiliarias</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
