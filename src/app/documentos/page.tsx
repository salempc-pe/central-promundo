import React, { Suspense } from "react";
import { getDocumentos, getDocumentoStats } from "@/lib/services/documentos";
import { DocumentosClient } from "./documentos-client";

export const metadata = {
  title: "Gestión Documental & CPU | Promundo Sistema",
  description: "Custodia técnica, legal y semáforo de vigencia de certificados de parámetros urbanísticos.",
};

export default async function DocumentosPage() {
  const [initialDocs, initialKpis] = await Promise.all([
    getDocumentos(),
    getDocumentoStats(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Cargando expediente documental...
        </div>
      }
    >
      <DocumentosClient initialDocs={initialDocs} initialKpis={initialKpis} />
    </Suspense>
  );
}
