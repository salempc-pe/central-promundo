"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl, { Map as MapLibreMap, Marker, Popup, LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { TerrenoCompleto } from "@/types";
import { MAP_STYLES, MapBaseLayer, LIMA_COORDINATES, DEFAULT_MAP_ZOOM } from "@/lib/map/map-styles";
import {
  Layers,
  Compass,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { cn, formatCurrency, formatPricePerM2 } from "@/lib/utils";

export interface TerrenosMapProps {
  terrenos: TerrenoCompleto[];
  selectedTerrenoId: string | null;
  hoveredTerrenoId: string | null;
  onSelectTerreno: (terreno: TerrenoCompleto) => void;
  onOpenInspect?: (terreno: TerrenoCompleto, defaultTab?: string) => void;
  onHoverTerreno?: (id: string | null) => void;
  className?: string;
}

// Mapeo de colores pasteles Light Theme para marcadores en el mapa
const ZONING_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  RDA: { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe" }, // Púrpura pastel
  RDM: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" }, // Ámbar pastel
  CZ: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },  // Azul pastel
  CM: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },  // Esmeralda pastel
  I1: { bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" },  // Slate
  I2: { bg: "#e2e8f0", text: "#1e293b", border: "#94a3b8" },  // Slate
};

// Mapeo unificado Light Theme para insignias de zonificación en el Popup
const ZONING_BADGE_STYLES: Record<string, string> = {
  RDA: "bg-purple-50 text-purple-700 border-purple-200",
  RDM: "bg-amber-50 text-amber-700 border-amber-200",
  CZ: "bg-blue-50 text-blue-700 border-blue-200",
  CM: "bg-emerald-50 text-emerald-700 border-emerald-200",
  I1: "bg-slate-100 text-slate-800 border-slate-300",
  I2: "bg-slate-200 text-slate-800 border-slate-300",
};

interface MarkerData {
  marker: Marker;
  el: HTMLDivElement;
  containerEl: HTMLDivElement;
  badgeEl: HTMLDivElement | null;
  arrowEl: HTMLDivElement | null;
  priceEl: HTMLSpanElement | null;
}

