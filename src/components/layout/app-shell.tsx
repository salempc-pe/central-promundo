"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Rutas públicas que no deben mostrar la barra lateral ni el encabezado operativo institucional
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/espera") ||
    pathname.startsWith("/auth");

  if (isPublicRoute) {
    return (
      <div className="min-h-screen w-screen bg-slate-100 text-slate-900 flex flex-col justify-center items-center p-4 overflow-y-auto antialiased font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-100 text-slate-900 antialiased font-sans">
      {/* Sidebar fija del sistema */}
      <Sidebar />

      {/* Contenido principal con Header superior */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-slate-50/70 p-3">
          {children}
        </main>
      </div>
    </div>
  );
}
