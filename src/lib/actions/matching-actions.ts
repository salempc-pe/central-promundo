"use server";

import { getTerrenosAction } from "./terrenos-actions";
import { getClientesAction } from "./pipeline-actions";
import { calcularMatrizCompleta } from "@/lib/services/matching";
import {
  TerrenoCompleto,
  Cliente,
  MatchingMatrixData,
  MatchingKpis,
  MatchingWeights,
  DEFAULT_MATCHING_WEIGHTS,
} from "@/types";

export interface MatchingDataResponse {
  terrenos: TerrenoCompleto[];
  clientes: Cliente[];
  matriz: MatchingMatrixData;
  kpis: MatchingKpis;
}

/**
 * Obtiene todos los terrenos y constructoras reales de PostgreSQL y calcula el matching fiduciario
 */
export async function getMatchingDataAction(
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): Promise<MatchingDataResponse> {
  try {
    const [terrenos, clientes] = await Promise.all([
      getTerrenosAction(),
      getClientesAction(),
    ]);

    const matrixData = calcularMatrizCompleta(terrenos, clientes, weights);

    return {
      terrenos,
      clientes,
      matriz: matrixData,
      kpis: matrixData.kpis,
    };
  } catch (error) {
    console.error("getMatchingDataAction: Error al calcular matching:", error);
    const emptyMatriz: MatchingMatrixData = {
      terrenos: [],
      clientes: [],
      matriz: {},
      kpis: {
        totalTerrenosEvaluados: 0,
        totalConstructorasEvaluadas: 0,
        matchesPrime: 0,
        matchesViables: 0,
        lotesConMatchViable: 0,
        constructorasActivasConMatch: 0,
        volumenPotencialPipelineUSD: 0,
        coberturaInventarioPct: 0,
      },
      timestamp: Date.now(),
    };
    return {
      terrenos: [],
      clientes: [],
      matriz: emptyMatriz,
      kpis: emptyMatriz.kpis,
    };
  }
}
