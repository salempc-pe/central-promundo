import { Metadata } from "next";
import { Suspense } from "react";
import { ReportesClient } from "./reportes-client";
import { getReportesDataAction } from "@/lib/actions/reportes-actions";
import { getBrokersAction } from "@/lib/actions/pipeline-actions";

export const metadata: Metadata = {
  title: "Métricas BI & Reportes Ejecutivos | Promundo Sistema",
  description:
    "Inteligencia de negocio de suelo urbano corporativo en Lima: volumen transaccionado, rendimiento de brokers, embudo de conversión y absorción de mercado.",
};

export const revalidate = 0;

export default async function ReportesPage() {
  const [reporte, brokers] = await Promise.all([
    getReportesDataAction(),
    getBrokersAction(),
  ]);

  return (
    <Suspense fallback={<div className="p-4 text-xs font-mono text-slate-500">Cargando métricas y reportes BI...</div>}>
      <ReportesClient initialReporte={reporte} initialBrokers={brokers} />
    </Suspense>
  );
}
