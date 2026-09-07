import { Suspense } from "react";
import { Metadata } from "next";
import { ComisionesClient } from "./comisiones-client";
import {
  getComisionesAction,
  getComisionesKpisAction,
} from "@/lib/actions/comisiones-actions";
import { getBrokersAction } from "@/lib/actions/pipeline-actions";

export const metadata: Metadata = {
  title: "Comisiones, Liquidaciones y Reportes Financieros | Promundo Sistema",
  description:
    "Gestión integral de liquidaciones de aranceles de corretaje de suelo urbano corporativo en Lima, cálculo de IGV, detracción SPOT 12% SUNAT y balances a brokers.",
};

export const revalidate = 0;

export default async function ComisionesPage() {
  const [comisiones, kpis, brokers] = await Promise.all([
    getComisionesAction(),
    getComisionesKpisAction(),
    getBrokersAction(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Cargando libro financiero de comisiones...
        </div>
      }
    >
      <ComisionesClient
        initialComisiones={comisiones}
        initialKpis={kpis}
        initialBrokers={brokers}
      />
    </Suspense>
  );
}
