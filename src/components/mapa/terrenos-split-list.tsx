"use client";

import React, { useState, useMemo } from "react";
import { TerrenoCompleto } from "@/types";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building,
  Building2,
  MapPin,
  FileCheck,
  Users,
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatPricePerM2 } from "@/lib/utils";
import { getZonificacionBadgeClass } from "@/lib/constants/zonificaciones";

interface TerrenosSplitListProps {
  terrenos: TerrenoCompleto[];
  selectedTerrenoId: string | null;
  hoveredTerrenoId: string | null;
  onSelectTerreno: (terreno: TerrenoCompleto) => void;
  onOpenInspect?: (terreno: TerrenoCompleto, defaultTab?: string) => void;
  onHoverTerreno?: (id: string | null) => void;
  className?: string;
}

type SortField = "precioM2" | "areaM2" | "precioTotal" | "codigoInterno" | "alturaMaxPisos";

export function TerrenosSplitList({
  terrenos,
  selectedTerrenoId,
  hoveredTerrenoId,
  onSelectTerreno,
  onOpenInspect,
  onHoverTerreno,
  className,
}: TerrenosSplitListProps) {
  const [listSearch, setListSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("precioM2");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filtrado y ordenamiento local de la lista
  const sortedAndFiltered = useMemo(() => {
    let result = [...terrenos];

    if (listSearch.trim()) {
      const q = listSearch.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.codigoInterno.toLowerCase().includes(q) ||
          t.distrito.toLowerCase().includes(q) ||
          t.direccion.toLowerCase().includes(q) ||
          t.zonificacion.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (sortBy === "precioM2") {
        valA = Number(a.precioM2) || 0;
        valB = Number(b.precioM2) || 0;
      } else if (sortBy === "areaM2") {
        valA = Number(a.areaM2) || 0;
        valB = Number(b.areaM2) || 0;
      } else if (sortBy === "precioTotal") {
        valA = Number(a.precioTotal) || 0;
        valB = Number(b.precioTotal) || 0;
      } else if (sortBy === "alturaMaxPisos") {
        valA = a.alturaMaxPisos || 0;
        valB = b.alturaMaxPisos || 0;
      } else if (sortBy === "codigoInterno") {
        valA = a.codigoInterno;
        valB = b.codigoInterno;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return result;
  }, [terrenos, listSearch, sortBy, sortOrder]);

  // Métricas rápidas del subconjunto de lotes
  const stats = useMemo(() => {
    if (terrenos.length === 0) return { avgPriceM2: 0, totalArea: 0, totalValue: 0 };
    const totalArea = terrenos.reduce((sum, t) => sum + (Number(t.areaM2) || 0), 0);
    const totalValue = terrenos.reduce((sum, t) => sum + (Number(t.precioTotal) || 0), 0);
    const avgPriceM2 = totalArea > 0 ? totalValue / totalArea : 0;
    return { avgPriceM2, totalArea, totalValue };
  }, [terrenos]);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-slate-50 border-l border-slate-200 text-slate-800 select-none", className)}>
      <div className="p-2 border-b border-slate-200 space-y-2 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              INVENTARIO MAPA
            </span>
            <span className="text-3xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
              {sortedAndFiltered.length} lotes
            </span>
          </div>

          <div className="flex items-center space-x-1 text-3xs font-mono text-slate-500">
            <span>Prom:</span>
            <span className="text-emerald-700 font-bold">
              ${Math.round(stats.avgPriceM2).toLocaleString("en-US")}/m²
            </span>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
          <Input
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            placeholder="Filtrar por código, distrito, calle..."
            className="h-7 pl-7 pr-2 text-xs bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-sm focus:bg-white"
          />
        </div>

        <div className="flex items-center justify-between text-3xs font-mono text-slate-500 pt-0.5">
          <span className="text-slate-400">Ordenar por:</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => toggleSort("precioM2")}
              className={cn(
                "px-1.5 py-0.5 rounded transition-colors flex items-center space-x-0.5",
                sortBy === "precioM2" ? "bg-blue-50 text-blue-700 font-bold border border-blue-200" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <span>$/m²</span>
              {sortBy === "precioM2" && (sortOrder === "asc" ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />)}
            </button>

            <button
              onClick={() => toggleSort("areaM2")}
              className={cn(
                "px-1.5 py-0.5 rounded transition-colors flex items-center space-x-0.5",
                sortBy === "areaM2" ? "bg-blue-50 text-blue-700 font-bold border border-blue-200" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <span>Área</span>
              {sortBy === "areaM2" && (sortOrder === "asc" ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />)}
            </button>

            <button
              onClick={() => toggleSort("precioTotal")}
              className={cn(
                "px-1.5 py-0.5 rounded transition-colors flex items-center space-x-0.5",
                sortBy === "precioTotal" ? "bg-blue-50 text-blue-700 font-bold border border-blue-200" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <span>Total</span>
              {sortBy === "precioTotal" && (sortOrder === "asc" ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />)}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sortedAndFiltered.length === 0 ? (
          <div className="p-8 text-center font-mono text-2xs text-slate-400 space-y-1">
            <Building2 className="w-6 h-6 mx-auto text-slate-300 opacity-60" />
            <div>No hay lotes que coincidan con la búsqueda</div>
          </div>
        ) : (
          sortedAndFiltered.map((terreno) => {
            const isSelected = selectedTerrenoId === terreno.id;
            const isHovered = hoveredTerrenoId === terreno.id;
            const docCpu = terreno.documentos?.find((d) => d.tipoDocumento === "Certificado_Parametros");

            return (
              <div
                key={terreno.id}
                onClick={() => onSelectTerreno(terreno)}
                onMouseEnter={() => onHoverTerreno?.(terreno.id)}
                onMouseLeave={() => onHoverTerreno?.(null)}
                className={cn(
                  "p-2 rounded border transition-all cursor-pointer group relative pt-2 bg-white",
                  isSelected
                    ? "border-blue-500 ring-1 ring-blue-500 shadow-md bg-blue-50/30"
                    : isHovered
                    ? "border-slate-300 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-xs text-blue-600 group-hover:text-blue-800">
                      {terreno.codigoInterno}
                    </span>
                    <Badge
                      variant={
                        terreno.estadoTerreno === "Disponible"
                          ? "success"
                          : terreno.estadoTerreno === "En Negociacion"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-3xs px-1 py-0 font-medium font-mono"
                    >
                      {terreno.estadoTerreno}
                    </Badge>
                  </div>

                  <span
                    className={cn(
                      "text-3xs font-mono font-bold px-1.5 py-0.2 rounded border",
                      getZonificacionBadgeClass(terreno.zonificacion)
                    )}
                  >
                    {terreno.zonificacion}
                  </span>
                </div>

                <div className="text-2xs font-semibold text-slate-800 truncate">
                  {terreno.direccion}
                </div>
                <div className="text-3xs text-slate-500 flex items-center space-x-1 mb-1.5">
                  <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  <span className="truncate">{terreno.distrito} {terreno.referencia ? `(${terreno.referencia})` : ""}</span>
                </div>

                <div className="grid grid-cols-4 gap-1 py-1 px-1.5 bg-slate-50 rounded border border-slate-200 text-3xs font-mono mb-1.5">
                  <div>
                    <span className="text-slate-500 block text-4xs">ÁREA</span>
                    <span className="text-slate-800 font-bold">{Number(terreno.areaM2).toLocaleString()}m²</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-4xs">ALTURA</span>
                    <span className="text-slate-800 font-bold">{terreno.alturaMaxPisos ? `${terreno.alturaMaxPisos}p` : "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-4xs">PRECIO/M²</span>
                    <span className="text-emerald-700 font-bold">{formatPricePerM2(Number(terreno.precioM2), terreno.moneda)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-4xs">TOTAL</span>
                    <span className="text-slate-900 font-bold truncate block">{formatCurrency(Number(terreno.precioTotal), terreno.moneda)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center space-x-1 text-3xs font-mono">
                    {docCpu ? (
                      <span className="inline-flex items-center text-blue-700 bg-blue-50 border border-blue-200 px-1 rounded">
                        <FileCheck className="w-2.5 h-2.5 mr-0.5 text-blue-600" />
                        CPU Adjunto
                      </span>
                    ) : (
                      <span className="text-slate-400 text-3xs">Sin CPU</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (onOpenInspect || onSelectTerreno)(terreno, "matching")}
                      className="h-5 px-1.5 text-3xs font-mono font-semibold text-slate-600 hover:text-blue-700 hover:bg-slate-100 gap-0.5"
                      title="Ver cruce de constructoras"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                      <span>Matching</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => (onOpenInspect || onSelectTerreno)(terreno, "ficha")}
                      className="h-5 px-1.5 text-3xs font-mono font-bold bg-blue-600 hover:bg-blue-700 text-white gap-0.5"
                    >
                      <span>Ficha</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
