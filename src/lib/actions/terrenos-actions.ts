"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { terrenos, propietarios, negociaciones, documentosTerreno } from "@/db/schema";
import { eq, desc, or, sql } from "drizzle-orm";
import { validateTerrenoCoordinates } from "@/lib/map/geo-validator";
import { TerrenoCompleto, Propietario } from "@/types";

export interface CreateTerrenoInput {
  codigoInterno: string;
  propietarioId?: string;
  nuevoPropietario?: {
    razonSocialONombre: string;
    tipoDoc?: string;
    numeroDoc?: string;
    telefono?: string;
    email?: string;
    contactoRepresentante?: string;
    notasInternas?: string;
  };
  direccion: string;
  distrito: string;
  referencia?: string | null;
  latitud: number;
  longitud: number;
  areaM2: number;
  frenteLinealM?: number | null;
  fondoPromedioM?: number | null;
  zonificacion: string;
  alturaMaxPisos?: number | null;
  coeficienteEdificacion?: string | null;
  areaLibreMinPct?: string | null;
  usosPermitidos?: string[];
  precioTotal: number;
  precioM2: number;
  moneda?: "USD" | "PEN";
  estadoTerreno?: "Disponible" | "En Negociacion" | "Vendido" | "Inactivo";
}

export interface UpdateTerrenoInput {
  direccion?: string;
  distrito?: string;
  referencia?: string | null;
  latitud?: number;
  longitud?: number;
  areaM2?: number;
  frenteLinealM?: number | null;
  fondoPromedioM?: number | null;
  zonificacion?: string;
  alturaMaxPisos?: number | null;
  coeficienteEdificacion?: string | null;
  areaLibreMinPct?: string | null;
  usosPermitidos?: string[];
  precioTotal?: number;
  precioM2?: number;
  moneda?: "USD" | "PEN";
  estadoTerreno?: "Disponible" | "En Negociacion" | "Vendido" | "Inactivo";
}

/**
 * Server Action para registrar un nuevo lote de suelo en Supabase PostgreSQL + PostGIS
 */
