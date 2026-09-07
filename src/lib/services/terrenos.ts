import { TerrenoCompleto, TerrenoFiltros, ClientMatchResult, Propietario } from "@/types";
import { calcularMatchingTerreno } from "./matching";
import { getDb } from "@/db";
import { terrenos, propietarios } from "@/db/schema";
import { desc, eq, or } from "drizzle-orm";

let memoryTerrenos: TerrenoCompleto[] = [];
let memoryPropietarios: Propietario[] = [];

/**
 * Filtra el listado de terrenos según los criterios de búsqueda y filtros acumulativos
 */
function aplicarFiltros(lista: TerrenoCompleto[], filtros?: TerrenoFiltros): TerrenoCompleto[] {
  let list = [...lista];

  if (!filtros) return list;

  // 1. Búsqueda libre
  if (filtros.busqueda && filtros.busqueda.trim() !== "") {
    const q = filtros.busqueda.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.codigoInterno.toLowerCase().includes(q) ||
        t.distrito.toLowerCase().includes(q) ||
        t.direccion.toLowerCase().includes(q) ||
        t.propietario?.razonSocialONombre?.toLowerCase().includes(q)
    );
  }

  // 2. Distrito (multi-select)
  if (filtros.distrito && filtros.distrito.length > 0) {
    const distritosLower = filtros.distrito.map((d) => d.toLowerCase());
    list = list.filter((t) => distritosLower.includes(t.distrito.toLowerCase()));
  }

  // 3. Zonificación (multi-select)
  if (filtros.zonificacion && filtros.zonificacion.length > 0) {
    list = list.filter((t) => filtros.zonificacion!.includes(t.zonificacion));
  }

  // 4. Área m2 (Min y Max)
  if (filtros.areaMin !== undefined && filtros.areaMin > 0) {
    list = list.filter((t) => Number(t.areaM2) >= filtros.areaMin!);
  }
  if (filtros.areaMax !== undefined && filtros.areaMax > 0) {
    list = list.filter((t) => Number(t.areaM2) <= filtros.areaMax!);
  }

  // 5. Precio m2 Max
  if (filtros.precioM2Max !== undefined && filtros.precioM2Max > 0) {
    list = list.filter((t) => Number(t.precioM2) <= filtros.precioM2Max!);
  }

  // 6. Precio Total Max
  if (filtros.precioTotalMax !== undefined && filtros.precioTotalMax > 0) {
    list = list.filter((t) => Number(t.precioTotal) <= filtros.precioTotalMax!);
  }

  // 7. Altura Mínima
  if (filtros.alturaMinPisos !== undefined && filtros.alturaMinPisos > 0) {
    list = list.filter((t) => (t.alturaMaxPisos || 0) >= filtros.alturaMinPisos!);
  }

  // 8. Frente Lineal Mínimo
  if (filtros.frenteLinealMin !== undefined && filtros.frenteLinealMin > 0) {
    list = list.filter((t) => Number(t.frenteLinealM || 0) >= filtros.frenteLinealMin!);
  }

  // 9. Estado comercial
  if (filtros.estado && filtros.estado.length > 0) {
    list = list.filter((t) => filtros.estado!.includes(t.estadoTerreno as any));
  }

  // 10. Certificado de Parámetros
  if (filtros.soloConCertificadoParametros) {
    list = list.filter((t) =>
      t.documentos?.some((d) => d.tipoDocumento === "Certificado_Parametros")
    );
  }

  return list;
}

/**
 * Consulta y filtra el inventario de terrenos desde Supabase PostgreSQL con fallback a memoria
 */
