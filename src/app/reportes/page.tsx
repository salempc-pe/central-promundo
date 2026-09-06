import { Metadata } from "next";
import { Suspense } from "react";
import { ReportesClient } from "./reportes-client";

export const metadata: Metadata = {
  title: "Métricas BI & Reportes Ejecutivos | Promundo Sistema",
  description:
    "Inteligencia de negocio de suelo urbano corporativo en Lima: volumen transaccionado, rendimiento de brokers, embudo de conversión y absorción de mercado.",
};

export default function ReportesPage() {
  return (
    <Suspense fallback={<div className="p-4 text-xs font-mono text-slate-500">Cargando métricas y reportes BI...</div>}>
      <ReportesClient />
    </Suspense>
  );
}
