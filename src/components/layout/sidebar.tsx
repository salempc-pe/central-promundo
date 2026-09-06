"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  MapPin,
  FileCheck,
  GitPullRequest,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  ShieldAlert,
  PanelLeftClose,
  PanelLeftOpen,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  category: string;
  items: NavItem[];
}

const navigationItems: NavGroup[] = [
  {
    category: "MÓDULOS OPERATIVOS",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Terrenos (Data Grid)",
        href: "/terrenos",
        icon: Building,
      },
      {
        title: "Mapa Geoespacial",
        href: "/mapa",
        icon: MapPin,
      },
      {
        title: "Documentación & CPU",
        href: "/documentos",
        icon: FileCheck,
      },
      {
        title: "Pipeline Negociaciones",
        href: "/pipeline",
        icon: GitPullRequest,
      },
      {
        title: "Matching Constructoras",
        href: "/matching",
        icon: Users,
      },
    ],
  },
  {
    category: "FINANZAS & CONTROL",
    items: [
      {
        title: "Comisiones y Cierres",
        href: "/comisiones",
        icon: DollarSign,
      },
      {
        title: "Métricas & Reportes",
        href: "/reportes",
        icon: TrendingUp,
      },
    ],
  },
  {
    category: "SISTEMA",
    items: [
      {
        title: "Configuración GIS / DB",
        href: "/configuracion",
        icon: Settings,
      },
      {
        title: "Auditoría & Logs",
        href: "/auditoria",
        icon: ShieldAlert,
      },
    ],
  },
];

const STORAGE_KEY = "promundo:sidebar-collapsed";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Inicialización segura tras montaje para prevenir hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch (err) {
      console.warn("No se pudo leer localStorage para el sidebar:", err);
    }
  }, []);

  // Función para alternar el estado y persistir en localStorage
  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch (err) {
        console.warn("No se pudo guardar estado en localStorage:", err);
      }
      return next;
    });
  }, []);

  // Atajo de teclado ergonómico (Ctrl+B o Cmd+B) para colapsar/expandir
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // Notificar al mapa WebGL y a las tablas virtuales tras culminar la transición CSS
  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName === "width") {
      window.dispatchEvent(new Event("resize"));
    }
  };

  return (
    <TooltipProvider delayDuration={120} skipDelayDuration={300}>
      <aside
        suppressHydrationWarning
        onTransitionEnd={handleTransitionEnd}
        className={cn(
          "bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200 select-none h-full",
          isCollapsed ? "w-14" : "w-56",
          !isMounted ? "transition-none" : "transition-[width] duration-200 ease-in-out",
          className
        )}
      >
        {/* Cabecera del Sidebar: Logo y Botón de Toggle */}
        <div className="h-10 border-b border-slate-200 flex items-center justify-between px-2.5 bg-slate-50/60 shrink-0">
          {!isCollapsed ? (
            <>
              <Link
                href="/"
                className="flex items-center space-x-2 min-w-0 group focus:outline-none"
              >
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs shrink-0 font-mono shadow-xs group-hover:bg-blue-700 transition-colors">
                  P
                </div>
                <div className="flex flex-col min-w-0 whitespace-nowrap overflow-hidden">
                  <span className="text-xs font-bold text-slate-900 tracking-wider uppercase font-mono leading-tight truncate">
                    PROMUNDO
                  </span>
                  <span className="text-3xs text-slate-500 font-mono tracking-widest leading-none truncate">
                    LAND INTELLIGENCE
                  </span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-6 w-6 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 shrink-0 rounded"
                title="Colapsar menú (Ctrl+B)"
                aria-label="Colapsar menú"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    aria-label="Expandir menú (Ctrl+B)"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Expandir menú (Ctrl+B)
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Menú de Navegación de Alta Densidad */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-1.5 space-y-2.5">
          {navigationItems.map((group, groupIdx) => (
            <div key={group.category} className="space-y-0.5">
              {/* Encabezado en modo expandido o separador sutil en modo retraído */}
              {!isCollapsed ? (
                <div className="px-2 py-0.5 text-3xs font-semibold text-slate-400 uppercase tracking-wider font-mono truncate">
                  {group.category}
                </div>
              ) : (
                groupIdx > 0 && (
                  <div className="my-1.5 border-t border-slate-200 mx-2" role="separator" />
                )
              )}

              {/* Items de Navegación */}
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));
                const Icon = item.icon;

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded text-xs font-medium transition-colors relative group",
                      isCollapsed
                        ? "justify-center w-9 h-8 mx-auto"
                        : "justify-between px-2 py-1.5 w-full",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
                    )}
                  >
                    {/* Barra de acento izquierdo para estado activo */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-blue-600 rounded-r" />
                    )}

                    <div className={cn("flex items-center min-w-0", !isCollapsed && "space-x-2")}>
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive
                            ? "text-blue-600"
                            : "text-slate-400 group-hover:text-slate-700"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate whitespace-nowrap">{item.title}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={cn(
                          "text-3xs px-1 py-0.2 rounded font-mono font-bold shrink-0",
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );

                // En modo retraído, envolver el botón en Tooltip flotante a la derecha
                if (isCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        sideOffset={10}
                        className="flex items-center gap-1.5 text-xs py-1 px-2.5 z-50 shadow-md"
                      >
                        <span className="font-sans font-medium text-slate-900">{item.title}</span>
                        {item.badge && (
                          <span className="text-3xs px-1 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                            {item.badge}
                          </span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
              })}
            </div>
          ))}
        </div>

        {/* Footer del Sidebar: Telemetría PostGIS y Versión */}
        <div className="p-2 border-t border-slate-200 bg-slate-50/70 text-2xs font-mono shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-slate-600 text-3xs truncate">PostGIS Online</span>
              </div>
              <span className="text-3xs text-slate-400 shrink-0">v1.0.0</span>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center items-center h-6 cursor-default">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                PostGIS Online (EPSG:4326)
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