export async function getTerrenos(filtros?: TerrenoFiltros): Promise<TerrenoCompleto[]> {
  try {
    const db = getDb();
    const rows = await db.query.terrenos.findMany({
      with: {
        propietario: true,
        documentos: true,
        negociaciones: {
          with: {
            cliente: true,
            broker: true,
          },
        },
      },
      orderBy: [desc(terrenos.createdAt)],
    });

    if (rows && rows.length > 0) {
      const list = rows.map((r: any) => ({
        ...r,
        geom:
          r.geom && typeof r.geom === "object" && r.geom.lat
            ? r.geom
            : { lat: parseFloat(r.latitud || "0"), lng: parseFloat(r.longitud || "0") },
        documentos: r.documentos || [],
        negociaciones: r.negociaciones || [],
      })) as TerrenoCompleto[];

      // Sincronizar memoria para respaldo
      memoryTerrenos = list;
      return aplicarFiltros(list, filtros);
    }
  } catch (error) {
    console.warn("getTerrenos: Usando fallback en memoria por excepción en DB:", error);
  }

  return aplicarFiltros(memoryTerrenos, filtros);
}

export async function getTerrenoById(id: string): Promise<TerrenoCompleto | null> {
  try {
    const db = getDb();
    const row = await db.query.terrenos.findFirst({
      where: or(eq(terrenos.id, id), eq(terrenos.codigoInterno, id)),
      with: {
        propietario: true,
        documentos: true,
        negociaciones: {
          with: {
            cliente: true,
            broker: true,
          },
        },
      },
    });

    if (row) {
      return {
        ...row,
        geom:
          row.geom && typeof row.geom === "object" && (row.geom as any).lat
            ? (row.geom as any)
            : { lat: parseFloat(row.latitud || "0"), lng: parseFloat(row.longitud || "0") },
        documentos: row.documentos || [],
        negociaciones: (row.negociaciones as any) || [],
      } as TerrenoCompleto;
    }
  } catch (error) {
    console.warn("getTerrenoById: Usando fallback en memoria:", error);
  }

  const found = memoryTerrenos.find((t) => t.id === id || t.codigoInterno === id);
  return found || null;
}

export async function getMatchingForTerreno(terreno: TerrenoCompleto): Promise<ClientMatchResult[]> {
  return calcularMatchingTerreno(terreno);
}

export async function updateTerrenoEnMemoria(
  id: string,
  updates: Partial<TerrenoCompleto>
): Promise<TerrenoCompleto | null> {
  const index = memoryTerrenos.findIndex((t) => t.id === id);
  if (index === -1) return null;

  memoryTerrenos[index] = {
    ...memoryTerrenos[index],
    ...updates,
    updatedAt: new Date(),
  };

  return memoryTerrenos[index];
}

export async function getPropietarios(): Promise<Propietario[]> {
  try {
    const db = getDb();
    const rows = await db.query.propietarios.findMany({
      orderBy: [desc(propietarios.createdAt)],
    });

    if (rows && rows.length > 0) {
      memoryPropietarios = rows as Propietario[];
      return rows as Propietario[];
    }
  } catch (error) {
    console.warn("getPropietarios: Usando fallback en memoria:", error);
  }

  return [...memoryPropietarios];
}

export async function createPropietarioEnMemoria(
  data: Omit<Propietario, "id" | "createdAt" | "updatedAt">
): Promise<Propietario> {
  const nuevo: Propietario = {
    ...data,
    id: `prop-${Date.now().toString(36)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryPropietarios.unshift(nuevo);
  return nuevo;
}

export async function createTerrenoEnMemoria(
  data: Omit<TerrenoCompleto, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<TerrenoCompleto> {
  const now = new Date();
  const id = data.id || `tr-${Date.now().toString(36)}`;
  const nuevo: TerrenoCompleto = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
    documentos: data.documentos || [],
    negociaciones: data.negociaciones || [],
  };

  memoryTerrenos.unshift(nuevo);
  return nuevo;
}

export async function deleteTerrenoEnMemoria(id: string): Promise<boolean> {
  const initialLen = memoryTerrenos.length;
  memoryTerrenos = memoryTerrenos.filter((t) => t.id !== id && t.codigoInterno !== id);
  return memoryTerrenos.length < initialLen;
}

