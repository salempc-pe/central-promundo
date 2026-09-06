"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

        <Link href="/auditoria" title="Ver bitácora de auditoría y notificaciones">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:text-slate-900">
            <Bell className="w-3.5 h-3.5" />
          </Button>
        </Link>

        <Link
          href="/configuracion"
          className="flex items-center space-x-2 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity"
          title="Configuración del sistema"
        >
          <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-slate-700 text-2xs font-bold">
            JR
          </div>
          <div className="text-2xs leading-tight">
            <div className="font-semibold text-slate-800">Broker Principal</div>
            <div className="text-3xs text-slate-400 font-mono">admin@promundo.pe</div>
          </div>
        </Link>
      </div>
    </header>
  );
}
