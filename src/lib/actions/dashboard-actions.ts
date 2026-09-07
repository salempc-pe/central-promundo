"use server";

import { getDb } from "@/db";
import { terrenos, negociaciones, documentosTerreno, clientes } from "@/db/schema";
import { sql, ne, and, gte, lte, eq } from "drizzle-orm";
import { getTerrenosAction } from "./terrenos-actions";
import { getClientesAction } from "./pipeline-actions";
import { evaluarMatch } from "@/lib/services/matching";
import { calculateVigencia } from "@/lib/services/documentos";

export interface DashboardKpis {
  lotesEnCartera: number;
  lotesNuevosEsteMes: number;
  areaTotalM2: number;
  areaTotalHectareas: number;
  pipelineMontoUSD: number;
  pipelineDealsActivos: number;
  constructorasTotal: number;
  documentosPorVencer: number;
}

export interface TerrenoDestacadoDashboard {
  codigo: string;
  distrito: string;
  direccion: string;
  zonificacion: string;
  areaM2: number;
  frenteM: number | null;
  alturaMax: number | null;
  precioTotal: number;
  precioM2: number;
  moneda: "USD" | "PEN";
  estado: "Disponible" | "En Negociacion" | "Vendido" | "Inactivo";
  tieneParametros: boolean;
  vencimientoParametros: string | null;
  matchingCount: number;
}

/**
 * Obtiene los KPIs agregados reales de PostgreSQL para el Dashboard
 */
export async function getDashboardKpisAction(): Promise<DashboardKpis> {
  try {
    const db = getDb();

    // 1. Estadísticas de terrenos activos
    const [statsTerrenos] = await db
      .select({
        totalLotes: sql<number>`count(*)::int`,
        areaTotal: sql<string>`coalesce(sum(${terrenos.areaM2}), 0)`,
      })
      .from(terrenos)
      .where(ne(terrenos.estadoTerreno, "Inactivo"));

    // Lotes nuevos este mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [nuevosMes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(terrenos)
      .where(gte(terrenos.createdAt, startOfMonth));

    // 2. Estadísticas de Pipeline activo
    const [statsPipeline] = await db
      .select({
        montoTotal: sql<string>`coalesce(sum(${negociaciones.montoOferta}), 0)`,
        totalDeals: sql<number>`count(*)::int`,
      })
      .from(negociaciones)
      .where(
        and(
          ne(negociaciones.etapa, "Cierre_Ganado"),
          ne(negociaciones.etapa, "Descartado")
        )
      );

    // 3. Constructoras / Clientes
    const [statsClientes] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(clientes);

    // 4. Certificados de parámetros por vencer (< 30 días)
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(en30Dias.getDate() + 30);

    const [statsDocs] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(documentosTerreno)
      .where(
        and(
          eq(documentosTerreno.tipoDocumento, "Certificado_Parametros"),
          gte(documentosTerreno.fechaVencimiento, hoy.toISOString().split("T")[0]),
          lte(documentosTerreno.fechaVencimiento, en30Dias.toISOString().split("T")[0])
        )
      );

    const areaTotal = Number(statsTerrenos?.areaTotal || 0);

    return {
      lotesEnCartera: statsTerrenos?.totalLotes || 0,
      lotesNuevosEsteMes: nuevosMes?.count || 0,
      areaTotalM2: areaTotal,
      areaTotalHectareas: Math.round((areaTotal / 10000) * 100) / 100,
      pipelineMontoUSD: Number(statsPipeline?.montoTotal || 0),
      pipelineDealsActivos: statsPipeline?.totalDeals || 0,
      constructorasTotal: statsClientes?.total || 0,
      documentosPorVencer: statsDocs?.count || 0,
    };
  } catch (error) {
    console.error("getDashboardKpisAction: Error al calcular KPIs del dashboard:", error);
    return {
      lotesEnCartera: 0,
      lotesNuevosEsteMes: 0,
      areaTotalM2: 0,
      areaTotalHectareas: 0,
      pipelineMontoUSD: 0,
      pipelineDealsActivos: 0,
      constructorasTotal: 0,
      documentosPorVencer: 0,
    };
  }
}

/**
 * Obtiene los últimos terrenos dados de alta con cruce de CPU y matching real
 */
export async function getRecentTerrenosAction(limit: number = 5): Promise<TerrenoDestacadoDashboard[]> {
  try {
    const [allTerrenos, allClientes] = await Promise.all([
      getTerrenosAction(),
      getClientesAction(),
    ]);

    const sorted = [...allTerrenos]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return sorted.map((t) => {
      // Buscar documento CPU
      const cpuDoc = t.documentos?.find(
        (d) => d.tipoDocumento === "Certificado_Parametros"
      );

      // Calcular cantidad de matches óptimos o compatibles con constructoras
      let matches = 0;
      allClientes.forEach((cli) => {
        const evalRes = evaluarMatch(t, cli);
        if (evalRes.scoreMatch >= 65) matches++;
      });

      return {
        codigo: t.codigoInterno,
        distrito: t.distrito,
        direccion: t.direccion,
        zonificacion: t.zonificacion,
        areaM2: Number(t.areaM2),
        frenteM: t.frenteLinealM ? Number(t.frenteLinealM) : null,
        alturaMax: t.alturaMaxPisos,
        precioTotal: Number(t.precioTotal),
        precioM2: Number(t.precioM2),
        moneda: t.moneda as "USD" | "PEN",
        estado: t.estadoTerreno as any,
        tieneParametros: !!cpuDoc,
        vencimientoParametros: cpuDoc?.fechaVencimiento
          ? String(cpuDoc.fechaVencimiento).split("T")[0]
          : null,
        matchingCount: matches,
      };
    });
  } catch (error) {
    console.error("getRecentTerrenosAction: Error al obtener terrenos recientes:", error);
    return [];
  }
}
