"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import {
  usuarios,
  clientes,
  negociaciones,
  bitacoraNegociacion,
  terrenos,
  comisionesCierres,
} from "@/db/schema";
import { eq, and, asc, desc, isNotNull } from "drizzle-orm";
import {
  Usuario,
  Cliente,
  NegociacionCompleta,
  NegociacionFiltros,
  CreateNegociacionInput,
  UpdateEtapaNegociacionInput,
  AddBitacoraEventoInput,
  TerrenoCompleto,
  BitacoraConUsuario,
} from "@/types";
import { getUsuariosSolicitudes } from "@/lib/services/auth-service";

/**
 * Obtiene la lista de usuarios reales habilitados como brokers responsables
 * (aquellos con estadoAcceso = 'aprobado', activo = true y registrados con su cuenta de Google/Gmail: authId no nulo)
 */
export async function getBrokersAction(): Promise<Usuario[]> {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(usuarios)
      .where(
        and(
          eq(usuarios.estadoAcceso, "aprobado"),
          eq(usuarios.activo, true),
          isNotNull(usuarios.authId)
        )
      )
      .orderBy(asc(usuarios.nombre));

    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        authId: r.authId,
        nombre: r.nombre,
        email: r.email,
        avatarUrl: r.avatarUrl,
        rol: r.rol,
        estadoAcceso: r.estadoAcceso,
        fechaSolicitud: r.fechaSolicitud ? new Date(r.fechaSolicitud) : new Date(),
        fechaResolucion: r.fechaResolucion ? new Date(r.fechaResolucion) : null,
        resueltoPor: r.resueltoPor,
        notas: r.notas,
        activo: r.activo,
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      })) as Usuario[];
    }
  } catch (error) {
    console.warn("getBrokersAction: Error al consultar usuarios en PostgreSQL:", error);
  }

  // Fallback seguro usando auth-service (solo usuarios con cuenta Google OAuth registrada)
  const solicitudes = await getUsuariosSolicitudes();
  const aprobados = solicitudes.filter(
    (u) => u.estadoAcceso === "aprobado" && u.activo === true && Boolean(u.authId)
  );

  return aprobados.map((u) => ({
    id: u.id,
    authId: u.authId || null,
    nombre: u.nombre,
    email: u.email,
    avatarUrl: u.avatarUrl || null,
    rol: u.rol,
    estadoAcceso: u.estadoAcceso,
    fechaSolicitud: new Date(u.fechaSolicitud),
    fechaResolucion: u.fechaResolucion ? new Date(u.fechaResolucion) : null,
    resueltoPor: u.resueltoPor || null,
    notas: u.notas || null,
    activo: u.activo,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
  })) as Usuario[];
}

/**
 * Obtiene la lista de clientes (constructoras e inversionistas) reales de PostgreSQL
 */
export async function getClientesAction(): Promise<Cliente[]> {
  try {
    const db = getDb();
    const rows = await db.select().from(clientes).orderBy(asc(clientes.razonSocial));
    return rows.map((c) => ({
      ...c,
      createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
      updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    })) as Cliente[];
  } catch (error) {
    console.error("getClientesAction: Error al consultar clientes en PostgreSQL:", error);
    return [];
  }
}

/**
 * Obtiene todas las negociaciones del Pipeline con sus relaciones fiduciarias completas
 */
