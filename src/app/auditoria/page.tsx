import { Metadata } from "next";
import { Suspense } from "react";
import { AuditoriaClient } from "./auditoria-client";

export const metadata: Metadata = {
  title: "Auditoría Forense & Logs del Sistema | Promundo Sistema",
  description:
    "Bitácora forense inmutable de eventos, mutaciones de inventario de suelo, ciclo de transacciones, liquidaciones y cadena de custodia.",
};

export default function AuditoriaPage() {
  return (
    <Suspense fallback={<div className="p-4 text-xs font-mono text-slate-500">Cargando bitácora forense...</div>}>
      <AuditoriaClient />
    </Suspense>
  );
}
