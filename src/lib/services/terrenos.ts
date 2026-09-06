import { TerrenoCompleto, TerrenoFiltros, ClientMatchResult, Propietario } from "@/types";
import { mockTerrenosCompletos, mockPropietarios } from "@/lib/mock/terrenos-seed";
import { calcularMatchingTerreno } from "./matching";

let memoryTerrenos: TerrenoCompleto[] = [...mockTerrenosCompletos];
let memoryPropietarios: Propietario[] = [...mockPropietarios];

/**
 * Consulta y filtra el inventario de terrenos en memoria / DB
 */
export async function getTerrenos(filtros?: TerrenoFiltros): Promise<TerrenoCompleto[]> {
  let list = [...memoryTerrenos];

  if (!filtros) return list;

  // 1. Búsqueda libre
  if (filtros.busqueda && filtros.busqueda.trim() !== "") {
    const q = filtros.busqueda.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.codigoInterno.toLowerCase().includes(q) ||
        t.distrito.toLowerCase().includes(q) ||
        t.direccion.toLowerCase().includes(q) ||
        t.propietario.razonSocialONombre.toLowerCase().includes(q)
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
      t.documentos.some((d) => d.tipoDocumento === "Certificado_Parametros")
    );
  }

  return list;
}

export async function getTerrenoById(id: string): Promise<TerrenoCompleto | null> {
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
