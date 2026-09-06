"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  getUsuariosSolicitudes,
  getSolicitudesPendientesCount,
  getUsuarioByEmail,
  aprobarAcceso,
  denegarAcceso,
  cambiarRolUsuario,
  SUPER_ADMIN_EMAIL,
} from "@/lib/services/auth-service";
import type { RolUsuario, SolicitudAcceso } from "@/types/auth";
import { revalidatePath } from "next/cache";

/**
 * Obtener la sesión activa del usuario
 */
export async function getCurrentUserSession() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return null;
    }

    const email = user.email.toLowerCase().trim();
    const isSuperAdmin = email === SUPER_ADMIN_EMAIL;

    const dbUser = await getUsuarioByEmail(email);

    return {
      id: dbUser?.id || user.id,
      email,
      nombre: dbUser?.nombre || user.user_metadata?.full_name || email.split("@")[0],
      avatarUrl: dbUser?.avatarUrl || user.user_metadata?.avatar_url || null,
      rol: isSuperAdmin ? "admin" : (dbUser?.rol || "broker_junior"),
      estadoAcceso: isSuperAdmin ? "aprobado" : (dbUser?.estadoAcceso || "pendiente"),
      isSuperAdmin,
    };
  } catch (err) {
    console.error("Error al obtener sesión actual:", err);
    return null;
  }
}

/**
 * Cerrar sesión
 */
export async function signOutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
}

/**
 * Obtener solicitudes para el módulo de accesos
 */
export async function fetchSolicitudesAction(): Promise<SolicitudAcceso[]> {
  return await getUsuariosSolicitudes();
}

/**
 * Obtener conteo de solicitudes pendientes para badges
 */
export async function fetchPendientesCountAction(): Promise<number> {
  return await getSolicitudesPendientesCount();
}

/**
 * Aprobar acceso a un usuario
 */
export async function aprobarAccesoAction(usuarioId: string, rol: RolUsuario, notas?: string) {
  const current = await getCurrentUserSession();
  const adminEmail = current?.email || SUPER_ADMIN_EMAIL;

  const resultado = await aprobarAcceso(usuarioId, rol, adminEmail, notas);
  revalidatePath("/accesos");
  revalidatePath("/");
  return resultado;
}

/**
 * Denegar acceso a un usuario
 */
export async function denegarAccesoAction(usuarioId: string, motivo?: string) {
  const current = await getCurrentUserSession();
  const adminEmail = current?.email || SUPER_ADMIN_EMAIL;

  const resultado = await denegarAcceso(usuarioId, adminEmail, motivo);
  revalidatePath("/accesos");
  revalidatePath("/");
  return resultado;
}

/**
 * Cambiar rol de un usuario
 */
export async function cambiarRolAction(usuarioId: string, nuevoRol: RolUsuario) {
  const current = await getCurrentUserSession();
  const adminEmail = current?.email || SUPER_ADMIN_EMAIL;

  const resultado = await cambiarRolUsuario(usuarioId, nuevoRol, adminEmail);
  revalidatePath("/accesos");
  return resultado;
}
