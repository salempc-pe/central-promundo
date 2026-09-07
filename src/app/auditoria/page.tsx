import { Metadata } from "next";
import { Suspense } from "react";
import { AuditoriaClient } from "./auditoria-client";
import {
  getEventosAuditoriaAction,
  getAuditoriaKpisAction,
} from "@/lib/actions/auditoria-actions";

export const metadata: Metadata = {
  title: "Auditoría Forense & Logs del Sistema | Promundo Sistema",
  description:
    "Bitácora forense inmutable de eventos, mutaciones de inventario de suelo, ciclo de transacciones, liquidaciones y cadena de custodia.",
};

export const revalidate = 0;

export default async function AuditoriaPage() {
  const [initialEventos, initialKpis] = await Promise.all([
    getEventosAuditoriaAction(),
    getAuditoriaKpisAction(),
  ]);

  return (
    <Suspense fallback={<div className="p-4 text-xs font-mono text-slate-500">Cargando bitácora forense...</div>}>
      <AuditoriaClient initialEventos={initialEventos} initialKpis={initialKpis} />
    </Suspense>
  );
}