export async function createTerrenoAction(
  input: CreateTerrenoInput
): Promise<{ success: boolean; data?: TerrenoCompleto; error?: string }> {
  try {
    // 1. Validación espacial y territorial estricta
    const geoVal = validateTerrenoCoordinates(input.distrito, input.latitud, input.longitud);
    if (!geoVal.valid) {
      return {
        success: false,
        error: geoVal.error || "Las coordenadas no son válidas para el distrito seleccionado",
      };
    }

    const db = getDb();
    let finalPropId = input.propietarioId;

    // 2. Si se solicitó registrar un nuevo propietario inline o el propId no es un UUID válido
    const isUuid = (str?: string) =>
      str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    if (input.nuevoPropietario && (!finalPropId || !isUuid(finalPropId))) {
      const propUuid = crypto.randomUUID();
      const [nuevoProp] = await db
        .insert(propietarios)
        .values({
          id: propUuid,
          razonSocialONombre: input.nuevoPropietario.razonSocialONombre.trim(),
          tipoDoc: input.nuevoPropietario.tipoDoc || "RUC",
          numeroDoc: input.nuevoPropietario.numeroDoc?.trim() || null,
          telefono: input.nuevoPropietario.telefono?.trim() || null,
          email: input.nuevoPropietario.email?.trim() || null,
          contactoRepresentante: input.nuevoPropietario.contactoRepresentante?.trim() || null,
          notasInternas: input.nuevoPropietario.notasInternas || "Registrado en alta de terreno.",
        })
        .returning();
      finalPropId = nuevoProp.id;
    }

    // Si aún no tenemos propietario válido, asignar el primer propietario registrado
    if (!finalPropId || !isUuid(finalPropId)) {
      const primerProp = await db.query.propietarios.findFirst();
      if (primerProp) {
        finalPropId = primerProp.id;
      } else {
        const propUuid = crypto.randomUUID();
        const [nuevoProp] = await db
          .insert(propietarios)
          .values({
            id: propUuid,
            razonSocialONombre: "Propietario Titular Registrado",
            tipoDoc: "RUC",
            numeroDoc: "20000000001",
          })
          .returning();
        finalPropId = nuevoProp.id;
      }
    }

    // 3. Inserción del lote con PostGIS ST_SetSRID Point
    const terrenoUuid = crypto.randomUUID();
    const latStr = input.latitud.toFixed(7);
    const lngStr = input.longitud.toFixed(7);

    const safePrecioM2 =
      input.precioM2 && !isNaN(input.precioM2) && input.precioM2 > 0
        ? input.precioM2
        : input.areaM2 > 0
        ? input.precioTotal / input.areaM2
        : 0;

    const [nuevoLote] = await db
      .insert(terrenos)
      .values({
        id: terrenoUuid,
        codigoInterno: input.codigoInterno.trim().toUpperCase(),
        propietarioId: finalPropId,
        direccion: input.direccion.trim(),
        distrito: input.distrito,
        referencia: input.referencia?.trim() || null,
        latitud: latStr,
        longitud: lngStr,
        geom: sql`ST_SetSRID(ST_MakePoint(${input.longitud}, ${input.latitud}), 4326)` as any,
        areaM2: input.areaM2.toFixed(2),
        frenteLinealM: input.frenteLinealM ? input.frenteLinealM.toFixed(2) : null,
        fondoPromedioM: input.fondoPromedioM ? input.fondoPromedioM.toFixed(2) : null,
        zonificacion: input.zonificacion,
        alturaMaxPisos: input.alturaMaxPisos || null,
        coeficienteEdificacion: input.coeficienteEdificacion || null,
        areaLibreMinPct: input.areaLibreMinPct || null,
        usosPermitidos: input.usosPermitidos || [],
        precioTotal: input.precioTotal.toFixed(2),
        precioM2: safePrecioM2.toFixed(2),
        moneda: input.moneda || "USD",
        estadoTerreno: input.estadoTerreno || "Disponible",
      })
      .returning();

    // 4. Revalidar caché de Next.js
    revalidatePath("/terrenos");
    revalidatePath("/mapa");
    revalidatePath("/");

    // 5. Cargar registro completo con relaciones
    const resultado = await db.query.terrenos.findFirst({
      where: eq(terrenos.id, nuevoLote.id),
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

    const fullTerreno: TerrenoCompleto = {
      ...resultado!,
      geom: { lat: input.latitud, lng: input.longitud },
      documentos: resultado?.documentos || [],
      negociaciones: (resultado?.negociaciones as any) || [],
    };

    return { success: true, data: fullTerreno };
  } catch (error: any) {
    console.error("createTerrenoAction error:", error);
    if (
      error.message?.includes("terrenos_codigo_interno_uidx") ||
      error.code === "23505" ||
      error.detail?.includes("codigo_interno")
    ) {
      return {
        success: false,
        error: `El código interno '${input.codigoInterno}' ya está registrado en la cartera. Por favor utiliza otro correlativo único.`,
      };
    }
    return {
      success: false,
      error: error.message || "Error al escribir el terreno en la base de datos.",
    };
  }
}

/**
 * Server Action para actualizar un lote de terreno existente en Supabase PostgreSQL
 */
export async function updateTerrenoAction(
  id: string,
  updates: UpdateTerrenoInput
): Promise<{ success: boolean; data?: TerrenoCompleto; error?: string }> {
  try {
    const db = getDb();
    const updatePayload: any = {
      updatedAt: new Date(),
    };

    if (updates.direccion !== undefined) updatePayload.direccion = updates.direccion.trim();
    if (updates.distrito !== undefined) updatePayload.distrito = updates.distrito;
    if (updates.referencia !== undefined) updatePayload.referencia = updates.referencia?.trim() || null;
    if (updates.estadoTerreno !== undefined) updatePayload.estadoTerreno = updates.estadoTerreno;
    if (updates.zonificacion !== undefined) updatePayload.zonificacion = updates.zonificacion;
    if (updates.moneda !== undefined) updatePayload.moneda = updates.moneda;

    if (updates.areaM2 !== undefined) updatePayload.areaM2 = updates.areaM2.toFixed(2);
    if (updates.frenteLinealM !== undefined) {
      updatePayload.frenteLinealM = updates.frenteLinealM ? updates.frenteLinealM.toFixed(2) : null;
    }
    if (updates.fondoPromedioM !== undefined) {
      updatePayload.fondoPromedioM = updates.fondoPromedioM ? updates.fondoPromedioM.toFixed(2) : null;
    }
    if (updates.alturaMaxPisos !== undefined) {
      updatePayload.alturaMaxPisos = updates.alturaMaxPisos || null;
    }
    if (updates.coeficienteEdificacion !== undefined) {
      updatePayload.coeficienteEdificacion = updates.coeficienteEdificacion || null;
    }
    if (updates.areaLibreMinPct !== undefined) {
      updatePayload.areaLibreMinPct = updates.areaLibreMinPct || null;
    }
    if (updates.usosPermitidos !== undefined) {
      updatePayload.usosPermitidos = updates.usosPermitidos;
    }
    if (updates.precioTotal !== undefined) {
      updatePayload.precioTotal = updates.precioTotal.toFixed(2);
    }
    if (updates.precioM2 !== undefined) {
      updatePayload.precioM2 = updates.precioM2.toFixed(2);
    }

    if (updates.latitud !== undefined && updates.longitud !== undefined) {
      // Validar espacialmente si se modificaron coordenadas
      if (updates.distrito) {
        const geoVal = validateTerrenoCoordinates(updates.distrito, updates.latitud, updates.longitud);
        if (!geoVal.valid) {
          return { success: false, error: geoVal.error };
        }
      }
      updatePayload.latitud = updates.latitud.toFixed(7);
      updatePayload.longitud = updates.longitud.toFixed(7);
      updatePayload.geom = sql`ST_SetSRID(ST_MakePoint(${updates.longitud}, ${updates.latitud}), 4326)`;
    }

    await db.update(terrenos).set(updatePayload).where(eq(terrenos.id, id));

    revalidatePath("/terrenos");
    revalidatePath("/mapa");
    revalidatePath("/");

    const actualizado = await db.query.terrenos.findFirst({
      where: eq(terrenos.id, id),
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

    if (!actualizado) {
      return { success: false, error: "Lote no encontrado tras actualizar" };
    }

    const fullTerreno: TerrenoCompleto = {
      ...actualizado,
      geom:
        actualizado.geom && typeof actualizado.geom === "object" && (actualizado.geom as any).lat
          ? (actualizado.geom as any)
          : {
              lat: parseFloat(actualizado.latitud || "0"),
              lng: parseFloat(actualizado.longitud || "0"),
            },
      documentos: actualizado.documentos || [],
      negociaciones: (actualizado.negociaciones as any) || [],
    };

    return { success: true, data: fullTerreno };
  } catch (error: any) {
    console.error("updateTerrenoAction error:", error);
    return {
      success: false,
      error: error.message || "Error al actualizar el terreno en base de datos.",
    };
  }
}

/**
 * Server Action para registrar un nuevo titular/propietario en la base de datos
 */
export async function createPropietarioAction(
  data: Omit<Propietario, "id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; data?: Propietario; error?: string }> {
  try {
    const db = getDb();
    const propUuid = crypto.randomUUID();
    const [nuevo] = await db
      .insert(propietarios)
      .values({
        id: propUuid,
        razonSocialONombre: data.razonSocialONombre.trim(),
        tipoDoc: data.tipoDoc || "RUC",
        numeroDoc: data.numeroDoc?.trim() || null,
        telefono: data.telefono?.trim() || null,
        email: data.email?.trim() || null,
        contactoRepresentante: data.contactoRepresentante?.trim() || null,
        notasInternas: data.notasInternas?.trim() || null,
      })
      .returning();

    revalidatePath("/terrenos");
    return { success: true, data: nuevo as Propietario };
  } catch (error: any) {
    console.error("createPropietarioAction error:", error);
    return {
      success: false,
      error: error.message || "Error al registrar propietario en base de datos.",
    };
  }
}

/**
 * Server Action para consultar el inventario de terrenos desde componentes cliente sin acoplar el driver de base de datos al bundle del navegador
/**
 * Server Action para consultar el inventario de terrenos desde Supabase PostgreSQL
 */
export async function getTerrenosAction(): Promise<TerrenoCompleto[]> {
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

    const list: TerrenoCompleto[] = rows.map((r: any) => ({
      ...r,
      geom:
        r.geom && typeof r.geom === "object" && r.geom.lat
          ? r.geom
          : { lat: parseFloat(r.latitud || "0"), lng: parseFloat(r.longitud || "0") },
      documentos: r.documentos || [],
      negociaciones: r.negociaciones || [],
    }));

    return list;
  } catch (error: any) {
    console.error("getTerrenosAction error:", error);
    return [];
  }
}

/**
 * Server Action para obtener un terreno por su ID o código interno
 */
export async function getTerrenoByIdAction(
  id: string
): Promise<{ success: boolean; data?: TerrenoCompleto | null; error?: string }> {
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

    if (!row) {
      return { success: true, data: null };
    }

    const fullTerreno: TerrenoCompleto = {
      ...row,
      geom:
        row.geom && typeof row.geom === "object" && (row.geom as any).lat
          ? (row.geom as any)
          : { lat: parseFloat(row.latitud || "0"), lng: parseFloat(row.longitud || "0") },
      documentos: row.documentos || [],
      negociaciones: (row.negociaciones as any) || [],
    };

    return { success: true, data: fullTerreno };
  } catch (error: any) {
    console.error("getTerrenoByIdAction error:", error);
    return {
      success: false,
      error: error.message || "Error al obtener terreno por ID.",
    };
  }
}

/**
 * Server Action para eliminar un lote de terreno en Supabase PostgreSQL
 */
export async function deleteTerrenoAction(
  id: string
): Promise<{ success: boolean; error?: string; codigoInterno?: string }> {
  try {
    const db = getDb();

    // 1. Validar existencia del terreno
    const terrenoExistente = await db.query.terrenos.findFirst({
      where: or(eq(terrenos.id, id), eq(terrenos.codigoInterno, id)),
      columns: { id: true, codigoInterno: true },
    });

    if (!terrenoExistente) {
      return { success: false, error: "El activo inmobiliario no existe o ya fue eliminado previamente." };
    }

    const realId = terrenoExistente.id;

    // 2. Pre-flight check de negociaciones (ON DELETE RESTRICT)
    const negociacionesAsociadas = await db
      .select({ id: negociaciones.id })
      .from(negociaciones)
      .where(eq(negociaciones.terrenoId, realId))
      .limit(5);

    if (negociacionesAsociadas.length > 0) {
      return {
        success: false,
        error: `No es posible eliminar el lote ${terrenoExistente.codigoInterno} porque tiene ${negociacionesAsociadas.length} negociación(es) vinculada(s) en el Pipeline Comercial. Por seguridad fiduciaria y trazabilidad de comisiones, descarte o reasigne las operaciones antes de eliminar, o cambie su estado a 'Inactivo'.`,
      };
    }

    // 3. Ejecución transaccional para eliminar el lote
    await db.transaction(async (tx) => {
      await tx.delete(documentosTerreno).where(eq(documentosTerreno.terrenoId, realId));
      await tx.delete(terrenos).where(eq(terrenos.id, realId));
    });

    // 4. Invalidación de Caché Next.js
    revalidatePath("/terrenos");
    revalidatePath("/mapa");
    revalidatePath("/");
    revalidatePath("/pipeline");
    revalidatePath("/documentos");

    return { success: true, codigoInterno: terrenoExistente.codigoInterno };
  } catch (error: any) {
    console.error("deleteTerrenoAction error:", error);
    return {
      success: false,
      error: error.message || "Error al eliminar el activo inmobiliario de la base de datos.",
    };
  }
}

