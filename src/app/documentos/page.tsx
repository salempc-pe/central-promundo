import React, { Suspense } from "react";
import {
  getDocumentosAction,
  getDocumentoStatsAction,
} from "@/lib/actions/documentos-actions";
import { getTerrenosAction } from "@/lib/actions/terrenos-actions";
import { DocumentosClient } from "./documentos-client";

export const metadata = {
  title: "Gestión Documental & CPU | Promundo Sistema",
  description: "Custodia técnica, legal y semáforo de vigencia de certificados de parámetros urbanísticos.",
};

export const revalidate = 0;

export default async function DocumentosPage() {
  const [initialDocs, initialKpis, terrenos] = await Promise.all([
    getDocumentosAction(),
    getDocumentoStatsAction(),
    getTerrenosAction(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Cargando expediente documental...
        </div>
      }
    >
      <DocumentosClient
        initialDocs={initialDocs}
        initialKpis={initialKpis}
        initialTerrenos={terrenos}
      />
    </Suspense>
  );
}
