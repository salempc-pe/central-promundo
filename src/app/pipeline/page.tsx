import { Suspense } from "react";
import { Metadata } from "next";
import { PipelineClient } from "./pipeline-client";
import {
  getBrokersAction,
  getClientesAction,
  getNegociacionesAction,
} from "@/lib/actions/pipeline-actions";
import { getTerrenosAction } from "@/lib/actions/terrenos-actions";

export const metadata: Metadata = {
  title: "Pipeline de Negociaciones & Auditoría | Promundo Sistema",
  description:
    "Gestión visual e interactiva del embudo de ventas de suelo urbano corporativo con auditoría inmutable de bitácora y métricas de comisión.",
};

export const revalidate = 0;

export default async function PipelinePage() {
  const [brokers, terrenos, clientes, deals] = await Promise.all([
    getBrokersAction(),
    getTerrenosAction(),
    getClientesAction(),
    getNegociacionesAction(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Cargando embudo comercial de negociaciones...
        </div>
      }
    >
      <PipelineClient
        initialBrokers={brokers}
        initialTerrenos={terrenos}
        initialClientes={clientes}
        initialDeals={deals}
      />
    </Suspense>
  );
}
