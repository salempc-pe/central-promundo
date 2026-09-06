"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserSession, signOutAction } from "@/app/auth/actions";
import { Clock, ShieldAlert, CheckCircle2, RefreshCw, LogOut, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EsperaClientProps {
  isDenegado?: boolean;
}

export function EsperaClient({ isDenegado = false }: EsperaClientProps) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<{
    email: string;
    nombre: string;
    avatarUrl?: string | null;
    estadoAcceso: string;
    rol: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
      const sessionUser = await getCurrentUserSession();
      if (sessionUser) {
        setUsuario(sessionUser);
        if (sessionUser.estadoAcceso === "aprobado") {
          router.push("/");
        }
      }
    }
    loadUserData();
  }, [router]);

  const handleVerificarEstado = async () => {
    setIsChecking(true);
    setCheckMessage(null);
    try {
      const sessionUser = await getCurrentUserSession();
      if (sessionUser) {
        setUsuario(sessionUser);
        if (sessionUser.estadoAcceso === "aprobado") {
          setCheckMessage("¡Acceso aprobado! Redirigiendo al sistema...");
          setTimeout(() => {
            router.push("/");
          }, 1000);
          return;
        } else if (sessionUser.estadoAcceso === "denegado") {
          setCheckMessage("Tu solicitud ha sido denegada por la administración.");
        } else {
          setCheckMessage("Tu solicitud continúa en revisión por el administrador.");
        }
      } else {
        setCheckMessage("No se encontró sesión activa. Por favor inicia sesión.");
      }
    } catch {
      setCheckMessage("Error al verificar el estado. Intenta en unos momentos.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await signOutAction();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-7 select-none">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 tracking-tight">
                CENTRAL PROMUNDO
              </div>
              <div className="text-3xs text-slate-500 font-mono">
                CONTROL DE ACCESOS // PROTOCOLO CUSTODIA
              </div>
            </div>
          </div>
          <span className="text-3xs font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
            LIMA, PE
          </span>
        </div>

        {/* Estado Visual */}
        <div className="text-center my-4">
          <div
            className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3 ${
              isDenegado
                ? "bg-rose-50 border border-rose-200 text-rose-600"
                : "bg-amber-50 border border-amber-200 text-amber-600"
            }`}
          >
            {isDenegado ? (
              <ShieldAlert className="w-7 h-7" />
            ) : (
              <Clock className="w-7 h-7 animate-pulse" />
            )}
          </div>

          <h2 className="text-sm font-bold text-slate-900 mb-1">
            {isDenegado
              ? "Acceso No Autorizado / Solicitud Denegada"
              : "Solicitud de Acceso en Revisión"}
          </h2>
          <p className="text-2xs text-slate-500 font-medium max-w-sm mx-auto">
            {isDenegado
              ? "Tu cuenta no cuenta con autorización para acceder a la cartera confidencial de suelo institucional."
              : "Hemos recibido tu solicitud de ingreso. Un administrador debe aprobar tu cuenta para asignarte permisos."}
          </p>
        </div>

        {/* Ficha de Solicitud del Usuario */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 my-5 text-2xs space-y-2">
          <div className="text-3xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            Detalles de la Cuenta Registrada
          </div>
          <div className="grid grid-cols-2 gap-2 font-sans pt-1 border-t border-slate-200/60">
            <div>
              <span className="text-3xs text-slate-400 block font-mono">USUARIO:</span>
              <span className="font-semibold text-slate-800 truncate block">
                {usuario?.nombre || "Usuario Google"}
              </span>
            </div>
            <div>
              <span className="text-3xs text-slate-400 block font-mono">CORREO REGISTRADO:</span>
              <span className="font-mono text-slate-800 text-3xs font-semibold truncate block">
                {usuario?.email || "Cargando sesión..."}
              </span>
            </div>
            <div>
              <span className="text-3xs text-slate-400 block font-mono">ESTADO ACTUAL:</span>
              <span
                className={`inline-block font-mono text-3xs font-bold px-1.5 py-0.5 rounded border ${
                  isDenegado
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {isDenegado ? "DENEGADO" : "PENDIENTE DE APROBACIÓN"}
              </span>
            </div>
            <div>
              <span className="text-3xs text-slate-400 block font-mono">ADMINISTRADOR A CARGO:</span>
              <span className="font-mono text-3xs font-semibold text-slate-800 block">
                paulosalem8@gmail.com
              </span>
            </div>
          </div>
        </div>

        {/* Mensaje de retroalimentación si se verificó */}
        {checkMessage && (
          <div className="mb-4 p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900 text-2xs flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{checkMessage}</span>
          </div>
        )}

        {/* Acciones */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {!isDenegado && (
            <Button
              type="button"
              variant="default"
              onClick={handleVerificarEstado}
              disabled={isChecking}
              className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
              <span>{isChecking ? "Consultando estado..." : "Verificar si ya fui aprobado"}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            className="w-full h-8 bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 text-2xs font-semibold flex items-center justify-center space-x-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión e intentar con otra cuenta</span>
          </Button>
        </div>
      </div>

      <div className="mt-3 text-center text-3xs text-slate-400 font-mono">
        Si requieres acelerar tu aprobación, contacta a Paulo Salem vía Slack o WhatsApp corporativo.
      </div>
    </div>
  );
}
