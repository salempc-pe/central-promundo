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

// Usuarios de respaldo en memoria si la conexión a base de datos estuviese en inicialización
const mockUsuariosState: SolicitudAcceso[] = [
  {
    id: "1e2bfd92-0411-41ff-be42-16327ad1fc01",
    authId: null,
    nombre: "Paulo Salem",
    email: SUPER_ADMIN_EMAIL,
    avatarUrl: null,
    rol: "admin",
    estadoAcceso: "aprobado",
    fechaSolicitud: new Date("2026-09-01T08:00:00Z"),
    fechaResolucion: new Date("2026-09-01T08:00:00Z"),
    resueltoPor: "SYSTEM_INIT",
    notas: "Superadministrador Principal del Sistema Promundo",
    activo: true,
    createdAt: new Date("2026-09-01T08:00:00Z"),
    updatedAt: new Date("2026-09-01T08:00:00Z"),
  },
  {
    id: "2a3bfd92-0411-41ff-be42-16327ad1fc02",
    authId: null,
    nombre: "Carlos Mendoza Silva",
    email: "cmendoza@constructora-urbana.pe",
    avatarUrl: null,
    rol: "broker_senior",
    estadoAcceso: "aprobado",
    fechaSolicitud: new Date("2026-09-04T10:15:00Z"),
    fechaResolucion: new Date("2026-09-04T11:00:00Z"),
    resueltoPor: SUPER_ADMIN_EMAIL,
    notas: "Broker Senior - Zona San Isidro y Miraflores",
    activo: true,
    createdAt: new Date("2026-09-04T10:15:00Z"),
    updatedAt: new Date("2026-09-04T11:00:00Z"),
  },
  {
    id: "3c4bfd92-0411-41ff-be42-16327ad1fc03",
    authId: null,
    nombre: "Andrea Valdivia Roca",
    email: "andrea.valdivia.inversiones@gmail.com",
    avatarUrl: null,
    rol: "broker_junior",
    estadoAcceso: "pendiente",
    fechaSolicitud: new Date("2026-09-06T00:45:00Z"),
    fechaResolucion: null,
    resueltoPor: null,
    notas: "Solicitó ingreso vía Google Sign-In. Esperando validación de credenciales.",
    activo: false,
    createdAt: new Date("2026-09-06T00:45:00Z"),
    updatedAt: new Date("2026-09-06T00:45:00Z"),
  },
  {
    id: "4d5bfd92-0411-41ff-be42-16327ad1fc04",
    authId: null,
    nombre: "Rodrigo Morales Grau",
    email: "rodrigo.morales@desarrollos-peru.com",
    avatarUrl: null,
    rol: "broker_junior",
    estadoAcceso: "pendiente",
    fechaSolicitud: new Date("2026-09-06T01:10:00Z"),
    fechaResolucion: null,
    resueltoPor: null,
    notas: "Postulación para gestión de suelo multifamiliar en Surco y La Molina.",
    activo: false,
    createdAt: new Date("2026-09-06T01:10:00Z"),
    updatedAt: new Date("2026-09-06T01:10:00Z"),
  },
];

/**
 * Obtener todos los usuarios y solicitudes de acceso
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
    console.warn("authService.getUsuariosSolicitudes: Usando fallback en memoria", error);
  }

  return [...mockUsuariosState];
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
  } catch {
    return mockUsuariosState.filter((u) => u.estadoAcceso === "pendiente").length;
  }
}

/**
 * Obtener perfil de usuario por email
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
  } catch {
    // fallback
  }

  const found = mockUsuariosState.find((u) => u.email.toLowerCase() === normalizedEmail);
  return found || null;
}

/**
 * Registrar o actualizar un usuario proveniente de Google OAuth
 */
export async function registrarOActualizarUsuarioOAuth(params: {
  authId?: string;
  email: string;
  nombre: string;
  avatarUrl?: string;
}): Promise<SolicitudAcceso> {
  const email = params.email.toLowerCase().trim();
  const isSuperAdmin = email === SUPER_ADMIN_EMAIL;

  try {
    const db = getDb();
    const [existente] = await db.select().from(usuarios).where(eq(usuarios.email, email));

    if (existente) {
      // Si es el superadmin, asegurar que esté aprobado y con rol admin
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

      // Si es usuario existente regular, actualizar avatar o authId
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

    // Nuevo usuario:
    const nuevo = await db
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

    return nuevo[0] as unknown as SolicitudAcceso;
  } catch (error) {
    console.warn("authService.registrarOActualizarUsuarioOAuth error en DB, usando memoria:", error);
  }

  // Fallback en memoria
  let item = mockUsuariosState.find((u) => u.email.toLowerCase() === email);
  if (!item) {
    item = {
      id: "mock-" + Date.now(),
      authId: params.authId || null,
      nombre: params.nombre || email.split("@")[0],
      email,
      avatarUrl: params.avatarUrl || null,
      rol: isSuperAdmin ? "admin" : "broker_junior",
      estadoAcceso: isSuperAdmin ? "aprobado" : "pendiente",
      activo: isSuperAdmin,
      fechaSolicitud: new Date(),
      fechaResolucion: isSuperAdmin ? new Date() : null,
      resueltoPor: isSuperAdmin ? "SYSTEM_INIT" : null,
      notas: "Registrado vía Google Sign-In.",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsuariosState.unshift(item);
  }
  return item;
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
    console.warn("authService.aprobarAcceso error en DB:", error);
  }

  // Fallback memoria
  const idx = mockUsuariosState.findIndex((u) => u.id === usuarioId);
  if (idx !== -1) {
    mockUsuariosState[idx] = {
      ...mockUsuariosState[idx],
      estadoAcceso: "aprobado",
      rol,
      activo: true,
      fechaResolucion: new Date(),
      resueltoPor: adminEmail,
      notas: notas || "Acceso autorizado por la administración.",
      updatedAt: new Date(),
    };
    return mockUsuariosState[idx];
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
  const target = mockUsuariosState.find((u) => u.id === usuarioId);
  if (target?.email === SUPER_ADMIN_EMAIL) {
    throw new Error("El Superadministrador Principal no puede ser denegado.");
  }

  try {
    const db = getDb();
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
    console.warn("authService.denegarAcceso error en DB:", error);
  }

  // Fallback memoria
  const idx = mockUsuariosState.findIndex((u) => u.id === usuarioId);
  if (idx !== -1) {
    mockUsuariosState[idx] = {
      ...mockUsuariosState[idx],
      estadoAcceso: "denegado",
      activo: false,
      fechaResolucion: new Date(),
      resueltoPor: adminEmail,
      notas: motivo || "Acceso denegado por la administración.",
      updatedAt: new Date(),
    };
    return mockUsuariosState[idx];
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
  const target = mockUsuariosState.find((u) => u.id === usuarioId);
  if (target?.email === SUPER_ADMIN_EMAIL && nuevoRol !== "admin") {
    throw new Error("El rol del Superadministrador Principal debe ser admin permanentemente.");
  }

  try {
    const db = getDb();
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
    console.warn("authService.cambiarRolUsuario error en DB:", error);
  }

  const idx = mockUsuariosState.findIndex((u) => u.id === usuarioId);
  if (idx !== -1) {
    mockUsuariosState[idx] = {
      ...mockUsuariosState[idx],
      rol: nuevoRol,
      resueltoPor: adminEmail,
      updatedAt: new Date(),
    };
    return mockUsuariosState[idx];
  }
  return null;
}
