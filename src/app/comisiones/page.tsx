import { Suspense } from "react";
import { Metadata } from "next";
import { ComisionesClient } from "./comisiones-client";

export const metadata: Metadata = {
  title: "Comisiones, Liquidaciones y Reportes Financieros | Promundo Sistema",
  description:
    "Gestión integral de liquidaciones de aranceles de corretaje de suelo urbano corporativo en Lima, cálculo de IGV, detracción SPOT 12% SUNAT y balances a brokers.",
};

export default function ComisionesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Cargando libro financiero de comisiones...
        </div>
      }
    >
      <ComisionesClient />
    </Suspense>
  );
}
