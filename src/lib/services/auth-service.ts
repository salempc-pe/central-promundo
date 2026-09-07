import { getDb } from "@/db";
import { usuarios } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import {
  type SolicitudAcceso,
  type RolUsuario,
  type EstadoAcceso,
  type AuthSessionUser,
  SUPER_ADMIN_EMAIL,
} from "@/types/auth";

export { SUPER_ADMIN_EMAIL };

/**
 * Obtener todos los usuarios y solicitudes de acceso desde PostgreSQL
 */
export async function getUsuariosSolicitudes(): Promise<SolicitudAcceso[]> {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(usuarios)
      .orderBy(desc(usuarios.createdAt));

    if (rows && rows.length > 0) {
      return (rows as (typeof usuarios.$inferSelect)[]).map((r) => ({
        id: r.id,
        authId: r.authId,
        nombre: r.nombre,
        email: r.email,
        avatarUrl: r.avatarUrl,
        rol: r.rol as RolUsuario,
        estadoAcceso: r.estadoAcceso as EstadoAcceso,
        fechaSolicitud: r.fechaSolicitud,
        fechaResolucion: r.fechaResolucion,
        resueltoPor: r.resueltoPor,
        notas: r.notas,
        activo: r.activo,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    }
  } catch (error) {
    console.error("authService.getUsuariosSolicitudes error:", error);
  }

  return [];
}

/**
 * Obtener conteo de solicitudes pendientes para notificaciones y badges
 */
export async function getSolicitudesPendientesCount(): Promise<number> {
  try {
    const db = getDb();
    const result = await db
      .select({ count: count() })
      .from(usuarios)
      .where(eq(usuarios.estadoAcceso, "pendiente"));

    return result[0]?.count ?? 0;
  } catch (error) {
    console.error("authService.getSolicitudesPendientesCount error:", error);
    return 0;
  }
}

/**
 * Obtener perfil de usuario por email desde PostgreSQL
 */
export async function getUsuarioByEmail(email: string): Promise<SolicitudAcceso | null> {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, normalizedEmail));

    if (row) {
      return {
        id: row.id,
        authId: row.authId,
        nombre: row.nombre,
        email: row.email,
        avatarUrl: row.avatarUrl,
        rol: row.rol as RolUsuario,
        estadoAcceso: row.estadoAcceso as EstadoAcceso,
        fechaSolicitud: row.fechaSolicitud,
        fechaResolucion: row.fechaResolucion,
        resueltoPor: row.resueltoPor,
        notas: row.notas,
        activo: row.activo,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    }
  } catch (error) {
    console.error("authService.getUsuarioByEmail error:", error);
  }

  return null;
}

/**
 * Registrar o actualizar un usuario proveniente de Google OAuth en PostgreSQL
 */
export async function registrarOActualizarUsuarioOAuth(params: {
  authId?: string;
  email: string;
  nombre: string;
  avatarUrl?: string;
}): Promise<SolicitudAcceso> {
  const email = params.email.toLowerCase().trim();
  const isSuperAdmin = email === SUPER_ADMIN_EMAIL;

  const db = getDb();
  const [existente] = await db.select().from(usuarios).where(eq(usuarios.email, email));

  if (existente) {
    if (isSuperAdmin) {
      const [actualizado] = await db
        .update(usuarios)
        .set({
          authId: params.authId || existente.authId,
          avatarUrl: params.avatarUrl || existente.avatarUrl,
          rol: "admin",
          estadoAcceso: "aprobado",
          activo: true,
          updatedAt: new Date(),
        })
        .where(eq(usuarios.id, existente.id))
        .returning();

      return actualizado as unknown as SolicitudAcceso;
    }

    const [actualizado] = await db
      .update(usuarios)
      .set({
        authId: params.authId || existente.authId,
        avatarUrl: params.avatarUrl || existente.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(usuarios.id, existente.id))
      .returning();

    return actualizado as unknown as SolicitudAcceso;
  }

  const [nuevo] = await db
    .insert(usuarios)
    .values({
      authId: params.authId || null,
      email,
      nombre: params.nombre || email.split("@")[0],
      avatarUrl: params.avatarUrl || null,
      rol: isSuperAdmin ? "admin" : "broker_junior",
      estadoAcceso: isSuperAdmin ? "aprobado" : "pendiente",
      activo: isSuperAdmin,
      resueltoPor: isSuperAdmin ? "SYSTEM_INIT" : null,
      notas: isSuperAdmin
        ? "Superadministrador Principal del Sistema Promundo"
        : "Solicitud registrada automáticamente vía Google Sign-In.",
    })
    .returning();

  return nuevo as unknown as SolicitudAcceso;
}

/**
 * Aprobar acceso a un usuario
 */
export async function aprobarAcceso(
  usuarioId: string,
  rol: RolUsuario = "broker_junior",
  adminEmail: string = SUPER_ADMIN_EMAIL,
  notas?: string
): Promise<SolicitudAcceso | null> {
  try {
    const db = getDb();
    const [actualizado] = await db
      .update(usuarios)
      .set({
        estadoAcceso: "aprobado",
        rol,
        activo: true,
        fechaResolucion: new Date(),
        resueltoPor: adminEmail,
        notas: notas ? notas : "Acceso autorizado por la administración.",
        updatedAt: new Date(),
      })
      .where(eq(usuarios.id, usuarioId))
      .returning();

    if (actualizado) {
      return actualizado as unknown as SolicitudAcceso;
    }
  } catch (error) {
    console.error("authService.aprobarAcceso error en DB:", error);
  }

  return null;
}

/**
 * Denegar acceso a un usuario
 */
export async function denegarAcceso(
  usuarioId: string,
  adminEmail: string = SUPER_ADMIN_EMAIL,
  motivo?: string
): Promise<SolicitudAcceso | null> {
  try {
    const db = getDb();
    const [target] = await db.select().from(usuarios).where(eq(usuarios.id, usuarioId));
    if (target?.email === SUPER_ADMIN_EMAIL) {
      throw new Error("El Superadministrador Principal no puede ser denegado.");
    }

    const [actualizado] = await db
      .update(usuarios)
      .set({
        estadoAcceso: "denegado",
        activo: false,
        fechaResolucion: new Date(),
        resueltoPor: adminEmail,
        notas: motivo || "Acceso denegado por la administración.",
        updatedAt: new Date(),
      })
      .where(eq(usuarios.id, usuarioId))
      .returning();

    if (actualizado) {
      return actualizado as unknown as SolicitudAcceso;
    }
  } catch (error) {
    console.error("authService.denegarAcceso error en DB:", error);
  }

  return null;
}

/**
 * Cambiar rol de un usuario autorizado
 */
export async function cambiarRolUsuario(
  usuarioId: string,
  nuevoRol: RolUsuario,
  adminEmail: string = SUPER_ADMIN_EMAIL
): Promise<SolicitudAcceso | null> {
  try {
    const db = getDb();
    const [target] = await db.select().from(usuarios).where(eq(usuarios.id, usuarioId));
    if (target?.email === SUPER_ADMIN_EMAIL && nuevoRol !== "admin") {
      throw new Error("El rol del Superadministrador Principal debe ser admin permanentemente.");
    }

    const [actualizado] = await db
      .update(usuarios)
      .set({
        rol: nuevoRol,
        resueltoPor: adminEmail,
        updatedAt: new Date(),
      })
      .where(eq(usuarios.id, usuarioId))
      .returning();

    if (actualizado) {
      return actualizado as unknown as SolicitudAcceso;
    }
  } catch (error) {
    console.error("authService.cambiarRolUsuario error en DB:", error);
  }

  return null;
}
