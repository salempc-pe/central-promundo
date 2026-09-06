"use client";

import React, { useState } from "react";
import { EventoAuditoriaGlobal } from "@/types/auditoria";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileDiff,
  X,
  Code2,
  Clock,
  User,
  Globe,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface AuditoriaDiffSheetProps {
  evento: EventoAuditoriaGlobal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditoriaDiffSheet({
  evento,
  isOpen,
  onClose,
}: AuditoriaDiffSheetProps) {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!evento) return null;

  const hasDiff = evento.diffCampos && evento.diffCampos.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white border border-slate-200 text-slate-900 shadow-2xl p-0 overflow-hidden font-sans">
        {/* Cabecera del Diálogo Forense */}
        <DialogHeader className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-purple-50 border border-purple-200 text-purple-600">
              <FileDiff className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                Inspección Forense: {evento.id}
              </DialogTitle>
              <p className="text-3xs text-slate-500 font-mono">
                {new Date(evento.timestamp).toLocaleString("es-PE")} • Módulo:{" "}
                <span className="uppercase font-bold text-slate-700">
                  {evento.modulo}
                </span>
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </DialogHeader>

        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Tarjeta de Metadatos del Evento */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2 text-2xs font-mono">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-slate-400 text-3xs uppercase">
                  Descripción Operativa
                </span>
                <p className="font-sans font-semibold text-slate-800 text-xs mt-0.5">
                  {evento.descripcion}
                </p>
              </div>
              <span className="px-1.5 py-0.5 rounded text-3xs border bg-slate-100 font-bold text-slate-700">
                {evento.tipoAccion}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-3xs">
              <div>
                <span className="text-slate-400 block">Entidad / ID:</span>
                <strong className="text-slate-800">
                  {evento.entidadAfectada} ({evento.entidadId})
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Usuario Actor:</span>
                <strong className="text-slate-800">
                  {evento.usuarioNombre}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Dirección IP:</span>
                <strong className="text-slate-800">
                  {evento.metadataTecnica.ipAddress}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Duración:</span>
                <strong className="text-slate-800">
                  {evento.metadataTecnica.duracionMs} ms
                </strong>
              </div>
            </div>
          </div>

          {/* Tabla de Diff (Antes vs Después) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                Diferencias de Estado Detectadas (Diff)
              </h4>
              <span className="text-3xs font-mono text-purple-700 font-semibold">
                {hasDiff ? `${evento.diffCampos!.length} campos alterados` : "Sin diferencias"}
              </span>
            </div>

            {hasDiff ? (
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-2xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-3xs font-bold text-slate-600 uppercase">
                      <th className="py-1.5 px-3 w-1/4">Campo Modificado</th>
                      <th className="py-1.5 px-3 w-3/8">Estado Anterior</th>
                      <th className="py-1.5 px-3 w-3/8">Estado Nuevo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evento.diffCampos!.map((diff, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {diff.campo}
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 line-through">
                            {JSON.stringify(diff.anterior)}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                            {JSON.stringify(diff.nuevo)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded p-4 text-center text-slate-400 font-mono text-2xs">
                Este evento representa una acción informativa o de consulta sin mutación de campos de estado.
              </div>
            )}
          </div>

          {/* Toggle para Visor de JSON en Crudo */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRawJson(!showRawJson)}
                className="h-6.5 text-3xs font-mono border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Code2 className="w-3 h-3 mr-1" />
                {showRawJson ? "Ocultar Payload JSON" : "Ver Payload JSON Crudo"}
              </Button>
              <span className="text-3xs font-mono text-slate-400">
                Cadena de custodia inmutable SHA-256
              </span>
            </div>

            {showRawJson && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-3xs font-mono">
                <div className="bg-slate-100 p-2 rounded border border-slate-200 overflow-x-auto max-h-48">
                  <span className="font-bold text-slate-500 block mb-1">
                    payload_anterior.json
                  </span>
                  <pre className="text-slate-700">
                    {JSON.stringify(evento.estadoAnterior, null, 2) || "null"}
                  </pre>
                </div>
                <div className="bg-slate-100 p-2 rounded border border-slate-200 overflow-x-auto max-h-48">
                  <span className="font-bold text-slate-500 block mb-1">
                    payload_nuevo.json
                  </span>
                  <pre className="text-slate-700">
                    {JSON.stringify(evento.estadoNuevo, null, 2) || "null"}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
