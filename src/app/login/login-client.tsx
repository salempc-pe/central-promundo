"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Lock, AlertCircle, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginClientProps {
  errorMsg?: string | null;
}

export function LoginClient({ errorMsg }: LoginClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorMsg || null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const supabase = createClient();

      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (authError) {
        throw authError;
      }
    } catch (err: unknown) {
      console.error("Error al iniciar sesión con Google:", err);
      const message = err instanceof Error ? err.message : "Error al conectar con Google OAuth.";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tarjeta Bloomberg Light Corporativa */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-7 select-none">
        {/* Cabecera Institucional */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                CENTRAL PROMUNDO
              </h1>
              <span className="text-3xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                SISTEMA v2.5
              </span>
            </div>
            <p className="text-2xs text-slate-500 font-medium">
              Suelo Institucional & Banca de Tierras de Inversión
            </p>
          </div>
        </div>

        {/* Notificación de Error si existe */}
        {error && (
          <div className="mb-5 bg-rose-50 border border-rose-200 rounded p-3 text-2xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong>Error de Acceso:</strong> {error}
            </div>
          </div>
        )}

        {/* Instrucciones y Regla de Acceso */}
        <div className="space-y-4 mb-6">
          <div className="text-xs text-slate-700 font-medium leading-relaxed">
            Inicia sesión con tu cuenta corporativa o personal de Google para acceder a la plataforma.
          </div>

          {/* Botón Oficial Google Sign-In */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-10 bg-white hover:bg-slate-50 border-slate-300 text-slate-800 font-semibold text-xs shadow-xs flex items-center justify-center space-x-3 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-slate-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Conectando con Google...</span>
              </span>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </>
            )}
          </Button>
        </div>

        {/* Callout de Protocolo Fiduciario & Control de Acceso */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-3xs text-slate-600 space-y-2">
          <div className="flex items-center space-x-1.5 text-slate-800 font-semibold uppercase tracking-wider text-3xs">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>Protocolo de Acceso Institucional</span>
          </div>
          <p className="leading-relaxed">
            Al registrarte por primera vez con tu cuenta de Google, tu solicitud entrará en estado{" "}
            <strong className="text-amber-700 font-bold font-mono">PENDIENTE</strong>. Por normas fiduciarias y confidencialidad comercial, un administrador deberá autorizar formalmente tu cuenta antes de acceder al inventario de suelo y parámetros urbanísticos.
          </p>
          <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between text-slate-500">
            <span>Administrador Principal:</span>
            <span className="font-mono font-semibold text-slate-800">paulosalem8@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Pie de página institucional */}
      <div className="mt-4 text-center text-3xs text-slate-400 font-mono">
        PROMUNDO INMOBILIARIA &copy; {new Date().getFullYear()} &bull; Todos los derechos reservados
      </div>
    </div>
  );
}
