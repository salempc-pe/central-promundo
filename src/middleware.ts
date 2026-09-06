import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPER_ADMIN_EMAIL = "paulosalem8@gmail.com";

// Rutas públicas que no requieren autenticación previa
const PUBLIC_PATHS = ["/login", "/espera", "/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Omitir estáticos de Next.js, API pública de salud o assets multimedia
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.includes(".") // favicon.ico, svgs, imágenes
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // 2. Verificar si existe sesión directa/simulada en desarrollo
  const simulatedCookie = request.cookies.get("promundo_simulated_user")?.value?.toLowerCase().trim();
  if (simulatedCookie) {
    const isSuperAdmin = simulatedCookie === SUPER_ADMIN_EMAIL.toLowerCase();
    if (isSuperAdmin) {
      if (pathname === "/login" || pathname === "/espera") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return response;
    }

    // Consultar estado de usuario en base de datos
    const { data: dbUser } = await supabase
      .from("usuarios")
      .select("estado_acceso, rol, activo")
      .eq("email", simulatedCookie)
      .maybeSingle();

    const estadoAcceso = dbUser?.estado_acceso ?? "pendiente";
    const rol = dbUser?.rol ?? "broker_junior";
    const activo = dbUser?.activo ?? false;

    if (estadoAcceso === "pendiente" || !activo) {
      if (pathname.startsWith("/espera") || pathname.startsWith("/auth")) {
        return response;
      }
      return NextResponse.redirect(new URL("/espera", request.url));
    }

    if (estadoAcceso === "denegado") {
      if (pathname.startsWith("/espera") || pathname.startsWith("/auth")) {
        return response;
      }
      return NextResponse.redirect(new URL("/espera?denegado=1", request.url));
    }

    if (pathname === "/login" || pathname === "/espera") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/accesos") && rol !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  // 3. Validar JWT de sesión con Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // A. Si no hay usuario autenticado en la sesión
  if (!user) {
    if (isPublicPath) {
      return response;
    }
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirectTo", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // B. Hay usuario autenticado con Supabase Auth
  const email = user.email?.toLowerCase().trim() || "";
  const isSuperAdmin = email === SUPER_ADMIN_EMAIL.toLowerCase();

  // Si es el Superadministrador Principal: pase irrestricto
  if (isSuperAdmin) {
    if (pathname === "/login" || pathname === "/espera") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  // C. Para otros usuarios, verificar su estado de aprobación en DB
  const { data: dbUser } = await supabase
    .from("usuarios")
    .select("estado_acceso, rol, activo")
    .eq("email", email)
    .maybeSingle();

  const estadoAcceso = dbUser?.estado_acceso ?? "pendiente";
  const rol = dbUser?.rol ?? "broker_junior";
  const activo = dbUser?.activo ?? false;

  // Si está pendiente de aprobación:
  if (estadoAcceso === "pendiente" || !activo) {
    if (pathname.startsWith("/espera") || pathname.startsWith("/auth")) {
      return response;
    }
    return NextResponse.redirect(new URL("/espera", request.url));
  }

  // Si está denegado:
  if (estadoAcceso === "denegado") {
    if (pathname.startsWith("/espera") || pathname.startsWith("/auth")) {
      return response;
    }
    return NextResponse.redirect(new URL("/espera?denegado=1", request.url));
  }

  // Usuario aprobado:
  if (pathname === "/login" || pathname === "/espera") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protección de módulo exclusivo para administradores: /accesos
  if (pathname.startsWith("/accesos")) {
    if (rol !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
