/**
 * Catálogo Maestro Institucional de Zonificaciones Urbanísticas de Lima Metropolitana y Callao.
 * 
 * Basado en:
 * - Ordenanza N° 1076-MML y Ordenanzas de Reajuste Integral de Zonificación (RIZ) de Lima Metropolitana.
 * - Reglamento de Acondicionamiento Territorial y Desarrollo Urbano Sostenible (RATUS - D.S. 012-2021-VIVIENDA).
 * - Certificados de Parámetros Urbanísticos y Edificatorios (CPU) distritales y metropolitanos.
 */

export interface ZonificacionInfo {
  value: string;
  label: string;
  nombre: string;
  categoria: "Residencial" | "Comercial" | "Industrial" | "Equipamiento y Especial";
  descripcion: string;
  badgeClass: string;
}

export const ZONIFICACIONES_LIMA: ZonificacionInfo[] = [
  // ==========================================
  // 1. RESIDENCIALES
  // ==========================================
  {
    value: "RDB",
    label: "RDB - Residencial Densidad Baja",
    nombre: "Residencial Densidad Baja",
    categoria: "Residencial",
    descripcion: "Unifamiliar y bifamiliar de baja altura (hasta 2-3 pisos). Predominante en zonas residenciales exclusivas o de ladera.",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
  },
  {
    value: "RDM",
    label: "RDM - Residencial Densidad Media",
    nombre: "Residencial Densidad Media",
    categoria: "Residencial",
    descripcion: "Multifamiliar de escala barrial y media densidad (4 a 8 pisos). Predominante en distritos centrales consolidados.",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-300",
  },
  {
    value: "RDA",
    label: "RDA - Residencial Densidad Alta",
    nombre: "Residencial Densidad Alta",
    categoria: "Residencial",
    descripcion: "Edificios multifamiliares de gran altura y torres residenciales (10 a 25+ pisos) frente a avenidas y parques principales.",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-300",
  },
  {
    value: "RDMA",
    label: "RDMA - Residencial Densidad Muy Alta",
    nombre: "Residencial Densidad Muy Alta",
    categoria: "Residencial",
    descripcion: "Densificación vertical intensiva sobre corredores viales metropolitanos y áreas con ordenanzas de renovación urbana.",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-300",
  },
  {
    value: "VT",
    label: "VT - Vivienda Taller",
    nombre: "Vivienda Taller",
    categoria: "Residencial",
    descripcion: "Uso mixto residencial combinado con microtalleres artesanales o manufactura doméstica no molesta.",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-300",
  },

  // ==========================================
  // 2. COMERCIALES
  // ==========================================
  {
    value: "CV",
    label: "CV - Comercio Vecinal",
    nombre: "Comercio Vecinal",
    categoria: "Comercial",
    descripcion: "Comercio local y de abastecimiento diario para soporte inmediato de urbanizaciones y barrios (1-3 pisos).",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-300",
  },
  {
    value: "CZ",
    label: "CZ - Comercio Zonal",
    nombre: "Comercio Zonal",
    categoria: "Comercial",
    descripcion: "Ejes comerciales distritales, bancos, supermercados, oficinas corporativas medianas y proyectos de uso mixto vivienda-comercio.",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-300",
  },
  {
    value: "CM",
    label: "CM - Comercio Metropolitano",
    nombre: "Comercio Metropolitano",
    categoria: "Comercial",
    descripcion: "Grandes centros comerciales, sedes corporativas, torres financieras y equipamiento de cobertura regional metropolitana.",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300",
  },
  {
    value: "CI",
    label: "CI - Comercio Industrial",
    nombre: "Comercio Industrial",
    categoria: "Comercial",
    descripcion: "Locales de comercialización mayorista, distribución, salas de exhibición pesada (automotriz, maquinaria) y almacenes comerciales.",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-300",
  },
  {
    value: "CE",
    label: "CE - Comercio Especializado",
    nombre: "Comercio Especializado",
    categoria: "Comercial",
    descripcion: "Complejos comerciales monomarca o dedicados a un rubro técnico específico (tecnología, construcción, automotriz).",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-300",
  },

  // ==========================================
  // 3. INDUSTRIALES
  // ==========================================
  {
    value: "I1",
    label: "I1 - Industria Elemental y Complementaria",
    nombre: "Industria Elemental y Complementaria",
    categoria: "Industrial",
    descripcion: "Pequeña industria liviana compatible con entornos urbanos y de bajo impacto acústico o ambiental.",
    badgeClass: "bg-amber-100/70 text-amber-800 border-amber-300",
  },
  {
    value: "I2",
    label: "I2 - Industria Liviana",
    nombre: "Industria Liviana",
    categoria: "Industrial",
    descripcion: "Manufactura y almacenaje intermedio no molesto ni peligroso en parques industriales consolidados.",
    badgeClass: "bg-orange-100/70 text-orange-800 border-orange-300",
  },
  {
    value: "I3",
    label: "I3 - Gran Industria",
    nombre: "Gran Industria",
    categoria: "Industrial",
    descripcion: "Industria manufacturera a gran escala, plantas de procesamiento y centros logísticos pesados con retiros reglamentarios.",
    badgeClass: "bg-red-50 text-red-700 border-red-300",
  },
  {
    value: "I4",
    label: "I4 - Industria Pesada Básica",
    nombre: "Industria Pesada Básica",
    categoria: "Industrial",
    descripcion: "Refinerías, plantas químicas pesadas y fundiciones sujetas a zona de amortiguamiento ambiental estricta.",
    badgeClass: "bg-rose-100/70 text-rose-800 border-rose-300",
  },

  // ==========================================
  // 4. EQUIPAMIENTO Y ZONAS ESPECIALES
  // ==========================================
  {
    value: "OU",
    label: "OU - Otros Usos",
    nombre: "Otros Usos",
    categoria: "Equipamiento y Especial",
    descripcion: "Equipamientos institucionales, gubernamentales, terminales terrestres, estadios y servicios públicos metropolitanos.",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300 font-semibold",
  },
  {
    value: "ZRE",
    label: "ZRE - Zona de Reglamentación Especial",
    nombre: "Zona de Reglamentación Especial",
    categoria: "Equipamiento y Especial",
    descripcion: "Áreas urbanas con régimen normativo específico aprobado por plan específico o con fines de renovación urbana.",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-300",
  },
  {
    value: "ZTE",
    label: "ZTE - Zona de Tratamiento Especial",
    nombre: "Zona de Tratamiento Especial",
    categoria: "Equipamiento y Especial",
    descripcion: "Sectores sujetos a preservación ambiental, ecológica, geomorfológica o de transición urbana singular.",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
  },
  {
    value: "E",
    label: "E - Educación (E1, E2, E3, E4)",
    nombre: "Equipamiento Educativo",
    categoria: "Equipamiento y Especial",
    descripcion: "Centros de educación inicial, colegios primarios/secundarios, institutos y campus universitarios.",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-300",
  },
  {
    value: "H",
    label: "H - Salud (H1, H2, H3, H4)",
    nombre: "Equipamiento de Salud",
    categoria: "Equipamiento y Especial",
    descripcion: "Postas médicas, policlínicos, clínicas privadas y hospitales metropolitanos especializados.",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-300",
  },
  {
    value: "ZRP",
    label: "ZRP - Zona de Recreación Pública",
    nombre: "Zona de Recreación Pública",
    categoria: "Equipamiento y Especial",
    descripcion: "Parques zonales, malecones costeros, alamedas y plazas públicas de dominio metropolitano.",
    badgeClass: "bg-green-50 text-green-700 border-green-300",
  },
  {
    value: "CH",
    label: "CH - Centro Histórico / Zona Monumental",
    nombre: "Centro Histórico / Zona Monumental",
    categoria: "Equipamiento y Especial",
    descripcion: "Patrimonio cultural edificado, casonas y monumentos catalogados bajo supervisión del Ministerio de Cultura y PROLIMA.",
    badgeClass: "bg-stone-100 text-stone-800 border-stone-300",
  },
];

