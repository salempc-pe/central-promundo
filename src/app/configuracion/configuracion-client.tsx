"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ConfiguracionTabId,
  ParametroUrbanisticoDistrital,
  ConfiguracionMatchingGlobal,
  GisInfraestructuraStatus,
  CapaCartograficaInfo,
} from "@/types/configuracion";
import {
  getParametrosUrbanisticos,
  updateParametroUrbanistico,
  getConfiguracionMatching,
  updateConfiguracionMatching,
  resetConfiguracionMatching,
  getGisInfraestructuraStatus,
  ejecutarDiagnosticoGis,
  getCapasCartograficas,
  toggleCapaCartografica,
} from "@/lib/services/configuracion";
import { ConfiguracionTabs } from "@/components/configuracion/configuracion-tabs";
import { ParametrosUrbanisticosTable } from "@/components/configuracion/parametros-urbanisticos-table";
import { MatchingConfigPanel } from "@/components/configuracion/matching-config-panel";
import { GisDbMonitor } from "@/components/configuracion/gis-db-monitor";
import { Settings, ShieldCheck, Database } from "lucide-react";

export function ConfiguracionClient() {
  const [activeTab, setActiveTab] =
    useState<ConfiguracionTabId>("parametros");
  const [parametros, setParametros] = useState<
    ParametroUrbanisticoDistrital[]
  >([]);
  const [matchingConfig, setMatchingConfig] =
    useState<ConfiguracionMatchingGlobal | null>(null);
  const [gisStatus, setGisStatus] =
    useState<GisInfraestructuraStatus | null>(null);
  const [capas, setCapas] = useState<CapaCartograficaInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [paramsData, matchingData, gisData, capasData] = await Promise.all([
        getParametrosUrbanisticos(),
        getConfiguracionMatching(),
        getGisInfraestructuraStatus(),
        getCapasCartograficas(),
      ]);
      setParametros(paramsData);
      setMatchingConfig(matchingData);
      setGisStatus(gisData);
      setCapas(capasData);
    } catch (err) {
      console.error("Error al cargar configuración:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateParametro = async (
    id: string,
    cambios: Partial<ParametroUrbanisticoDistrital>
  ) => {
    await updateParametroUrbanistico(id, cambios);
    const updated = await getParametrosUrbanisticos();
    setParametros(updated);
  };

  const handleSaveMatching = async (config: ConfiguracionMatchingGlobal) => {
    const updated = await updateConfiguracionMatching(config);
    setMatchingConfig(updated);
  };

  const handleResetMatching = async () => {
    const reset = await resetConfiguracionMatching();
    setMatchingConfig(reset);
  };

  const handleEjecutarDiagnosticoGis = async () => {
    const status = await ejecutarDiagnosticoGis();
    setGisStatus(status);
  };

  const handleToggleCapa = async (id: string, activa: boolean) => {
    await toggleCapaCartografica(id, activa);
    const updated = await getCapasCartograficas();
    setCapas(updated);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70 overflow-y-auto select-none p-3 space-y-3 font-sans">
      {/* Encabezado Institucional */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded px-3.5 py-2 shadow-xs shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white shadow-xs">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Configuración GIS & Parámetros Normativos
              </h1>
              <span className="text-3xs font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Módulo H1
              </span>
            </div>
            <p className="text-3xs text-slate-500 font-mono">
              Gobernanza de ordenanzas distritales, calibración del motor de matching y telemetría PostGIS.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-3xs font-mono text-slate-500">
          <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <Database className="w-3.5 h-3.5 text-purple-600" />
            <span>PostGIS 3.4 • EPSG:4326</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1">
            <span>Ley 29090:</span>
            <strong className="text-slate-800">CPU 36m</strong>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <ConfiguracionTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        normasCount={parametros.length}
        gisLatencia={gisStatus?.latenciaQueryMs || 12}
      />

      {/* Contenido de la Pestaña Activa */}
      {activeTab === "parametros" && (
        <ParametrosUrbanisticosTable
          data={parametros}
          onUpdateParametro={handleUpdateParametro}
        />
      )}

      {activeTab === "matching" && matchingConfig && (
        <MatchingConfigPanel
          config={matchingConfig}
          onSaveConfig={handleSaveMatching}
          onResetConfig={handleResetMatching}
        />
      )}

      {activeTab === "gis" && gisStatus && (
        <GisDbMonitor
          status={gisStatus}
          capas={capas}
          onEjecutarDiagnostico={handleEjecutarDiagnosticoGis}
          onToggleCapa={handleToggleCapa}
        />
      )}
    </div>
  );
}
