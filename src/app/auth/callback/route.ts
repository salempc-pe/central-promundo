import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { registrarOActualizarUsuarioOAuth, SUPER_ADMIN_EMAIL } from "@/lib/services/auth-service";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // En Vercel o proxies inversos, obtener el origin real desde x-forwarded-host
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  if (code) {
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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const email = data.user.email?.toLowerCase().trim() || "";
      const fullName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        email.split("@")[0];
      const avatarUrl =
        data.user.user_metadata?.avatar_url ||
        data.user.user_metadata?.picture ||
        null;

      // Registrar o sincronizar en tabla usuarios
      const usuarioDb = await registrarOActualizarUsuarioOAuth({
        authId: data.user.id,
        email,
        nombre: fullName,
        avatarUrl,
      });

      // Si es el superadministrador, acceso total inmediato
      if (email === SUPER_ADMIN_EMAIL) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Si está aprobado por el admin, redirigir a la app
      if (usuarioDb.estadoAcceso === "aprobado" && usuarioDb.activo) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Si está denegado
      if (usuarioDb.estadoAcceso === "denegado") {
        return NextResponse.redirect(`${origin}/espera?denegado=1`);
      }

      // Si está pendiente de aprobación
      return NextResponse.redirect(`${origin}/espera`);
    }
  }

  // Si falló o no vino código
  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
