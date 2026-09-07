import React, { Suspense } from "react";
import { Metadata } from "next";
import { MatchingClient } from "./matching-client";
import { getTerrenosAction } from "@/lib/actions/terrenos-actions";
import { getClientesAction, getBrokersAction } from "@/lib/actions/pipeline-actions";

export const metadata: Metadata = {
  title: "Motor de Matching Inmobiliario | Promundo Sistema",
  description:
    "Cruce automático y matriz de afinidad entre terrenos urbanos y mandatos de compra de constructoras y fondos de inversión en Lima.",
};

export const revalidate = 0;

export default async function MatchingPage() {
  const [terrenos, clientes, brokers] = await Promise.all([
    getTerrenosAction(),
    getClientesAction(),
    getBrokersAction(),
  ]);

  return (
    <div className="h-full flex flex-col min-w-0">
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs font-mono text-slate-400">
            Cargando motor de afinidad y matriz de calor...
          </div>
        }
      >
        <MatchingClient
          initialTerrenos={terrenos}
          initialClientes={clientes}
          initialBrokers={brokers}
        />
      </Suspense>
    </div>
  );
}