export async function getNegociacionesAction(
  filtros?: NegociacionFiltros
): Promise<NegociacionCompleta[]> {
  try {
    const db = getDb();
    const rows = await db.query.negociaciones.findMany({
      with: {
        terreno: {
          with: {
            propietario: true,
            documentos: true,
          },
        },
        cliente: true,
        broker: true,
        bitacoras: {
          with: {
            usuario: true,
          },
          orderBy: [desc(bitacoraNegociacion.createdAt)],
        },
        comision: true,
      },
      orderBy: [desc(negociaciones.updatedAt)],
    });

    const now = new Date().getTime();

    let result: NegociacionCompleta[] = rows.map((n) => {
      const createdAtDate = n.createdAt ? new Date(n.createdAt) : new Date();
      const updatedAtDate = n.updatedAt ? new Date(n.updatedAt) : new Date();

      // Último evento para días en etapa actual
      const ultimaBitacora = n.bitacoras && n.bitacoras.length > 0 ? n.bitacoras[0] : null;
      const refTime = ultimaBitacora?.createdAt
        ? new Date(ultimaBitacora.createdAt).getTime()
        : updatedAtDate.getTime();

      const diasEnEtapa = Math.max(0, Math.floor((now - refTime) / (1000 * 60 * 60 * 24)));
      const diasTotales = Math.max(0, Math.floor((now - createdAtDate.getTime()) / (1000 * 60 * 60 * 24)));
      const montoNum = Number(n.montoOferta || 0);
      const comisionEstimada = Math.round(montoNum * 0.03 * 100) / 100;

      const formattedBitacora: BitacoraConUsuario[] = (n.bitacoras || []).map((b) => ({
        id: b.id,
        negociacionId: b.negociacionId,
        usuarioId: b.usuarioId,
        tipoEvento: b.tipoEvento,
        descripcion: b.descripcion,
        archivoAdjuntoUrl: b.archivoAdjuntoUrl,
        createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
        usuario: {
          id: b.usuario?.id || b.usuarioId,
          nombre: b.usuario?.nombre || "Usuario del Sistema",
          email: b.usuario?.email || "",
          rol: b.usuario?.rol || "broker_senior",
        },
      }));

      return {
        id: n.id,
        terrenoId: n.terrenoId,
        clienteId: n.clienteId,
        brokerId: n.brokerId,
        etapa: n.etapa,
        montoOferta: n.montoOferta,
        probabilidadCierre: n.probabilidadCierre,
        createdAt: createdAtDate,
        updatedAt: updatedAtDate,
        diasEnEtapaActual: diasEnEtapa,
        diasTotales: diasTotales,
        comisionEstimadaUSD: comisionEstimada,
        terreno: {
          ...n.terreno,
          documentos: n.terreno?.documentos || [],
        } as unknown as TerrenoCompleto,
        cliente: n.cliente as Cliente,
        broker: n.broker as Usuario,
        bitacora: formattedBitacora,
      };
    });

    if (!filtros) return result;

    // Filtros en memoria sobre el dataset devuelto
    if (filtros.busqueda && filtros.busqueda.trim()) {
      const q = filtros.busqueda.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.id.toLowerCase().includes(q) ||
          n.terreno?.codigoInterno?.toLowerCase().includes(q) ||
          n.terreno?.distrito?.toLowerCase().includes(q) ||
          n.terreno?.direccion?.toLowerCase().includes(q) ||
          n.cliente?.razonSocial?.toLowerCase().includes(q) ||
          n.broker?.nombre?.toLowerCase().includes(q)
      );
    }

    if (filtros.etapa && filtros.etapa.length > 0) {
      result = result.filter((n) => filtros.etapa!.includes(n.etapa));
    }

    if (filtros.brokerId && filtros.brokerId.length > 0) {
      result = result.filter((n) => filtros.brokerId!.includes(n.brokerId));
    }

    if (filtros.clienteId && filtros.clienteId.length > 0) {
      result = result.filter((n) => filtros.clienteId!.includes(n.clienteId));
    }

    if (filtros.distrito && filtros.distrito.length > 0) {
      result = result.filter((n) => filtros.distrito!.includes(n.terreno?.distrito));
    }

    if (filtros.soloEstancados) {
      result = result.filter((n) => n.diasEnEtapaActual > 14);
    }

    if (filtros.montoMin !== undefined) {
      result = result.filter((n) => Number(n.montoOferta || 0) >= filtros.montoMin!);
    }

    if (filtros.montoMax !== undefined) {
      result = result.filter((n) => Number(n.montoOferta || 0) <= filtros.montoMax!);
    }

    return result;
  } catch (error) {
    console.error("getNegociacionesAction: Error al consultar negociaciones en PostgreSQL:", error);
    return [];
  }
}

