/**
 * Script de Auditoría y Verificación de Integridad Espacial de Terrenos
 * Ejecución: node scripts/verify-spatial-integrity.mjs
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Bounding Boxes oficiales de distritos de Lima Metropolitana (WGS84 EPSG:4326)
const LIMA_DISTRICT_BOUNDS = {
  Miraflores: { minLat: -12.1450, maxLat: -12.1000, minLng: -77.0600, maxLng: -76.9950 },
  "San Isidro": { minLat: -12.1160, maxLat: -12.0800, minLng: -77.0650, maxLng: -77.0020 },
  "Santiago de Surco": { minLat: -12.1800, maxLat: -12.0700, minLng: -77.0230, maxLng: -76.9400 },
  Barranco: { minLat: -12.1620, maxLat: -12.1260, minLng: -77.0340, maxLng: -77.0080 },
  "San Miguel": { minLat: -12.1030, maxLat: -12.0550, minLng: -77.1180, maxLng: -77.0660 },
  "Jesús María": { minLat: -12.0980, maxLat: -12.0600, minLng: -77.0680, maxLng: -77.0310 },
  "Magdalena del Mar": { minLat: -12.1120, maxLat: -12.0790, minLng: -77.0840, maxLng: -77.0500 },
  Lince: { minLat: -12.0960, maxLat: -12.0740, minLng: -77.0530, maxLng: -77.0180 },
  "San Borja": { minLat: -12.1170, maxLat: -12.0750, minLng: -77.0170, maxLng: -76.9730 },
  Surquillo: { minLat: -12.1310, maxLat: -12.0970, minLng: -77.0320, maxLng: -76.9890 },
  Ate: { minLat: -12.0900, maxLat: -11.9870, minLng: -77.0030, maxLng: -76.7780 },
  "Pueblo Libre": { minLat: -12.0910, maxLat: -12.0620, minLng: -77.0860, maxLng: -77.0450 },
  Chorrillos: { minLat: -12.2360, maxLat: -12.1490, minLng: -77.0450, maxLng: -76.9670 },
  "La Molina": { minLat: -12.1290, maxLat: -12.0510, minLng: -76.9810, maxLng: -76.8790 },
  Callao: { minLat: -12.0850, maxLat: -11.8120, minLng: -77.1930, maxLng: -77.0710 },
};

// Verificación de línea costera: la Costa Verde y el Malecón de San Miguel
// En San Miguel la Av. Costanera se extiende hasta -77.0930 antes de la línea de mar
function isCoordinateInPacificOcean(lat, lng) {
  if (lat < -12.155 && lng < -77.030) return true;
  if (lat >= -12.155 && lat < -12.125 && lng < -77.042) return true;
  if (lat >= -12.125 && lat < -12.095 && lng < -77.075) return true;
  if (lat >= -12.095 && lat < -12.070 && lng < -77.094) return true;
  if (lat >= -12.070 && lng < -77.150) return true;
  return false;
}

const seedPath = resolve(process.cwd(), "src/lib/mock/terrenos-seed.ts");
const content = readFileSync(seedPath, "utf-8");

// Extraer bloques de terrenos (filtrando estrictamente por prefijo tr- para evitar colisiones con IDs de documentos o propietarios)
const terrenoRegex = /id:\s*"(tr-\d+)",[\s\S]*?codigoInterno:\s*"([^"]+)",[\s\S]*?direccion:\s*"([^"]+)",[\s\S]*?distrito:\s*"([^"]+)",[\s\S]*?latitud:\s*"([^"]+)",[\s\S]*?longitud:\s*"([^"]+)",/g;

let match;
let total = 0;
let errors = 0;

console.log("===============================================================================");
console.log("🌐 AUDITORÍA DE INTEGRIDAD ESPACIAL & CONSISTENCIA VIAL - PROMUNDO SISTEMA");
console.log("===============================================================================\n");

while ((match = terrenoRegex.exec(content)) !== null) {
  total++;
  const [, id, codigo, direccion, distrito, latStr, lngStr] = match;
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  const prefix = `[${id}] ${codigo.padEnd(12)} | ${distrito.padEnd(18)} | ${direccion.padEnd(30)}`;

  // 1. Validar si cae en el Océano
  if (isCoordinateInPacificOcean(lat, lng)) {
    console.error(`❌ FALLA: ${prefix} -> CAE EN EL OCÉANO PACÍFICO [${lat}, ${lng}]`);
    errors++;
    continue;
  }

  // 2. Validar Bounding Box Distrital
  const bounds = LIMA_DISTRICT_BOUNDS[distrito];
  if (!bounds) {
    console.warn(`⚠️ ALERTA: ${prefix} -> Distrito sin bounds registrados`);
    continue;
  }

  if (lat < bounds.minLat || lat > bounds.maxLat || lng < bounds.minLng || lng > bounds.maxLng) {
    console.error(`❌ FALLA: ${prefix} -> FUERA DE DISTRITO [${lat}, ${lng}]`);
    console.error(`   Rango permitido Lat [${bounds.minLat}, ${bounds.maxLat}], Lng [${bounds.minLng}, ${bounds.maxLng}]`);
    errors++;
    continue;
  }

  // 3. Verificación específica para TR-SBOR-071 (Av. San Borja Sur 890)
  // Requerimiento crítico de usuario: Debe caer en el eje de Av. San Borja Sur cuadras 8-9
  // NO debe estar desplazado hacia el sur (Pablo Usandizaga / Maestro Chueca)
  if (codigo === "TR-SBOR-071") {
    if (lat < -12.1025 || lat > -12.0995 || lng < -76.9950 || lng > -76.9910) {
      console.error(`❌ FALLA: ${prefix} -> TR-SBOR-071 desalineado de Av. San Borja Sur! [${lat}, ${lng}]`);
      console.error(`   Debe estar en el eje de Av. San Borja Sur cuadras 8-9 (cerca a Av. Boulevard / Pentagonito).`);
      errors++;
      continue;
    }
  }

  // 4. Verificación específica para TR-SISI-019 (Calle Las Palmeras)
  if (codigo === "TR-SISI-019") {
    // Debe estar en Calle Las Palmeras, no en Vía Real
    if (lat < -12.096 || lng > -77.0375) {
      console.error(`❌ FALLA: ${prefix} -> TR-SISI-019 cae en 'Vía Real' en lugar de Calle Las Palmeras!`);
      errors++;
      continue;
    }
  }

  // 5. Verificación específica para TR-MIRA-084 (Av. Vasco Núñez de Balboa 640)
  if (codigo === "TR-MIRA-084") {
    // Debe estar en cuadra 6 de Balboa (-12.1298 a -12.1312, -77.0245 a -77.0260)
    if (lat > -12.1290 || lat < -12.1320 || lng > -77.0240 || lng < -77.0265) {
      console.error(`❌ FALLA: ${prefix} -> TR-MIRA-084 fuera del eje de Balboa cdra 6!`);
      errors++;
      continue;
    }
  }

  // 6. Verificación específica para TR-LCE-014 (Av. Arequipa 2450)
  if (codigo === "TR-LCE-014") {
    // Debe estar en cuadra 24 de Av. Arequipa frente a Parque Castilla, no en Av. Militar
    if (lat > -12.0860) {
      console.error(`❌ FALLA: ${prefix} -> TR-LCE-014 cae en Av. Militar en lugar de Av. Arequipa 2450!`);
      errors++;
      continue;
    }
  }

  // 7. Verificación específica para TR-JMA-033 (Av. San Felipe 750)
  if (codigo === "TR-JMA-033") {
    // Debe estar en Av. San Felipe frente a Universidad del Pacífico / Canal 2
    if (lat < -12.0845) {
      console.error(`❌ FALLA: ${prefix} -> TR-JMA-033 cae en Jr. Huiracocha en lugar de Av. San Felipe!`);
      errors++;
      continue;
    }
  }

  // 8. Verificación específica para TR-LMOL-039 (Av. La Fontana 520 frente a USIL)
  if (codigo === "TR-LMOL-039") {
    if (lat < -12.0745 || lat > -12.0715 || lng < -76.9560 || lng > -76.9515) {
      console.error(`❌ FALLA: ${prefix} -> TR-LMOL-039 desfasado de USIL / La Fontana cdra 5! [${lat}, ${lng}]`);
      errors++;
      continue;
    }
  }

  // 9. Verificación específica para TR-ATE-090 (Av. Nicolás Ayllón 2800 lado Ate)
  if (codigo === "TR-ATE-090") {
    if (lat > -12.0590) {
      console.error(`❌ FALLA: ${prefix} -> TR-ATE-090 cae en el lado norte de El Agustino en lugar de Ate!`);
      errors++;
      continue;
    }
  }

  console.log(`✅ OK: ${prefix} -> [${lat.toFixed(5)}, ${lng.toFixed(5)}]`);
}

console.log("\n-------------------------------------------------------------------------------");
console.log(`📊 RESULTADO AUDITORÍA: ${total} terrenos verificados.`);
if (errors === 0) {
  console.log("🟢 100% PASS: Ningún terreno cae en el mar ni fuera de su trazado distrital.");
  process.exit(0);
} else {
  console.error(`🔴 FALLARON ${errors} terreno(s). Revisar coordenadas.`);
  process.exit(1);
}
