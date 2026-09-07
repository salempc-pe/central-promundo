"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl, { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLES } from "@/lib/map/map-styles";
import {
  LIMA_DISTRICT_BOUNDS,
  validateTerrenoCoordinates,
} from "@/lib/map/geo-validator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Compass,
  X,
} from "lucide-react";

interface GeocodeResult {
  display_name: string;
  lat: number;
  lng: number;
  calle?: string;
  numero?: string;
  distrito?: string;
}

interface TerrenoLocationPickerProps {
  distrito: string;
  latitud: number;
  longitud: number;
  onChangeCoordinates: (lat: number, lng: number) => void;
  onSelectAddressSuggestion?: (direccion: string) => void;
  className?: string;
}

function getCentroidForDistrict(dist: string): { lat: number; lng: number } {
  const bounds = LIMA_DISTRICT_BOUNDS[dist];
  if (bounds) {
    return {
      lat: Number(((bounds.minLat + bounds.maxLat) / 2).toFixed(7)),
      lng: Number(((bounds.minLng + bounds.maxLng) / 2).toFixed(7)),
    };
  }
  return { lat: -12.1192, lng: -77.0298 };
}

export function TerrenoLocationPicker({
  distrito,
  latitud,
  longitud,
  onChangeCoordinates,
  onSelectAddressSuggestion,
  className = "",
}: TerrenoLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Validation state
  const validation = validateTerrenoCoordinates(distrito, latitud, longitud);

  const onChangeCoordinatesRef = useRef(onChangeCoordinates);
  useEffect(() => {
    onChangeCoordinatesRef.current = onChangeCoordinates;
  });

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = [
      isNaN(longitud) || longitud === 0 ? -77.03 : longitud,
      isNaN(latitud) || latitud === 0 ? -12.12 : latitud,
    ];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES.positron,
      center: initialCenter,
      zoom: 15,
      pitch: 0,
      minPitch: 0,
      maxPitch: 0,
      dragRotate: false,
      touchPitch: false,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false, showZoom: true }),
      "top-right"
    );

    // Custom Draggable Pin Element
    const pinEl = document.createElement("div");
    pinEl.className = "cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-full";
    pinEl.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
      ">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          background: #2563eb;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
        ">
          <div style="
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ffffff;
            transform: rotate(45deg);
          "></div>
        </div>
      </div>
    `;

    const marker = new maplibregl.Marker({
      element: pinEl,
      draggable: true,
    })
      .setLngLat(initialCenter)
      .addTo(map);

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      onChangeCoordinatesRef.current(
        Number(lngLat.lat.toFixed(7)),
        Number(lngLat.lng.toFixed(7))
      );
    });

    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      onChangeCoordinatesRef.current(
        Number(e.lngLat.lat.toFixed(7)),
        Number(e.lngLat.lng.toFixed(7))
      );
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Sync marker and camera when latitud/longitud props change from outside
  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return;
    const current = markerRef.current.getLngLat();
    if (
      Math.abs(current.lat - latitud) > 0.000001 ||
      Math.abs(current.lng - longitud) > 0.000001
    ) {
      markerRef.current.setLngLat([longitud, latitud]);
      mapRef.current.easeTo({
        center: [longitud, latitud],
        duration: 400,
      });
    }
  }, [latitud, longitud]);

  // 3. Search debounced execution
  const searchAddress = useCallback(
    async (queryText: string) => {
      if (!queryText.trim() || queryText.trim().length < 3) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const url = `/api/geocode?q=${encodeURIComponent(queryText)}&distrito=${encodeURIComponent(distrito)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setShowResults(true);
        }
      } catch (err) {
        console.warn("Error geocoding:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [distrito]
  );

  const handleSelectResult = (res: GeocodeResult) => {
    setShowResults(false);
    setSearchQuery(res.display_name.split(",")[0]);

    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat([res.lng, res.lat]);
      mapRef.current.easeTo({
        center: [res.lng, res.lat],
        zoom: 16.5,
        duration: 600,
      });
    }

    onChangeCoordinates(Number(res.lat.toFixed(7)), Number(res.lng.toFixed(7)));

    if (onSelectAddressSuggestion) {
      const cleanAddr =
        res.calle && res.numero
          ? `${res.calle} ${res.numero}`
          : res.display_name.split(",").slice(0, 2).join(",");
      onSelectAddressSuggestion(cleanAddr);
    }
  };

  const handleResetToDistrictCentroid = () => {
    const centroid = getCentroidForDistrict(distrito);
    onChangeCoordinates(centroid.lat, centroid.lng);
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat([centroid.lng, centroid.lat]);
      mapRef.current.easeTo({
        center: [centroid.lng, centroid.lat],
        zoom: 15,
        duration: 500,
      });
    }
  };

  return (
    <div className={`space-y-2 font-mono ${className}`}>
      {/* Buscador de dirección y referencia rápida */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchAddress(e.target.value);
            }}
            placeholder={`Buscar calle, jirón o avenida en ${distrito}...`}
            className="h-8 pl-8 pr-16 text-xs bg-white border-slate-300 focus:border-blue-500 font-sans"
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin mr-1" />
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setResults([]);
                  setShowResults(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetToDistrictCentroid}
              title="Centrar en el distrito"
              className="h-6 px-1.5 text-3xs font-mono text-slate-600 hover:bg-slate-100"
            >
              <Compass className="w-3 h-3 text-slate-500" />
            </Button>
          </div>
        </div>

        {/* Dropdown de sugerencias de autocompletado */}
        {showResults && results.length > 0 && (
          <div className="absolute z-50 left-0 right-0 top-9 bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs font-sans">
            {results.map((r, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectResult(r)}
                className="px-3 py-2 hover:bg-blue-50/70 cursor-pointer flex items-start gap-2 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 truncate">
                    {r.calle ? `${r.calle} ${r.numero}` : r.display_name.split(",")[0]}
                  </div>
                  <div className="text-3xs text-slate-500 truncate">
                    {r.display_name}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-3xs px-1 py-0 border-slate-200 text-slate-500 shrink-0 font-mono"
                >
                  {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contenedor del Mapa MapLibre (Estilo claro Bloomberg) */}
      <div className="relative w-full h-[220px] rounded border border-slate-200 overflow-hidden bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Overlay informativo flotante: Coordenadas actuales */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2 py-1 rounded border border-slate-200 text-3xs font-mono shadow-xs flex items-center gap-2">
          <span className="text-slate-400">COORD:</span>
          <span className="font-bold text-slate-800">
            {latitud.toFixed(6)}, {longitud.toFixed(6)}
          </span>
        </div>

        {/* Semáforo de validación en tiempo real */}
        <div className="absolute top-2 left-2">
          {validation.valid ? (
            <div className="bg-emerald-50/95 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded text-3xs font-mono font-medium flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>✓ Ubicación en {distrito}</span>
            </div>
          ) : (
            <div className="bg-rose-50/95 border border-rose-200 text-rose-700 px-2 py-0.5 rounded text-3xs font-mono font-medium flex items-center gap-1 shadow-xs">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>{validation.error?.split(".")[0] || "Ubicación fuera de límites"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Guía de uso rápido para el operador fiduciario */}
      <div className="flex items-center justify-between text-3xs text-slate-500 px-0.5">
        <span>💡 Arrastra el pin azul o haz clic sobre el mapa para fijar la ubicación exacta.</span>
        <span className="text-slate-400 font-mono">WGS84 EPSG:4326</span>
      </div>
    </div>
  );
}
