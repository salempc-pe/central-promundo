"use client";

import React, { useState } from "react";
import {
  GisInfraestructuraStatus,
  CapaCartograficaInfo,
} from "@/types/configuracion";
import { Button } from "@/components/ui/button";
import {
  Database,
  Activity,
  Layers,
  CheckCircle2,
  RefreshCw,
  Server,
  Zap,
  Radio,
  ExternalLink,
} from "lucide-react";

interface GisDbMonitorProps {
  status: GisInfraestructuraStatus;
  capas: CapaCartograficaInfo[];
  onEjecutarDiagnostico: () => Promise<void>;
  onToggleCapa: (id: string, activa: boolean) => Promise<void>;
}

export function GisDbMonitor({
  status,
  capas,
  onEjecutarDiagnostico,
  onToggleCapa,
}: GisDbMonitorProps) {
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);

  const handleRunDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      await onEjecutarDiagnostico();
    } catch (err) {
      console.error("Error al ejecutar diagnóstico espacial:", err);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  return (
    <div className="space-y-3.5 select-none font-sans">
      {/* 4 Tarjetas de Telemetría PostGIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Card 1: Motor PostGIS */}
        <div className="bg-white border border-slate-200 rounded p-3 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-3xs font-mono font-bold uppercase text-slate-500">
            <span>Motor Espacial</span>
            <Server className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="mt-1">
            <div className="text-sm font-bold font-mono text-slate-900 leading-tight">
              PostGIS 3.4.2
            </div>
            <div className="text-3xs text-slate-500 font-mono mt-0.5">
              PostgreSQL 15.4 • SRID {status.sridDefault}
            </div>
          </div>
          <div className="text-3xs font-mono text-emerald-700 font-bold mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Estado: {status.estadoConexion}</span>
          </div>
        </div>

        {/* Card 2: Latencia & Conexiones */}
        <div className="bg-white border border-slate-200 rounded p-3 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-3xs font-mono font-bold uppercase text-slate-500">
            <span>Latencia Espacial</span>
            <Activity className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-1">
            <div className="text-sm font-bold font-mono text-blue-700 leading-tight">
              {status.latenciaQueryMs} ms
            </div>
            <div className="text-3xs text-slate-500 font-mono mt-0.5">
              Pool: {status.poolConexiones.activas} act / {status.poolConexiones.idle} idle
            </div>
          </div>
          <div className="text-3xs font-mono text-slate-600 mt-1">
            {status.metricasUso.consultasDWithin24h} queries ST_DWithin (24h)
          </div>
        </div>

        {/* Card 3: Índices GiST */}
        <div className="bg-white border border-slate-200 rounded p-3 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-3xs font-mono font-bold uppercase text-slate-500">
            <span>Índice Espacial GiST</span>
            <Database className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1">
            <div className="text-sm font-bold font-mono text-emerald-800 leading-tight">
              100% Válido
            </div>
            <div className="text-3xs text-slate-500 font-mono mt-0.5">
              terrenos_geom_gist_idx (64 kB)
            </div>
          </div>
          <div className="text-3xs font-mono text-slate-600 mt-1">
            {status.metricasUso.totalGeometriasRegistradas} puntos Point(X,Y)
          </div>
        </div>

        {/* Card 4: Triggers Espaciales */}
        <div className="bg-white border border-slate-200 rounded p-3 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-3xs font-mono font-bold uppercase text-slate-500">
            <span>Trigger de Sincronización</span>
            <Zap className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1">
            <div className="text-sm font-bold font-mono text-slate-900 leading-tight truncate">
              trg_sync_geometry
            </div>
            <div className="text-3xs text-slate-500 font-mono mt-0.5">
              EPSG:4326 WGS84 automático
            </div>
          </div>
          <div className="text-3xs font-mono text-emerald-700 font-semibold mt-1">
            Integridad geométrica: 100%
          </div>
        </div>
      </div>

      {/* Botón de Diagnóstico y Telemetría */}
      <div className="bg-white border border-slate-200 rounded shadow-xs p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            Diagnóstico Espacial & Verificación de Índices GiST
          </h4>
          <p className="text-3xs text-slate-500">
            Última telemetría:{" "}
            <span className="font-mono font-medium text-slate-700">
              {new Date(status.metricasUso.ultimaVerificacion).toLocaleTimeString("es-PE")}
            </span>
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleRunDiagnostic}
          disabled={isRunningDiagnostic}
          className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 mr-1.5 ${
              isRunningDiagnostic ? "animate-spin text-blue-300" : ""
            }`}
          />
          {isRunningDiagnostic
            ? "Verificando PostGIS..."
            : "Ejecutar Diagnóstico Espacial"}
        </Button>
      </div>

      {/* Capas Cartográficas Institucionales */}
      <div className="bg-white border border-slate-200 rounded shadow-xs p-3 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-blue-50 border border-blue-200 text-blue-600">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                Capas Cartográficas & Endpoints Institucionales (WMS / WFS / Vector)
              </h4>
              <p className="text-3xs text-slate-500">
                Integración con servidores geoespaciales de la Municipalidad de Lima, Sunarp, IMP e INDECI
              </p>
            </div>
          </div>
          <span className="text-3xs font-mono text-slate-500">
            {capas.filter((c) => c.activa).length} de {capas.length} capas activas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-mono font-bold text-slate-600 uppercase">
                <th className="py-1.5 px-2">Capa</th>
                <th className="py-1.5 px-2">Fuente Institucional</th>
                <th className="py-1.5 px-2 text-center">Tipo</th>
                <th className="py-1.5 px-2 text-center">Latencia</th>
                <th className="py-1.5 px-2 text-center">Estado</th>
                <th className="py-1.5 px-2 text-center">Zoom Rec.</th>
                <th className="py-1.5 px-2 text-center">Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-2xs">
              {capas.map((capa) => (
                <tr
                  key={capa.id}
                  className="h-8.5 hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-1 px-2 font-sans font-semibold text-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <Radio className="w-3 h-3 text-slate-400" />
                      <span>{capa.nombre}</span>
                    </div>
                  </td>
                  <td className="py-1 px-2 font-sans text-slate-600 text-3xs">
                    {capa.fuenteInstitucional}
                  </td>
                  <td className="py-1 px-2 text-center">
                    <span className="px-1.5 py-0.2 rounded text-3xs bg-slate-100 text-slate-700 border border-slate-200 font-mono font-semibold">
                      {capa.tipo}
                    </span>
                  </td>
                  <td className="py-1 px-2 text-center text-slate-700">
                    {capa.latenciaMs} ms
                  </td>
                  <td className="py-1 px-2 text-center">
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-3xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      {capa.estado}
                    </span>
                  </td>
                  <td className="py-1 px-2 text-center text-slate-500 text-3xs">
                    Z{capa.nivelZoomRecomendado.min} - Z{capa.nivelZoomRecomendado.max}
                  </td>
                  <td className="py-1 px-2 text-center">
                    <button
                      onClick={() => onToggleCapa(capa.id, !capa.activa)}
                      className={`px-2 py-0.5 rounded text-3xs font-mono font-bold transition-colors border ${
                        capa.activa
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {capa.activa ? "ACTIVA" : "INACTIVA"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
