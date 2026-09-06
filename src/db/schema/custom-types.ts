import { customType } from "drizzle-orm/pg-core";

export interface PointGeometry {
  lat: number;
  lng: number;
}

/**
 * Custom Drizzle Type para columnas PostGIS GEOMETRY(Point, 4326)
 * Permite manejar latitud y longitud tipadas y transformar automáticamente a formato WKT o GeoJSON.
 */
export const postgisGeometryPoint = customType<{
  data: PointGeometry;
  driverData: string;
}>({
  dataType() {
    return "geometry(Point, 4326)";
  },
  toDriver(value: PointGeometry): string {
    return `SRID=4326;POINT(${value.lng} ${value.lat})`;
  },
  fromDriver(value: string): PointGeometry {
    // Parser simple para WKT: POINT(longitud latitud)
    if (!value) return { lat: 0, lng: 0 };
    const matches = value.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (matches && matches[1] && matches[2]) {
      return {
        lng: parseFloat(matches[1]),
        lat: parseFloat(matches[2]),
      };
    }
    return { lat: 0, lng: 0 };
  },
});
