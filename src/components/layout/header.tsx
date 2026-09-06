"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, RefreshCw, Check, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUserSession, signOutAction, fetchPendientesCountAction } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [pendientesCount, setPendientesCount] = useState<number>(0);
  const [userSession, setUserSession] = useState<{
    nombre: string;
    email: string;
    rol: string;
    isSuperAdmin: boolean;
  }>({
    nombre: "Paulo Salem",
    email: "paulosalem8@gmail.com",
    rol: "admin",
    isSuperAdmin: true,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCurrentUserSession().then((u) => {
      if (u) {
        setUserSession({
          nombre: u.nombre,
          email: u.email,
          rol: u.rol,
          isSuperAdmin: u.isSuperAdmin,
        });
      }
    }).catch(() => {});

    fetchPendientesCountAction().then((c) => {
      setPendientesCount(c);
    }).catch(() => {});
  }, []);

  // Atajo global Ctrl+K / Cmd+K para enfocar la barra de búsqueda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/terrenos?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSyncDb = () => {
    setIsSyncing(true);
    setSyncDone(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncDone(true);
      window.dispatchEvent(new Event("promundo:sync-complete"));
      setTimeout(() => setSyncDone(false), 2500);
    }, 700);
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

  const userInitials = userSession.nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-10 border-b border-slate-200 bg-white px-3 flex items-center justify-between shrink-0 select-none">
      {/* Ticker / Search Quick Bar */}
      <div className="flex items-center space-x-3 flex-1">
        <div className="flex items-center text-2xs text-slate-500 font-mono space-x-2 border-r border-slate-200 pr-3">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <Link
            href="/"
            className="font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            title="Ir al Centro de Control (Dashboard)"
          >
            PROMUNDO SISTEMA
          </Link>
          <span className="text-slate-400">|</span>
          <Link
            href="/terrenos"
            className="hover:text-blue-600 transition-colors"
            title="Ver inventario completo de lotes"
          >
            <span>
              LOTES ACTIVOS:{" "}
              <strong className="text-slate-900 font-bold hover:underline">142</strong>
            </span>
          </Link>
          <span className="text-slate-400">|</span>
          <Link
            href="/reportes"
            className="hover:text-blue-600 transition-colors"
            title="Ver métricas financieras y BI"
          >
            <span>
              VALOR INVENTARIO:{" "}
              <strong className="text-slate-900 font-bold hover:underline">$184.2M</strong>
            </span>
          </Link>
        </div>

        {/* Buscador Universal */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xs w-full">
          <Search className="w-3 h-3 absolute left-2 top-2.5 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, zonificación, distrito o propietario (Ctrl+K)..."
            className="w-full h-7 pl-7 pr-2 text-2xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400 font-sans"
          />
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncDb}
          disabled={isSyncing}
          className="h-7 text-2xs gap-1 font-mono hover:bg-slate-100"
          title="Sincronizar telemetría PostGIS y catálogo reactivo"
        >
          {syncDone ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Sync OK</span>
            </>
          ) : (
            <>
              <RefreshCw className={`w-3 h-3 text-slate-500 ${isSyncing ? "animate-spin text-blue-600" : ""}`} />
              <span>{isSyncing ? "Sincronizando..." : "Sync DB"}</span>
            </>
          )}
        </Button>

        {/* Campana de Notificaciones con Badge para Solicitudes Pendientes */}
        <Link
          href={pendientesCount > 0 ? "/accesos" : "/auditoria"}
          title={
            pendientesCount > 0
              ? `${pendientesCount} solicitud(es) de acceso pendiente(s)`
              : "Ver bitácora de auditoría"
          }
          className="relative"
        >
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:text-slate-900">
            <Bell className="w-3.5 h-3.5" />
          </Button>
          {pendientesCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
          )}
        </Link>

        {/* Perfil del Usuario Activo */}
        <Link
          href="/configuracion"
          className="flex items-center space-x-2 pl-2 border-l border-slate-200 hover:opacity-85 transition-opacity"
          title="Perfil y configuración de cuenta"
        >
          <div className="w-6 h-6 rounded bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center text-3xs font-bold font-mono">
            {userInitials || "PS"}
          </div>
          <div className="text-2xs leading-tight">
            <div className="font-semibold text-slate-900 flex items-center gap-1">
              <span>{userSession.nombre}</span>
              <span className="text-3xs font-mono font-bold bg-slate-100 text-slate-600 px-1 rounded">
                {userSession.rol.toUpperCase()}
              </span>
            </div>
            <div className="text-3xs text-slate-400 font-mono truncate max-w-[140px]">
              {userSession.email}
            </div>
          </div>
        </Link>

        {/* Botón de Cerrar Sesión */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 ml-1 rounded"
          title="Cerrar sesión institucional"
        >
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    </header>
  );
}
