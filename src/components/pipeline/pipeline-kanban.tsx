"use client";

import React from "react";
import {
  EtapaNegociacion,
  ETAPAS_CONFIG,
  NegociacionCompleta,
} from "@/types";
import { KanbanColumn } from "./kanban-column";

interface PipelineKanbanProps {
  deals: NegociacionCompleta[];
  onDealClick: (deal: NegociacionCompleta) => void;
  onRequestChangeStage: (deal: NegociacionCompleta, targetStage?: EtapaNegociacion) => void;
  onAddNote: (deal: NegociacionCompleta) => void;
  onDropDeal: (dealId: string, targetEtapa: EtapaNegociacion) => void;
}

const ETAPAS_ORDER: EtapaNegociacion[] = [
  "Ficha_Enviada",
  "En_Evaluacion",
  "Visita_Realizada",
  "LOI_Oferta",
  "Due_Diligence",
  "Cierre_Ganado",
  "Descartado",
];

export function PipelineKanban({
  deals,
  onDealClick,
  onRequestChangeStage,
  onAddNote,
  onDropDeal,
}: PipelineKanbanProps) {
  return (
    <div className="flex-1 overflow-x-auto p-3 bg-slate-200/60">
      <div className="flex gap-3 min-w-[1900px] h-full pb-2">
        {ETAPAS_ORDER.map((etapaId) => {
          const stageDeals = deals.filter((d) => d.etapa === etapaId);
          return (
            <KanbanColumn
              key={etapaId}
              etapaId={etapaId}
              deals={stageDeals}
              onDealClick={onDealClick}
              onRequestChangeStage={onRequestChangeStage}
              onAddNote={onAddNote}
              onDropDeal={onDropDeal}
            />
          );
        })}
      </div>
    </div>
  );
}
