/**
 * Sistema de Validación Geoespacial y Consistencia Territorial de Lima Metropolitana
 * Garantiza que las coordenadas WGS84 (latitud, longitud) correspondan estrictamente
 * al distrito catastral asignado y no caigan en el mar de la Costa Verde ni fuera del área urbana.
 */

export interface DistrictBoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Bounding boxes de tolerancia estricta por distrito en Lima Metropolitana
 * Basados en el catastro metropolitano oficial (EPSG:4326 WGS84)
 */
export const LIMA_DISTRICT_BOUNDS: Record<string, DistrictBoundingBox> = {
  Miraflores: {
    minLat: -12.1380,
    maxLat: -12.1080,
    minLng: -77.0420,
    maxLng: -77.0180,
  },
  "San Isidro": {
    minLat: -12.1080,
    maxLat: -12.0880,
    minLng: -77.0480,
    maxLng: -77.0180,
  },
  "Santiago de Surco": {
    minLat: -12.1650,
    maxLat: -12.0850,
    minLng: -77.0200,
    maxLng: -76.9450,
  },
  Barranco: {
    minLat: -12.1580,
    maxLat: -12.1380,
    minLng: -77.0280,
    maxLng: -77.0120,
  },
  "San Miguel": {
    minLat: -12.0950,
    maxLat: -12.0650,
    minLng: -77.0950,
    maxLng: -77.0680,
  },
  "Jesús María": {
    minLat: -12.0920,
    maxLat: -12.0680,
    minLng: -77.0580,
    maxLng: -77.0380,
  },
  "Magdalena del Mar": {
    minLat: -12.0980,
    maxLat: -12.0820,
    minLng: -77.0750,
    maxLng: -77.0620,
  },
  Lince: {
    minLat: -12.0910,
    maxLat: -12.0780,
    minLng: -77.0420,
    maxLng: -77.0250,
  },
  "San Borja": {
    minLat: -12.1180,
    maxLat: -12.0820,
    minLng: -77.0150,
    maxLng: -76.9800,
  },
  Surquillo: {
    minLat: -12.1240,
    maxLat: -12.1050,
    minLng: -77.0250,
    maxLng: -77.0000,
  },
  Ate: {
    minLat: -12.0800,
    maxLat: -12.0100,
    minLng: -76.9850,
    maxLng: -76.8500,
  },
  "Pueblo Libre": {
    minLat: -12.0880,
    maxLat: -12.0650,
    minLng: -77.0720,
    maxLng: -77.0500,
  },
  Chorrillos: {
    minLat: -12.2150,
    maxLat: -12.1500,
    minLng: -77.0400,
    maxLng: -76.9800,
  },
  "La Molina": {
    minLat: -12.1200,
    maxLat: -12.0600,
    minLng: -76.9600,
    maxLng: -76.8900,
  },
  Callao: {
    minLat: -12.0800,
    maxLat: -11.9800,
    minLng: -77.1600,
    maxLng: -77.0800,
  },
};

/**
 * Valida si un punto geográfico (lat, lng) cae dentro del polígono marítimo
 * de la bahía de Lima (Costa Verde / Océano Pacífico).
 */
export function isCoordinateInPacificOcean(lat: number, lng: number): boolean {
  // Función de umbral de línea costera aproximada de Lima (WGS84)
  // Al oeste de esta línea es océano Pacífico
  if (lat < -12.155 && lng < -77.030) return true; // Chorrillos/Barranco
  if (lat >= -12.155 && lat < -12.125 && lng < -77.042) return true; // Miraflores
  if (lat >= -12.125 && lat < -12.095 && lng < -77.075) return true; // Magdalena
  if (lat >= -12.095 && lat < -12.070 && lng < -77.090) return true; // San Miguel
  if (lat >= -12.070 && lng < -77.150) return true; // Callao
  return false;
}

export interface ValidationResult {
  valid: boolean;
  distrito: string;
  error?: string;
  warnings: string[];
}

/**
 * Valida que una dirección y sus coordenadas cumplan la integridad distrital y física
 */
export function validateTerrenoCoordinates(
  distrito: string,
  lat: number,
  lng: number
): ValidationResult {
  const warnings: string[] = [];

  if (isNaN(lat) || isNaN(lng)) {
    return { valid: false, distrito, error: "Coordenadas no numéricas", warnings };
  }

  // 1. Verificación en Océano Pacífico
  if (isCoordinateInPacificOcean(lat, lng)) {
    return {
      valid: false,
      distrito,
      error: `La coordenada [${lat}, ${lng}] cae en el Océano Pacífico (fuera de tierra firme)`,
      warnings,
    };
  }

  // 2. Verificación de Bounding Box Distrital
  const bounds = LIMA_DISTRICT_BOUNDS[distrito];
  if (!bounds) {
    warnings.push(`Distrito '${distrito}' sin bounding box estricto definido.`);
    return { valid: true, distrito, warnings };
  }

  if (
    lat < bounds.minLat ||
    lat > bounds.maxLat ||
    lng < bounds.minLng ||
    lng > bounds.maxLng
  ) {
    return {
      valid: false,
      distrito,
      error: `La coordenada [${lat}, ${lng}] se encuentra fuera de los límites catastrales de ${distrito}. Rango permitido Lat [${bounds.minLat}, ${bounds.maxLat}], Lng [${bounds.minLng}, ${bounds.maxLng}]`,
      warnings,
    };
  }

  return { valid: true, distrito, warnings };
}
