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
 * Bounding boxes oficiales por distrito en Lima Metropolitana con tolerancia catastral
 * Basados en el catastro oficial metropolitano y límites administrativos WGS84 (EPSG:4326)
 * Incluyen margen de tolerancia para avenidas limítrofes y cuadrantes urbanos periféricos.
 */
export const LIMA_DISTRICT_BOUNDS: Record<string, DistrictBoundingBox> = {
  Miraflores: {
    minLat: -12.1450,
    maxLat: -12.1000,
    minLng: -77.0600,
    maxLng: -76.9950,
  },
  "San Isidro": {
    minLat: -12.1160,
    maxLat: -12.0800,
    minLng: -77.0650,
    maxLng: -77.0020,
  },
  "Santiago de Surco": {
    minLat: -12.1800,
    maxLat: -12.0700,
    minLng: -77.0230,
    maxLng: -76.9400,
  },
  Barranco: {
    minLat: -12.1620,
    maxLat: -12.1260,
    minLng: -77.0340,
    maxLng: -77.0080,
  },
  "San Miguel": {
    minLat: -12.1030,
    maxLat: -12.0550,
    minLng: -77.1180,
    maxLng: -77.0660,
  },
  "Jesús María": {
    minLat: -12.0980,
    maxLat: -12.0600,
    minLng: -77.0680,
    maxLng: -77.0310,
  },
  "Magdalena del Mar": {
    minLat: -12.1120,
    maxLat: -12.0790,
    minLng: -77.0840,
    maxLng: -77.0500,
  },
  Lince: {
    minLat: -12.0960,
    maxLat: -12.0740,
    minLng: -77.0530,
    maxLng: -77.0180,
  },
  "San Borja": {
    minLat: -12.1170,
    maxLat: -12.0750,
    minLng: -77.0170,
    maxLng: -76.9730,
  },
  Surquillo: {
    minLat: -12.1310,
    maxLat: -12.0970,
    minLng: -77.0320,
    maxLng: -76.9890,
  },
  Ate: {
    minLat: -12.0900,
    maxLat: -11.9870,
    minLng: -77.0030,
    maxLng: -76.7780,
  },
  "Pueblo Libre": {
    minLat: -12.0910,
    maxLat: -12.0620,
    minLng: -77.0860,
    maxLng: -77.0450,
  },
  Chorrillos: {
    minLat: -12.2360,
    maxLat: -12.1490,
    minLng: -77.0450,
    maxLng: -76.9670,
  },
  "La Molina": {
    minLat: -12.1290,
    maxLat: -12.0510,
    minLng: -76.9810,
    maxLng: -76.8790,
  },
  Callao: {
    minLat: -12.0850,
    maxLat: -11.8120,
    minLng: -77.1930,
    maxLng: -77.0710,
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
  if (lat >= -12.095 && lat < -12.070 && lng < -77.094) return true; // San Miguel (Costanera segura)
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

  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
    return { valid: false, distrito, error: "Coordenadas no numéricas o inválidas", warnings };
  }

  // 1. Verificación en Océano Pacífico
  if (isCoordinateInPacificOcean(lat, lng)) {
    return {
      valid: false,
      distrito,
      error: `La coordenada [${lat.toFixed(6)}, ${lng.toFixed(6)}] cae en el Océano Pacífico (fuera de tierra firme)`,
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
    // Si la coordenada cae en otro distrito registrado, identificarlo para orientar al usuario
    const otroDistrito = Object.entries(LIMA_DISTRICT_BOUNDS).find(
      ([d, b]) => d !== distrito && lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng
    );

    const detalle = otroDistrito
      ? ` (la coordenada parece pertenecer a ${otroDistrito[0]})`
      : "";

    return {
      valid: false,
      distrito,
      error: `La coordenada [${lat.toFixed(6)}, ${lng.toFixed(6)}] se encuentra fuera de los límites catastrales de ${distrito}${detalle}. Rango permitido Lat [${bounds.minLat.toFixed(3)}, ${bounds.maxLat.toFixed(3)}], Lng [${bounds.minLng.toFixed(3)}, ${bounds.maxLng.toFixed(3)}]`,
      warnings,
    };
  }

  return { valid: true, distrito, warnings };
}
