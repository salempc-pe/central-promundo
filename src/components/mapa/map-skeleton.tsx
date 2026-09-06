"use client";

import React from "react";
import { Loader2, MapPin } from "lucide-react";

export function MapSkeleton() {
  return (
    <div className="relative w-full h-full bg-slate-100 flex flex-col items-center justify-center overflow-hidden select-none border border-slate-200">
      {/* Grid de Fondo Simulado */}
      <div
        className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px]"
      />

      <div className="relative z-10 flex flex-col items-center space-y-3 p-4 bg-white/95 border border-slate-200 rounded shadow-md backdrop-blur">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-50 border border-blue-200 rounded flex items-center justify-center text-blue-600">
            <MapPin className="w-3.5 h-3.5 animate-bounce" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold font-mono text-slate-800 tracking-wider uppercase">
              POSTGIS MAP VIEWER
            </span>
            <span className="text-3xs text-slate-500 font-mono">
              Iniciando motor WebGL & Capas Cartográficas...
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-2xs text-blue-600 font-mono">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Cargando tiles de Lima Metropolitana...</span>
        </div>
      </div>
    </div>
  );
}
