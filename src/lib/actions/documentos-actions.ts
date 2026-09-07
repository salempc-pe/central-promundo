"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { documentosTerreno, terrenos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  DocumentoConTerreno,
  DocumentoFiltros,
  DocumentosKpis,
  EstadoVigencia,
  UploadDocumentoInput,
} from "@/types/documentos";
import { calculateVigencia } from "@/lib/services/documentos";

/**
 * Obtiene los documentos fiduciarios de PostgreSQL vinculados a sus terrenos
 */
export async function getDocumentosAction(
  filtros?: DocumentoFiltros
): Promise<DocumentoConTerreno[]> {
  try {
    const db = getDb();
    const rows = await db.query.documentosTerreno.findMany({
      with: {
        terreno: {
          with: {
            propietario: true,
          },
        },
      },
      orderBy: [desc(documentosTerreno.createdAt)],
    });

    let result: DocumentoConTerreno[] = rows.map((doc) => {
      const { estadoVigencia, diasParaVencer } = calculateVigencia(doc.fechaVencimiento);

      return {
        id: doc.id,
        terrenoId: doc.terrenoId,
        tipoDocumento: doc.tipoDocumento,
        nombreArchivo: doc.nombreArchivo,
        archivoUrl: doc.archivoUrl,
        fechaVencimiento: doc.fechaVencimiento,
        esConfidencial: doc.esConfidencial,
        createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
        diasParaVencer,
        estadoVigencia,
        terreno: {
          id: doc.terreno?.id || doc.terrenoId,
          codigoInterno: doc.terreno?.codigoInterno || "TR-LIMA-000",
          distrito: doc.terreno?.distrito || "Lima",
          direccion: doc.terreno?.direccion || "Dirección no registrada",
          zonificacion: doc.terreno?.zonificacion || "RDA",
          alturaMaxPisos: doc.terreno?.alturaMaxPisos ?? null,
          areaM2: doc.terreno?.areaM2 || "0",
          moneda: (doc.terreno?.moneda as "USD" | "PEN") || "USD",
          precioTotal: doc.terreno?.precioTotal || "0",
          precioM2: doc.terreno?.precioM2 || "0",
          propietarioNombre: doc.terreno?.propietario?.razonSocialONombre || "Titular no especificado",
        },
      };
    });

    if (!filtros) return result;

    if (filtros.busqueda && filtros.busqueda.trim()) {
      const q = filtros.busqueda.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.nombreArchivo.toLowerCase().includes(q) ||
          d.terreno.codigoInterno.toLowerCase().includes(q) ||
          d.terreno.distrito.toLowerCase().includes(q) ||
          d.terreno.direccion.toLowerCase().includes(q)
      );
    }

    if (filtros.terrenoId) {
      result = result.filter((d) => d.terrenoId === filtros.terrenoId);
    }

    if (filtros.distrito && filtros.distrito.length > 0) {
      result = result.filter((d) => filtros.distrito!.includes(d.terreno.distrito));
    }

    if (filtros.tipoDocumento && filtros.tipoDocumento.length > 0) {
      result = result.filter((d) => filtros.tipoDocumento!.includes(d.tipoDocumento));
    }

    if (filtros.estadoVigencia && filtros.estadoVigencia.length > 0) {
      result = result.filter((d) => filtros.estadoVigencia!.includes(d.estadoVigencia));
    }

    if (filtros.esConfidencial !== undefined && filtros.esConfidencial !== null) {
      result = result.filter((d) => d.esConfidencial === filtros.esConfidencial);
    }

    return result;
  } catch (error) {
    console.error("getDocumentosAction: Error al consultar documentos en PostgreSQL:", error);
    return [];
  }
}

/**
 * Obtiene métricas agregadas de gestión documental directamente desde PostgreSQL
 */
