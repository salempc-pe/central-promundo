import React, { Suspense } from "react";
import { getTerrenos, getPropietarios } from "@/lib/services/terrenos";
import { getClientesAction } from "@/lib/actions/pipeline-actions";
import { TerrenosClient } from "./terrenos-client";

export const metadata = {
  title: "Inventario de Suelo y Terrenos | Promundo Sistema",
  description: "Data Grid interactivo de suelo institucional para fondos y constructoras en Lima Metropolitana",
};

export const revalidate = 0;

export default async function TerrenosPage() {
  const [initialTerrenos, initialPropietarios, initialClientes] = await Promise.all([
    getTerrenos(),
    getPropietarios(),
    getClientesAction(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Cargando inventario de suelo y Data Grid...
        </div>
      }
    >
      <TerrenosClient
        initialTerrenos={initialTerrenos}
        initialPropietarios={initialPropietarios}
        initialClientes={initialClientes}
      />
    </Suspense>
  );
}