/**
 * Crea una nueva negociación en PostgreSQL y registra su evento inicial de bitácora
 */
export async function createNegociacionAction(
  input: CreateNegociacionInput
): Promise<{ success: boolean; data?: NegociacionCompleta; error?: string }> {
  try {
    const db = getDb();
    const dealId = crypto.randomUUID();
    const bitacoraId = crypto.randomUUID();

    const montoStr = typeof input.montoOferta === "number"
      ? input.montoOferta.toFixed(2)
      : String(input.montoOferta);

    // 1. Insertar negociación
    await db.insert(negociaciones).values({
      id: dealId,
      terrenoId: input.terrenoId,
      clienteId: input.clienteId,
      brokerId: input.brokerId,
      etapa: input.etapaInicial || "Ficha_Enviada",
      montoOferta: montoStr,
      probabilidadCierre: input.probabilidadCierre ?? 10,
    });

    // 2. Insertar primer evento en bitácora
    await db.insert(bitacoraNegociacion).values({
      id: bitacoraId,
      negociacionId: dealId,
      usuarioId: input.brokerId,
      tipoEvento: "Nota",
      descripcion: input.notaInicial?.trim() || "Alta de oportunidad comercial en el sistema.",
    });

    // 3. Si el terreno estaba Disponible, ponerlo En Negociación
    await db
      .update(terrenos)
      .set({ estadoTerreno: "En Negociacion", updatedAt: new Date() })
      .where(and(eq(terrenos.id, input.terrenoId), eq(terrenos.estadoTerreno, "Disponible")));

    revalidatePath("/pipeline");
    revalidatePath("/");
    revalidatePath("/matching");
    revalidatePath("/terrenos");

    const [created] = await getNegociacionesAction({ busqueda: dealId });
    return { success: true, data: created };
  } catch (error: any) {
    console.error("createNegociacionAction: Error al crear negociación en PostgreSQL:", error);
    return { success: false, error: error?.message || "No se pudo registrar la negociación en la base de datos." };
  }
}

/**
 * Actualiza la etapa de una negociación, inserta bitácora y sincroniza con comisiones si es Cierre Ganado
 */
