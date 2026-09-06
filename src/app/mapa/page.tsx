import React, { Suspense } from "react";
import { getTerrenos } from "@/lib/services/terrenos";
import { MapaClient } from "./mapa-client";

export const metadata = {
  title: "Mapa Geoespacial de Terrenos | Promundo Sistema",
  description: "Visor cartográfico interactivo georreferenciado con PostGIS para análisis de lotes de inversión en Lima Metropolitana.",
};

export default async function MapaPage() {
  const initialTerrenos = await getTerrenos();

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Cargando visor geoespacial y capas PostGIS...
        </div>
      }
    >
      <MapaClient initialTerrenos={initialTerrenos} />
    </Suspense>
  );
}
