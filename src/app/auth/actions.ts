"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  getUsuariosSolicitudes,
  getSolicitudesPendientesCount,
  getUsuarioByEmail,
  aprobarAcceso,
  denegarAcceso,
  cambiarRolUsuario,
  registrarOActualizarUsuarioOAuth,
  SUPER_ADMIN_EMAIL,
} from "@/lib/services/auth-service";
import type { RolUsuario, SolicitudAcceso } from "@/types/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const SIMULATED_USER_COOKIE = "promundo_simulated_user";

/**
 * Obtener la sesión activa del usuario (Supabase Auth o Sesión Directa)
 */
export async function getCurrentUserSession() {
  try {
    const cookieStore = cookies();
    const simulatedEmail = cookieStore.get(SIMULATED_USER_COOKIE)?.value?.toLowerCase().trim();

    if (simulatedEmail) {
      const isSuperAdmin = simulatedEmail === SUPER_ADMIN_EMAIL.toLowerCase();
      const dbUser = await getUsuarioByEmail(simulatedEmail);

      return {
        id: dbUser?.id || "user-" + simulatedEmail,
        email: simulatedEmail,
        nombre: dbUser?.nombre || (isSuperAdmin ? "Paulo Salem" : simulatedEmail.split("@")[0]),
        avatarUrl: dbUser?.avatarUrl || null,
        rol: isSuperAdmin ? "admin" : (dbUser?.rol || "broker_junior"),
        estadoAcceso: isSuperAdmin ? "aprobado" : (dbUser?.estadoAcceso || "pendiente"),
        isSuperAdmin,
      };
    }

    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return null;
    }

    const email = user.email.toLowerCase().trim();
    const isSuperAdmin = email === SUPER_ADMIN_EMAIL.toLowerCase();

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
 * Iniciar sesión directa o simular usuario (Útil para pruebas inmediatas y mientras se habilita Google Provider en Supabase)
 */
export async function simularLoginAction(email: string, nombre?: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const isSuperAdmin = normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase();

  const cookieStore = cookies();
  cookieStore.set(SIMULATED_USER_COOKIE, normalizedEmail, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });

  const dbUser = await registrarOActualizarUsuarioOAuth({
    email: normalizedEmail,
    nombre: nombre || (isSuperAdmin ? "Paulo Salem" : normalizedEmail.split("@")[0]),
  });

  revalidatePath("/");
  revalidatePath("/accesos");
  revalidatePath("/espera");

  if (isSuperAdmin || (dbUser && dbUser.estadoAcceso === "aprobado")) {
    return { success: true, redirect: "/" };
  }

  return { success: true, redirect: "/espera" };
}

/**
 * Cerrar sesión
 */
export async function signOutAction() {
  try {
    const cookieStore = cookies();
    cookieStore.delete(SIMULATED_USER_COOKIE);

    const supabase = await createServerClient();
    await supabase.auth.signOut();
  } catch {
    // Ignorar si ya estaba cerrado
  }
  revalidatePath("/");
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
