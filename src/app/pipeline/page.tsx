import { Suspense } from "react";
import { Metadata } from "next";
import { PipelineClient } from "./pipeline-client";

export const metadata: Metadata = {
  title: "Pipeline de Negociaciones & Auditoría | Promundo Sistema",
  description:
    "Gestión visual e interactiva del embudo de ventas de suelo urbano corporativo con auditoría inmutable de bitácora y métricas de comisión.",
};

export default function PipelinePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Cargando embudo comercial de negociaciones...
        </div>
      }
    >
      <PipelineClient />
    </Suspense>
  );
}