export async function updateEtapaNegociacionAction(
  input: UpdateEtapaNegociacionInput
): Promise<{ success: boolean; data?: NegociacionCompleta; error?: string }> {
  try {
    const db = getDb();
    const updateData: Record<string, any> = {
      etapa: input.nuevaEtapa,
      updatedAt: new Date(),
    };

    if (input.montoOferta !== undefined) {
      updateData.montoOferta = typeof input.montoOferta === "number"
        ? input.montoOferta.toFixed(2)
        : String(input.montoOferta);
    }

    if (input.probabilidadCierre !== undefined) {
      updateData.probabilidadCierre = input.probabilidadCierre;
    }

    // 1. Actualizar negociación
    await db.update(negociaciones).set(updateData).where(eq(negociaciones.id, input.id));

    // 2. Registrar evento en bitácora
    const bitacoraId = crypto.randomUUID();
    await db.insert(bitacoraNegociacion).values({
      id: bitacoraId,
      negociacionId: input.id,
      usuarioId: input.usuarioId,
      tipoEvento: input.tipoEvento,
      descripcion: input.notaBitacora?.trim() || `Transición a etapa ${input.nuevaEtapa}.`,
      archivoAdjuntoUrl: input.archivoAdjuntoUrl || null,
    });

    // 3. Si la nueva etapa es Cierre_Ganado
    if (input.nuevaEtapa === "Cierre_Ganado") {
      const [dealRow] = await db.select().from(negociaciones).where(eq(negociaciones.id, input.id));
      if (dealRow) {
        // Actualizar terreno a Vendido
        await db.update(terrenos).set({ estadoTerreno: "Vendido", updatedAt: new Date() }).where(eq(terrenos.id, dealRow.terrenoId));

        // Crear o actualizar comisiones_cierres
        const montoFinal = Number(dealRow.montoOferta || 0);
        const pctComision = 3.0;
        const totalComision = (montoFinal * pctComision) / 100;
        const comBroker = totalComision * 0.45;
        const comEmpresa = totalComision * 0.55;

        await db.insert(comisionesCierres).values({
          id: crypto.randomUUID(),
          negociacionId: input.id,
          montoVentaFinal: montoFinal.toFixed(2),
          pctComision: pctComision.toFixed(2),
          montoComisionTotal: totalComision.toFixed(2),
          comisionBroker: comBroker.toFixed(2),
          comisionEmpresa: comEmpresa.toFixed(2),
          estadoPago: "Pendiente",
        }).onConflictDoUpdate({
          target: comisionesCierres.negociacionId,
          set: {
            montoVentaFinal: montoFinal.toFixed(2),
            montoComisionTotal: totalComision.toFixed(2),
            comisionBroker: comBroker.toFixed(2),
            comisionEmpresa: comEmpresa.toFixed(2),
            updatedAt: new Date(),
          }
        });
      }
    }

    revalidatePath("/pipeline");
    revalidatePath("/comisiones");
    revalidatePath("/terrenos");
    revalidatePath("/");

    const [updated] = await getNegociacionesAction({ busqueda: input.id });
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("updateEtapaNegociacionAction: Error al actualizar etapa en PostgreSQL:", error);
    return { success: false, error: error?.message || "No se pudo actualizar la etapa de la negociación." };
  }
}

/**
 * Añade un evento fiduciario a la bitácora de auditoría de una negociación
 */
export async function addBitacoraEventoAction(
  input: AddBitacoraEventoInput
): Promise<{ success: boolean; data?: BitacoraConUsuario; error?: string }> {
  try {
    const db = getDb();
    const bitacoraId = crypto.randomUUID();

    const [inserted] = await db
      .insert(bitacoraNegociacion)
      .values({
        id: bitacoraId,
        negociacionId: input.negociacionId,
        usuarioId: input.usuarioId,
        tipoEvento: input.tipoEvento,
        descripcion: input.descripcion.trim(),
        archivoAdjuntoUrl: input.archivoAdjuntoUrl || null,
      })
      .returning();

    // Actualizar updated_at de la negociación
    await db
      .update(negociaciones)
      .set({ updatedAt: new Date() })
      .where(eq(negociaciones.id, input.negociacionId));

    const [userRow] = await db
      .select({ id: usuarios.id, nombre: usuarios.nombre, email: usuarios.email, rol: usuarios.rol })
      .from(usuarios)
      .where(eq(usuarios.id, input.usuarioId));

    revalidatePath("/pipeline");

    return {
      success: true,
      data: {
        id: inserted.id,
        negociacionId: inserted.negociacionId,
        usuarioId: inserted.usuarioId,
        tipoEvento: inserted.tipoEvento,
        descripcion: inserted.descripcion,
        archivoAdjuntoUrl: inserted.archivoAdjuntoUrl,
        createdAt: inserted.createdAt ? new Date(inserted.createdAt) : new Date(),
        usuario: userRow || {
          id: input.usuarioId,
          nombre: "Broker Responsable",
          email: "",
          rol: "broker_senior",
        },
      },
    };
  } catch (error: any) {
    console.error("addBitacoraEventoAction: Error al registrar evento en bitácora:", error);
    return { success: false, error: error?.message || "No se pudo registrar el evento de bitácora." };
  }
}
