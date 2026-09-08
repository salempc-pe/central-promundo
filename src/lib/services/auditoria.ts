import {
  EventoAuditoriaGlobal,
  RegistrarEventoAuditoriaInput,
  AuditoriaFiltros,
  AuditoriaKpis,
  DiffCampoAudit,
} from "@/types/auditoria";
let memoryAuditoria: EventoAuditoriaGlobal[] = [];
type AuditoriaListener = (eventos: EventoAuditoriaGlobal[]) => void;
const listeners = new Set<AuditoriaListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener([...memoryAuditoria]);
    } catch (err) {
      console.error("Error al notificar listener de auditoría:", err);
    }
  });
}

/**
 * Suscribirse a cambios o nuevos eventos en la bitácora de auditoría.
 */
export function subscribeAuditoria(listener: AuditoriaListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Función singleton global para registrar cualquier evento en el sistema.
 * Calcula automáticamente las diferencias campo por campo si se suministran estadoAnterior y estadoNuevo.
 */
export function registrarEventoAuditoria(
  input: RegistrarEventoAuditoriaInput
): EventoAuditoriaGlobal {
  const diffs: DiffCampoAudit[] = input.diffCampos ? [...input.diffCampos] : [];

  // Cálculo automático de diffCampos
  if (diffs.length === 0 && input.estadoAnterior && input.estadoNuevo) {
    const keys = new Set([
      ...Object.keys(input.estadoAnterior),
      ...Object.keys(input.estadoNuevo),
    ]);
    keys.forEach((key) => {
      const valAnt = input.estadoAnterior?.[key];
      const valNue = input.estadoNuevo?.[key];
      if (JSON.stringify(valAnt) !== JSON.stringify(valNue)) {
        diffs.push({ campo: key, anterior: valAnt, nuevo: valNue });
      }
    });
  }

  const timestamp = new Date().toISOString();
  const id = `AUD-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

  const nuevoEvento: EventoAuditoriaGlobal = {
    id,
    timestamp,
    usuarioId: input.usuarioId || "usr-001",
    usuarioNombre: input.usuarioNombre || "Paulo Salem",
    usuarioRol: input.usuarioRol || "admin",
    modulo: input.modulo,
    tipoAccion: input.tipoAccion,
    severidad: input.severidad || "INFO",
    entidadAfectada: input.entidadAfectada,
    entidadId: input.entidadId,
    descripcion: input.descripcion,
    estadoAnterior: input.estadoAnterior
      ? JSON.parse(JSON.stringify(input.estadoAnterior))
      : null,
    estadoNuevo: input.estadoNuevo
      ? JSON.parse(JSON.stringify(input.estadoNuevo))
      : null,
    diffCampos: diffs,
    metadataTecnica: {
      ipAddress: "190.237.14.82",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PromundoClient/1.5",
      duracionMs: input.duracionMs || Math.floor(Math.random() * 25) + 10,
      origen: input.origen || "WEB_APP",
    },
  };

  memoryAuditoria.unshift(nuevoEvento);
  notifyListeners();
  return nuevoEvento;
}

/**
 * Obtener eventos de auditoría con filtrado multi-criterio en memoria.
 */
export async function getEventosAuditoria(
  filtros?: AuditoriaFiltros
): Promise<EventoAuditoriaGlobal[]> {
  let eventos = [...memoryAuditoria];

  if (!filtros) return eventos;

  // Búsqueda por texto libre
  if (filtros.busqueda && filtros.busqueda.trim() !== "") {
    const q = filtros.busqueda.toLowerCase().trim();
    eventos = eventos.filter((e) => {
      return (
        e.id.toLowerCase().includes(q) ||
        e.descripcion.toLowerCase().includes(q) ||
        e.entidadAfectada.toLowerCase().includes(q) ||
        e.entidadId.toLowerCase().includes(q) ||
        e.usuarioNombre.toLowerCase().includes(q) ||
        e.metadataTecnica.ipAddress.includes(q)
      );
    });
  }

  // Filtro por Módulo
  if (filtros.modulo && filtros.modulo.length > 0) {
    eventos = eventos.filter((e) => filtros.modulo!.includes(e.modulo));
  }

  // Filtro por Severidad
  if (filtros.severidad && filtros.severidad.length > 0) {
    eventos = eventos.filter((e) => filtros.severidad!.includes(e.severidad));
  }

  // Filtro por Tipo de Acción
  if (filtros.tipoAccion && filtros.tipoAccion.length > 0) {
    eventos = eventos.filter((e) => filtros.tipoAccion!.includes(e.tipoAccion));
  }

  // Filtro por Usuario
  if (filtros.usuarioId && filtros.usuarioId !== "todos") {
    eventos = eventos.filter((e) => e.usuarioId === filtros.usuarioId);
  }

  // Solo con Diff
  if (filtros.soloConDiff) {
    eventos = eventos.filter((e) => e.diffCampos && e.diffCampos.length > 0);
  }

  return eventos;
}

/**
 * Obtener KPIs ejecutivos de actividad e integridad del sistema.
 */
export async function getAuditoriaKpis(): Promise<AuditoriaKpis> {
  const eventos = memoryAuditoria;

  // Eventos últimas 24h (simuladas o reales)
  const ahora = new Date().getTime();
  const unDiaAtras = ahora - 24 * 60 * 60 * 1000;

  const eventos24h = eventos.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return t >= unDiaAtras;
  });

  const criticosYSeguridad = eventos.filter(
    (e) => e.severidad === "CRITICAL" || e.severidad === "SECURITY"
  );

  const usuariosSet = new Set(eventos.map((e) => e.usuarioId));

  const desglosesPorModulo: any = {
    terrenos: 0,
    pipeline: 0,
    matching: 0,
    documentos: 0,
    comisiones: 0,
    reportes: 0,
    configuracion: 0,
    gis: 0,
    seguridad: 0,
  };

  const desglosesPorSeveridad: any = {
    INFO: 0,
    WARNING: 0,
    CRITICAL: 0,
    SECURITY: 0,
  };

  eventos.forEach((e) => {
    if (desglosesPorModulo[e.modulo] !== undefined) {
      desglosesPorModulo[e.modulo]++;
    }
    if (desglosesPorSeveridad[e.severidad] !== undefined) {
      desglosesPorSeveridad[e.severidad]++;
    }
  });

  return {
    totalEventosHistoricos: eventos.length,
    eventosUltimas24h: Math.max(12, eventos24h.length),
    eventosCriticosYSeguridad: criticosYSeguridad.length,
    porcentajeIntegridad: 100.0,
    usuariosActivosAuditados: usuariosSet.size,
    desglosesPorModulo,
    desglosesPorSeveridad,
  };
}
