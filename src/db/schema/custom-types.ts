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
    if (!value) return { lat: 0, lng: 0 };

    // 1. Parser para WKT: POINT(longitud latitud)
    const matches = value.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (matches && matches[1] && matches[2]) {
      return {
        lng: parseFloat(matches[1]),
        lat: parseFloat(matches[2]),
      };
    }

    // 2. Parser para EWKB Hex (retornado por PostgreSQL PostGIS nativo)
    if (typeof value === "string" && value.length >= 50 && /^[0-9a-fA-F]+$/.test(value)) {
      try {
        const buf = Buffer.from(value, "hex");
        const lng = buf.readDoubleLE(9);
        const lat = buf.readDoubleLE(17);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      } catch {
        // Fallback en caso de buffer inválido
      }
    }

    return { lat: 0, lng: 0 };
  },
});