export async function getDocumentoStatsAction(): Promise<DocumentosKpis> {
  try {
    const db = getDb();
    const [docs, allTerrenos] = await Promise.all([
      db.select().from(documentosTerreno),
      db.select({ id: terrenos.id }).from(terrenos),
    ]);

    let totalCpus = 0;
    let cpusVigentes = 0;
    let cpusPorVencer = 0;
    let cpusVencidos = 0;
    let documentosConfidenciales = 0;
    const terrenosConCpu = new Set<string>();

    docs.forEach((doc) => {
      if (doc.esConfidencial) documentosConfidenciales++;

      if (doc.tipoDocumento === "Certificado_Parametros") {
        totalCpus++;
        terrenosConCpu.add(doc.terrenoId);
        const { estadoVigencia } = calculateVigencia(doc.fechaVencimiento);
        if (estadoVigencia === "vigente") cpusVigentes++;
        else if (estadoVigencia === "por_vencer") cpusPorVencer++;
        else if (estadoVigencia === "vencido") cpusVencidos++;
      }
    });

    const totalTerrenos = allTerrenos.length;
    const terrenosSinCpu = Math.max(0, totalTerrenos - terrenosConCpu.size);

    return {
      totalDocumentos: docs.length,
      totalCpus,
      cpusVigentes,
      cpusPorVencer,
      cpusVencidos,
      terrenosSinCpu,
      documentosConfidenciales,
      espacioUtilizadoBytes: docs.length * 2500000,
    };
  } catch (error) {
    console.error("getDocumentoStatsAction: Error al calcular KPIs de documentos:", error);
    return {
      totalDocumentos: 0,
      totalCpus: 0,
      cpusVigentes: 0,
      cpusPorVencer: 0,
      cpusVencidos: 0,
      terrenosSinCpu: 0,
      documentosConfidenciales: 0,
      espacioUtilizadoBytes: 0,
    };
  }
}

/**
 * Sube o registra un nuevo documento fiduciario vinculado a un terreno en PostgreSQL
 */
export async function createDocumentoAction(
  input: UploadDocumentoInput
): Promise<{ success: boolean; data?: DocumentoConTerreno; error?: string }> {
  try {
    const db = getDb();
    const docId = crypto.randomUUID();

    const [inserted] = await db
      .insert(documentosTerreno)
      .values({
        id: docId,
        terrenoId: input.terrenoId,
        tipoDocumento: input.tipoDocumento,
        nombreArchivo: input.nombreArchivo.trim(),
        archivoUrl: input.archivoUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fechaVencimiento: input.fechaVencimiento || null,
        esConfidencial: input.esConfidencial ?? false,
      })
      .returning();

    revalidatePath("/documentos");
    revalidatePath("/terrenos");
    revalidatePath("/matching");
    revalidatePath("/");

    const [docConTerreno] = await getDocumentosAction({ busqueda: inserted.nombreArchivo });
    return { success: true, data: docConTerreno };
  } catch (error: any) {
    console.error("createDocumentoAction: Error al insertar documento en PostgreSQL:", error);
    return { success: false, error: error?.message || "No se pudo registrar el documento en la base de datos." };
  }
}

/**
 * Elimina un documento fiduciario de la base de datos
 */
export async function deleteDocumentoAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    await db.delete(documentosTerreno).where(eq(documentosTerreno.id, id));

    revalidatePath("/documentos");
    revalidatePath("/terrenos");
    revalidatePath("/matching");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("deleteDocumentoAction: Error al eliminar documento en PostgreSQL:", error);
    return { success: false, error: error?.message || "No se pudo eliminar el documento." };
  }
}

/**
 * Alterna el estado de confidencialidad de un documento fiduciario en PostgreSQL
 */
export async function toggleConfidencialAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    const [doc] = await db
      .select({ esConfidencial: documentosTerreno.esConfidencial })
      .from(documentosTerreno)
      .where(eq(documentosTerreno.id, id));

    if (!doc) {
      return { success: false, error: "Documento no encontrado." };
    }

    await db
      .update(documentosTerreno)
      .set({ esConfidencial: !doc.esConfidencial })
      .where(eq(documentosTerreno.id, id));

    revalidatePath("/documentos");
    revalidatePath("/terrenos");
    return { success: true };
  } catch (error: any) {
    console.error("toggleConfidencialAction: Error al alternar confidencialidad en PostgreSQL:", error);
    return { success: false, error: error?.message || "Error al actualizar confidencialidad." };
  }
}
