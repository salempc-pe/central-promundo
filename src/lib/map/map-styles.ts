import { StyleSpecification } from "maplibre-gl";

export type MapBaseLayer = "positron" | "voyager" | "satellite";

export const LIMA_COORDINATES: [number, number] = [-77.0374, -12.1000]; // [lng, lat]
export const DEFAULT_MAP_ZOOM = 12.5;

/**
 * Configuraciones de capas base cartográficas sin dependencias de API Keys
 */
export const MAP_STYLES: Record<MapBaseLayer, string | StyleSpecification> = {
  positron: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  satellite: {
    version: 8,
    sources: {
      "esri-satellite": {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Tiles © Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      },
      "esri-labels": {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: "satellite-tiles",
        type: "raster",
        source: "esri-satellite",
        minzoom: 0,
        maxzoom: 20,
      },
      {
        id: "satellite-labels",
        type: "raster",
        source: "esri-labels",
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  },
};
