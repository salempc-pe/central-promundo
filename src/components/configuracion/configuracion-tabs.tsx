"use client";

import React from "react";
import { ConfiguracionTabId } from "@/types/configuracion";
import { Building2, Sliders, Database } from "lucide-react";

interface ConfiguracionTabsProps {
  activeTab: ConfiguracionTabId;
  onTabChange: (tab: ConfiguracionTabId) => void;
  normasCount: number;
  gisLatencia: number;
}

export function ConfiguracionTabs({
  activeTab,
  onTabChange,
  normasCount,
  gisLatencia,
}: ConfiguracionTabsProps) {
  const tabs: {
    id: ConfiguracionTabId;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badge: string;
    badgeColor: string;
  }[] = [
    {
      id: "parametros",
      label: "Parámetros Urbanísticos",
      sublabel: "Alturas, coeficientes y ordenanzas",
      icon: Building2,
      badge: `${normasCount} normas`,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "matching",
      label: "Calibración Matching",
      sublabel: "Ponderaciones (100%) y tolerancias",
      icon: Sliders,
      badge: "Activo 100%",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "gis",
      label: "Monitor PostGIS & GIS",
      sublabel: "Telemetría DB y capas cartográficas",
      icon: Database,
      badge: `${gisLatencia}ms Óptimo`,
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 select-none">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2.5 px-3 py-2 rounded text-left transition-all border ${
              isSelected
                ? "bg-white border-blue-500 shadow-xs ring-1 ring-blue-500/20"
                : "bg-slate-100/80 border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900"
            }`}
          >
            <div
              className={`p-1.5 rounded ${
                isSelected
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "bg-slate-200/70 text-slate-500"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-mono font-bold ${
                    isSelected ? "text-slate-900" : "text-slate-700"
                  }`}
                >
                  {tab.label}
                </span>
                <span
                  className={`text-3xs font-mono font-bold px-1.5 py-0.2 rounded border ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              </div>
              <span className="text-3xs text-slate-500 font-sans">
                {tab.sublabel}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
