import {
  NegociacionCompleta,
  PipelineKpis,
  EtapaNegociacion,
  ETAPAS_CONFIG,
} from "@/types";

export * from "@/lib/actions/pipeline-actions";

type EtapaNegotiationList = EtapaNegociacion[];

/**
 * Calcula los KPIs consolidados del pipeline a partir de la lista de negociaciones fiduciarias
 */
export function calcularPipelineKpis(
  deals: NegociacionCompleta[]
): PipelineKpis {
  const totalNegociaciones = deals.length;
  const dealsActivosList = deals.filter(
    (d) => d.etapa !== "Cierre_Ganado" && d.etapa !== "Descartado"
  );
  const dealsActivos = dealsActivosList.length;

  const dealsEstancados = dealsActivosList.filter(
    (d) => d.diasEnEtapaActual > 14
  ).length;

  const volumenTotalNominalUSD = dealsActivosList.reduce(
    (acc, d) => acc + Number(d.montoOferta || 0),
    0
  );

  const volumenPonderadoUSD = dealsActivosList.reduce(
    (acc, d) =>
      acc + Number(d.montoOferta || 0) * ((d.probabilidadCierre || 0) / 100),
    0
  );

  const ganadosList = deals.filter((d) => d.etapa === "Cierre_Ganado");
  const descartadosList = deals.filter((d) => d.etapa === "Descartado");

  const cierresGanados = ganadosList.length;
  const volumenCerradoUSD = ganadosList.reduce(
    (acc, d) => acc + Number(d.montoOferta || 0),
    0
  );

  const totalCerrados = cierresGanados + descartadosList.length;
  const tasaConversionPct =
    totalCerrados > 0 ? (cierresGanados / totalCerrados) * 100 : 0;

  const ticketPromedioUSD =
    dealsActivos > 0 ? volumenTotalNominalUSD / dealsActivos : 0;

  const comisionEstimadaTotalUSD = volumenTotalNominalUSD * 0.03;

  // Por Etapa
  const porEtapa = (Object.keys(ETAPAS_CONFIG) as EtapaNegotiationList).reduce(
    (acc, etapaKey) => {
      const etapaDeals = deals.filter((d) => d.etapa === etapaKey);
      const totalUSD = etapaDeals.reduce(
        (sum, d) => sum + Number(d.montoOferta || 0),
        0
      );
      const ponderadoUSD = etapaDeals.reduce(
        (sum, d) =>
          sum + Number(d.montoOferta || 0) * ((d.probabilidadCierre || 0) / 100),
        0
      );
      const probMedia =
        etapaDeals.length > 0
          ? etapaDeals.reduce((sum, d) => sum + (d.probabilidadCierre || 0), 0) /
            etapaDeals.length
          : ETAPAS_CONFIG[etapaKey].probabilidadDefault;

      acc[etapaKey] = {
        count: etapaDeals.length,
        totalUSD,
        ponderadoUSD,
        probabilidadMedia: Math.round(probMedia),
      };
      return acc;
    },
    {} as PipelineKpis["porEtapa"]
  );

  return {
    totalNegociaciones,
    dealsActivos,
    dealsEstancados,
    volumenTotalNominalUSD,
    volumenPonderadoUSD,
    cierresGanados,
    volumenCerradoUSD,
    tasaConversionPct,
    ticketPromedioUSD,
    comisionEstimadaTotalUSD,
    porEtapa,
  };
}