/**
 * Lista de códigos puros para validaciones, esquemas y filtros.
 */
export const ZONIFICACIONES_CODES = ZONIFICACIONES_LIMA.map((z) => z.value);

/**
 * Códigos más frecuentes en inversiones inmobiliarias para filtros rápidos
 */
export const ZONIFICACIONES_PRIORITARIAS_FILTRO = [
  "RDA",
  "RDMA",
  "RDM",
  "RDB",
  "CZ",
  "CM",
  "I1",
  "I2",
  "ZTE",
  "OU",
];

/**
 * Categorías agrupadas para selectores con SelectGroup
 */
export const ZONIFICACIONES_POR_CATEGORIA = {
  Residencial: ZONIFICACIONES_LIMA.filter((z) => z.categoria === "Residencial"),
  Comercial: ZONIFICACIONES_LIMA.filter((z) => z.categoria === "Comercial"),
  Industrial: ZONIFICACIONES_LIMA.filter((z) => z.categoria === "Industrial"),
  "Equipamiento y Especial": ZONIFICACIONES_LIMA.filter(
    (z) => z.categoria === "Equipamiento y Especial"
  ),
};

/**
 * Helper para obtener clase de badge Bloomberg Light según la zonificación
 */
export function getZonificacionBadgeClass(zonif?: string | null): string {
  if (!zonif) return "bg-slate-100 text-slate-600 border-slate-200";
  const norm = zonif.toUpperCase().trim();
  const match = ZONIFICACIONES_LIMA.find((z) => z.value === norm);
  return match ? match.badgeClass : "bg-slate-100 text-slate-700 border-slate-300";
}

/**
 * Helper para obtener el label oficial de una sigla
 */
export function getZonificacionLabel(zonif?: string | null): string {
  if (!zonif) return "";
  const norm = zonif.toUpperCase().trim();
  const match = ZONIFICACIONES_LIMA.find((z) => z.value === norm);
  return match ? match.label : zonif;
}
