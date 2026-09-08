import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { registrarOActualizarUsuarioOAuth, SUPER_ADMIN_EMAIL } from "@/lib/services/auth-service";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const incomingError = searchParams.get("error");
  const incomingErrorDesc = searchParams.get("error_description");

  // En Vercel o proxies inversos, obtener el origin real desde x-forwarded-host
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  // Si Google o Supabase enviaron un error directo en la URL
  if (incomingError || incomingErrorDesc) {
    console.error("OAuth incoming error:", { incomingError, incomingErrorDesc });
    const msgParam = encodeURIComponent(
      incomingErrorDesc || incomingError || "Error en el proveedor de autenticación."
    );
    return NextResponse.redirect(`${origin}/login?error=auth_error&msg=${msgParam}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_code_missing`);
  }

  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server component cookie limitation
            }
          },
        },
      }
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data?.user) {
      console.error("Supabase exchangeCodeForSession error:", exchangeError);
      const msgParam = encodeURIComponent(
        exchangeError?.message || "No se pudo intercambiar el código de sesión."
      );
      return NextResponse.redirect(`${origin}/login?error=oauth_exchange_failed&msg=${msgParam}`);
    }

    const email = data.user.email?.toLowerCase().trim() || "";
    const fullName =
      data.user.user_metadata?.full_name ||
      data.user.user_metadata?.name ||
      email.split("@")[0];
    const avatarUrl =
      data.user.user_metadata?.avatar_url ||
      data.user.user_metadata?.picture ||
      null;

    // Si es el superadministrador, acceso total garantizado incluso ante latencia de BD
    const isSuperAdmin = email === SUPER_ADMIN_EMAIL;

    try {
      // Registrar o sincronizar en tabla usuarios de PostgreSQL
      const usuarioDb = await registrarOActualizarUsuarioOAuth({
        authId: data.user.id,
        email,
        nombre: fullName,
        avatarUrl,
      });

      if (isSuperAdmin) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (usuarioDb.estadoAcceso === "aprobado" && usuarioDb.activo) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (usuarioDb.estadoAcceso === "denegado") {
        return NextResponse.redirect(`${origin}/espera?denegado=1`);
      }

      return NextResponse.redirect(`${origin}/espera`);
    } catch (dbError: any) {
      console.error("Error sincronizando usuario OAuth en PostgreSQL:", dbError);
      // Blindaje: si es el superadministrador, se permite el acceso directo
      if (isSuperAdmin) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      return NextResponse.redirect(
        `${origin}/login?error=auth_error&msg=${encodeURIComponent("Error al sincronizar perfil en base de datos.")}`
      );
    }
  } catch (err: any) {
    console.error("Error inesperado en callback de autenticación:", err);
    return NextResponse.redirect(
      `${origin}/login?error=auth_error&msg=${encodeURIComponent(err.message || "Error interno de autenticación.")}`
    );
  }
}