export function TerrenosMap({
  terrenos,
  selectedTerrenoId,
  hoveredTerrenoId,
  onSelectTerreno,
  onOpenInspect,
  onHoverTerreno,
  className,
}: TerrenosMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, MarkerData>>(new Map());
  const popupRef = useRef<Popup | null>(null);

  // Banderas de control de cámara y persistencia de viewport
  const hasInitialFittedRef = useRef<boolean>(false);
  const prevTerrenosKeyRef = useRef<string>("");

  // Referencias estables para desacoplar el ciclo de vida de los marcadores de funciones inline
  const onSelectTerrenoRef = useRef(onSelectTerreno);
  onSelectTerrenoRef.current = onSelectTerreno;

  const onOpenInspectRef = useRef(onOpenInspect);
  onOpenInspectRef.current = onOpenInspect;

  const onHoverTerrenoRef = useRef(onHoverTerreno);
  onHoverTerrenoRef.current = onHoverTerreno;

  const selectedTerrenoIdRef = useRef(selectedTerrenoId);
  selectedTerrenoIdRef.current = selectedTerrenoId;

  const [baseLayer, setBaseLayer] = useState<MapBaseLayer>("positron");
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 1. Inicialización de la instancia de MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES.positron,
      center: LIMA_COORDINATES,
      zoom: DEFAULT_MAP_ZOOM,
      pitch: 0,
      minPitch: 0,
      maxPitch: 0,
      dragRotate: false,
      touchPitch: false,
      pitchWithRotate: false,
      attributionControl: false,
    });

    // Bloqueo estricto e inmutable de inclinación y rotación (Perspectiva 2D Cenital Permanente)
    map.dragRotate.disable();
    map.touchPitch.disable();
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();

    // Listener defensivo: garantizar que cualquier intento interno o externo de pitch quede forzado a 0
    map.on("pitch", () => {
      if (map.getPitch() !== 0) {
        map.setPitch(0);
      }
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.on("load", () => {
      setIsMapLoaded(true);
    });

    mapRef.current = map;

    // Observador para redimensionar el canvas ante cambios de ancho
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (popupRef.current) {
        popupRef.current.remove();
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Cambio reactivo de Estilo Base (Vector / Satélite / Voyager)
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    mapRef.current.setStyle(MAP_STYLES[baseLayer]);
  }, [baseLayer, isMapLoaded]);

  // 3. EFECTO A: Creación y sincronización de marcadores (SOLO ante cambio de datos o carga del mapa)
  // Desacoplado por completo de la cámara y del estado de hover
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    // Limpiar marcadores previos
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    terrenos.forEach((t) => {
      const lat = Number(t.latitud || t.geom?.lat);
      const lng = Number(t.longitud || t.geom?.lng);

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      const zoningConfig = ZONING_COLORS[t.zonificacion] || {
        bg: "#f1f5f9",
        text: "#334155",
        border: "#cbd5e1",
      };

      // Dot de Estado
      const statusDotColor =
        t.estadoTerreno === "Disponible"
          ? "#10b981"
          : t.estadoTerreno === "En Negociacion"
          ? "#f59e0b"
          : t.estadoTerreno === "Vendido"
          ? "#ef4444"
          : "#94a3b8";

      // Crear elemento HTML personalizado para el pin en Light Theme Bloomberg
      // El nodo raíz 'el' NO tiene transiciones ni escala para permitir a MapLibre actualizar 'transform' a 60fps sin lag
      const el = document.createElement("div");
      el.dataset.terrenoId = t.id;
      el.className = "cursor-pointer select-none";

      el.innerHTML = `
        <div class="pin-container flex flex-col items-center transition-transform duration-150 ease-out will-change-transform group hover:scale-105">
          <div class="pin-badge" style="
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
            border: 1.5px solid #cbd5e1;
            background-color: #ffffff;
            color: #0f172a;
            transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
          ">
            <span style="
              display: inline-block;
              width: 6px;
              height: 6px;
              border-radius: 9999px;
              background-color: ${statusDotColor};
            "></span>
            <span style="
              background-color: ${zoningConfig.bg};
              color: ${zoningConfig.text};
              border: 1px solid ${zoningConfig.border};
              padding: 0 3px;
              border-radius: 2px;
              font-size: 9px;
              line-height: 12px;
            ">${t.zonificacion}</span>
            <span class="pin-price" style="letter-spacing: -0.025em; color: #0f172a;">$${Number(t.precioM2).toLocaleString("en-US")}</span>
          </div>
          <div class="pin-arrow" style="
            width: 8px;
            height: 8px;
            margin-top: -4px;
            transform: rotate(45deg);
            border-right: 1.5px solid #cbd5e1;
            border-bottom: 1.5px solid #cbd5e1;
            background-color: #ffffff;
            transition: background-color 0.15s ease, border-color 0.15s ease;
          "></div>
        </div>
      `;

      // Eventos del marcador usando referencias desacopladas
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectTerrenoRef.current(t);
      });

      el.addEventListener("mouseenter", () => {
        onHoverTerrenoRef.current?.(t.id);
      });

      el.addEventListener("mouseleave", () => {
        onHoverTerrenoRef.current?.(null);
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .addTo(map);

      const containerEl = el.querySelector<HTMLDivElement>(".pin-container")!;
      const badgeEl = el.querySelector<HTMLDivElement>(".pin-badge");
      const arrowEl = el.querySelector<HTMLDivElement>(".pin-arrow");
      const priceEl = el.querySelector<HTMLSpanElement>(".pin-price");

      markersRef.current.set(t.id, { marker, el, containerEl, badgeEl, arrowEl, priceEl });
    });
  }, [terrenos, isMapLoaded]);

  // 4. EFECTO B: Actualización visual atómica de Selección y Hover (SIN tocar la cámara ni recrear nodos)
  useEffect(() => {
    markersRef.current.forEach(({ el, containerEl, badgeEl, arrowEl, priceEl }, id) => {
      const isSelected = id === selectedTerrenoId;
      const isHovered = id === hoveredTerrenoId;

      // Actualizar z-index en el nodo raíz de MapLibre
      el.style.zIndex = isSelected ? "50" : isHovered ? "40" : "20";

      // Aplicar escala suave exclusivamente sobre el contenedor hijo
      containerEl.className = cn(
        "pin-container flex flex-col items-center transition-transform duration-150 ease-out will-change-transform group",
        isSelected
          ? "scale-110"
          : isHovered
          ? "scale-105"
          : "hover:scale-105"
      );

      if (badgeEl && arrowEl && priceEl) {
        if (isSelected) {
          badgeEl.style.borderColor = "#2563eb";
          badgeEl.style.backgroundColor = "#2563eb";
          badgeEl.style.color = "#ffffff";
          priceEl.style.color = "#ffffff";

          arrowEl.style.borderRightColor = "#2563eb";
          arrowEl.style.borderBottomColor = "#2563eb";
          arrowEl.style.backgroundColor = "#2563eb";
        } else if (isHovered) {
          badgeEl.style.borderColor = "#3b82f6";
          badgeEl.style.backgroundColor = "#eff6ff";
          badgeEl.style.color = "#1d4ed8";
          priceEl.style.color = "#1d4ed8";

          arrowEl.style.borderRightColor = "#3b82f6";
          arrowEl.style.borderBottomColor = "#3b82f6";
          arrowEl.style.backgroundColor = "#eff6ff";
        } else {
          badgeEl.style.borderColor = "#cbd5e1";
          badgeEl.style.backgroundColor = "#ffffff";
          badgeEl.style.color = "#0f172a";
          priceEl.style.color = "#0f172a";

          arrowEl.style.borderRightColor = "#cbd5e1";
          arrowEl.style.borderBottomColor = "#cbd5e1";
          arrowEl.style.backgroundColor = "#ffffff";
        }
      }
    });
  }, [selectedTerrenoId, hoveredTerrenoId]);

  // 5. EFECTO C: Control de Cámara Inteligente (Auto-fit solo en carga inicial o cambio real de filtros)
  // Preserva el zoom y la posición exacta si el usuario navega, hace pan o zoom libre
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || terrenos.length === 0) return;

    const currentKey = terrenos.map((t) => t.id).sort().join(",");
    const isFirstTime = !hasInitialFittedRef.current;
    const filtersChanged = hasInitialFittedRef.current && prevTerrenosKeyRef.current !== currentKey;

    // Solo ajustar límites si es la carga inicial o si la lista de terrenos cambió por filtros intencionales
    // Y únicamente cuando no haya un lote seleccionado individualmente
    if ((isFirstTime || filtersChanged) && !selectedTerrenoIdRef.current) {
      const bounds = new LngLatBounds();
      let validCount = 0;

      terrenos.forEach((t) => {
        const lat = Number(t.latitud || t.geom?.lat);
        const lng = Number(t.longitud || t.geom?.lng);
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          bounds.extend([lng, lat]);
          validCount++;
        }
      });

      if (validCount > 0) {
        mapRef.current.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 60, right: 60 },
          maxZoom: 14.5,
          duration: isFirstTime ? 800 : 500,
          pitch: 0,
          bearing: 0,
          linear: true,
        });
        hasInitialFittedRef.current = true;
        prevTerrenosKeyRef.current = currentKey;
      }
    } else if (filtersChanged) {
      // Sincronizar clave si no se ajustó la cámara por estar seleccionado un lote
      prevTerrenosKeyRef.current = currentKey;
    }
  }, [terrenos, isMapLoaded]);

  // 4. Centrado suave (flyTo) y despliegue de popup al seleccionar un terreno
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;
    const map = mapRef.current;

    if (!selectedTerrenoId) {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      return;
    }

    const t = terrenos.find((item) => item.id === selectedTerrenoId);
    if (!t) return;

    const lat = Number(t.latitud || t.geom?.lat);
    const lng = Number(t.longitud || t.geom?.lng);

    if (lat && lng) {
      map.easeTo({
        center: [lng, lat],
        zoom: 16.0,
        pitch: 0,
        bearing: 0,
        essential: true,
        duration: 500,
        easing: (k) => k * (2 - k),
      });

      // Crear Popup HUD interactivo
      if (popupRef.current) {
        popupRef.current.remove();
      }

      const docCpu = t.documentos?.find((d) => d.tipoDocumento === "Certificado_Parametros");
      const cpuVencimiento = docCpu?.fechaVencimiento
        ? new Date(docCpu.fechaVencimiento).toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" })
        : null;

      const zoningStyle = ZONING_BADGE_STYLES[t.zonificacion] || "bg-slate-100 text-slate-700 border-slate-300";

      const statusStyle =
        t.estadoTerreno === "Disponible"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : t.estadoTerreno === "En Negociacion"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-rose-50 text-rose-700 border-rose-200";

      const popupNode = document.createElement("div");
      popupNode.className = "p-3.5 font-sans text-slate-800 w-[340px] sm:w-[360px] select-none";
      popupNode.innerHTML = `
        <!-- Header: Código a la izquierda + Badges agrupados a la derecha con pr-8 para despejar botón [X] -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 pr-8 gap-2">
          <span class="font-mono font-bold text-xs text-blue-700 tracking-tight shrink-0">${t.codigoInterno}</span>
          <div class="flex items-center gap-1.5 flex-wrap justify-end">
            <span class="text-2xs px-1.5 py-0.5 rounded font-mono font-semibold border ${statusStyle} shrink-0">
              ${t.estadoTerreno}
            </span>
            <span class="text-2xs font-mono font-bold px-1.5 py-0.5 rounded border ${zoningStyle} shrink-0">
              ${t.zonificacion}
            </span>
          </div>
        </div>

        <!-- Datos de Ubicación: Multilínea legible sin truncate rígido -->
        <div class="mb-2.5 space-y-0.5">
          <div class="text-xs font-semibold text-slate-900 leading-snug line-clamp-2 break-words">${t.direccion}</div>
          <div class="text-2xs text-slate-500 leading-normal break-words">
            <span class="font-medium text-slate-700">${t.distrito}</span>
            ${t.referencia ? `<span class="text-slate-400 mx-1">•</span><span class="text-slate-500">Ref: ${t.referencia}</span>` : ""}
          </div>
        </div>

        <!-- Métricas Clave Bloomberg Grid -->
        <div class="grid grid-cols-2 gap-2 bg-slate-50/90 p-2 rounded border border-slate-200/80 font-mono mb-2.5">
          <div>
            <span class="text-slate-400 block text-2xs font-semibold uppercase tracking-wider">ÁREA</span>
            <span class="text-slate-800 font-bold text-xs">${Number(t.areaM2).toLocaleString("en-US")} m²</span>
          </div>
          <div>
            <span class="text-slate-400 block text-2xs font-semibold uppercase tracking-wider">ALTURA</span>
            <span class="text-slate-800 font-bold text-xs">${t.alturaMaxPisos ? `${t.alturaMaxPisos} pisos` : "-"}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-2xs font-semibold uppercase tracking-wider">PRECIO/M²</span>
            <span class="text-emerald-700 font-bold text-xs">${formatPricePerM2(Number(t.precioM2), t.moneda)}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-2xs font-semibold uppercase tracking-wider">TOTAL</span>
            <span class="text-slate-950 font-bold text-xs">${formatCurrency(Number(t.precioTotal), t.moneda)}</span>
          </div>
        </div>

        <!-- Indicador CPU sin emojis con SVG profesional -->
        ${
          docCpu
            ? `<div class="flex items-center space-x-1.5 text-2xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded mb-2.5">
                <svg class="w-3 h-3 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span class="truncate"><strong class="font-semibold">CPU:</strong> ${cpuVencimiento ? `Vence ${cpuVencimiento}` : "Registrado"}</span>
              </div>`
            : `<div class="flex items-center space-x-1.5 text-2xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded mb-2.5">
                <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <span>Sin Certificado de Parámetros</span>
              </div>`
        }

        <!-- Botón CTA Corporativo -->
        <button id="btn-sheet-inspect" class="w-full h-7 flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded text-2xs font-semibold font-mono tracking-tight transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer">
          <span>Abrir Inspección Técnica</span>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      `;

      // Evento de apertura de Sheet desde el Popup
      const inspectBtn = popupNode.querySelector("#btn-sheet-inspect");
      if (inspectBtn) {
        inspectBtn.addEventListener("click", () => {
          if (onOpenInspectRef.current) {
            onOpenInspectRef.current(t, "ficha");
          } else {
            onSelectTerrenoRef.current(t);
          }
        });
      }

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: "360px",
        className: "promundo-map-popup",
      })
        .setLngLat([lng, lat])
        .setDOMContent(popupNode)
        .addTo(map);

      popupRef.current = popup;
    }
  }, [selectedTerrenoId, terrenos, isMapLoaded, onSelectTerreno]);

  // Manejador para centrar en Lima Metropolitana
  const handleResetLima = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      center: LIMA_COORDINATES,
      zoom: DEFAULT_MAP_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: 500,
      easing: (k) => k * (2 - k),
    });
  }, []);

  // Manejador para ajustar la vista a todos los pines
  const handleFitAll = useCallback(() => {
    if (!mapRef.current || terrenos.length === 0) return;
    const bounds = new LngLatBounds();
    let hasCoords = false;

    terrenos.forEach((t) => {
      const lat = Number(t.latitud || t.geom?.lat);
      const lng = Number(t.longitud || t.geom?.lng);
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        bounds.extend([lng, lat]);
        hasCoords = true;
      }
    });

    if (hasCoords) {
      mapRef.current.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 15,
        duration: 500,
        pitch: 0,
        bearing: 0,
        linear: true,
      });
    }
  }, [terrenos]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-slate-100 select-none", className)}>
      {/* Contenedor WebGL Canvas de MapLibre */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Selector de Capa Base (Vector / Satélite / Voyager) */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center bg-white/95 backdrop-blur border border-slate-200 rounded p-0.5 shadow-sm space-x-0.5 font-mono text-3xs">
        <button
          type="button"
          onClick={() => setBaseLayer("positron")}
          className={cn(
            "px-2 py-1 rounded transition-colors flex items-center space-x-1",
            baseLayer === "positron"
              ? "bg-blue-600 text-white font-semibold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          <Layers className="w-2.5 h-2.5" />
          <span>Vector Positron</span>
        </button>
        <button
          type="button"
          onClick={() => setBaseLayer("satellite")}
          className={cn(
            "px-2 py-1 rounded transition-colors flex items-center space-x-1",
            baseLayer === "satellite"
              ? "bg-blue-600 text-white font-semibold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          <span>Satélite (Esri)</span>
        </button>
        <button
          type="button"
          onClick={() => setBaseLayer("voyager")}
          className={cn(
            "px-2 py-1 rounded transition-colors flex items-center space-x-1",
            baseLayer === "voyager"
              ? "bg-blue-600 text-white font-semibold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          <span>Voyager</span>
        </button>
      </div>

      {/* Controles de Navegación y Zoom Flotantes */}
      <div className="absolute bottom-6 right-2.5 z-20 flex flex-col bg-white/95 backdrop-blur border border-slate-200 rounded shadow-md overflow-hidden divide-y divide-slate-100">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="Acercar (Zoom +)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="Alejar (Zoom -)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleFitAll}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="Encuadre de todos los lotes"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleResetLima}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="Centrar en Lima Metropolitana"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
