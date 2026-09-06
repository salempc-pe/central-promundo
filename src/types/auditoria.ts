export type ModuloSistema =
  | "terrenos"
  | "pipeline"
  | "matching"
  | "documentos"
  | "comisiones"
  | "reportes"
  | "configuracion"
  | "gis"
  | "seguridad";

export type TipoAccionAuditoria =
  | "CREACION"
  | "ACTUALIZACION"
  | "ELIMINACION"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORTACION"
  | "APROBACION"
  | "CALCULO"
  | "CAMBIO_ESTADO"
  | "FALLO_SEGURIDAD";

export type NivelSeveridadAuditoria = "INFO" | "WARNING" | "CRITICAL" | "SECURITY";

export interface DiffCampoAudit {
  campo: string;
  anterior: any;
  nuevo: any;
}

export interface EventoAuditoriaGlobal {
  id: string;
  timestamp: string; // ISO 8601
  usuarioId: string;
  usuarioNombre: string;
  usuarioRol: string;
  modulo: ModuloSistema;
  tipoAccion: TipoAccionAuditoria;
  severidad: NivelSeveridadAuditoria;
  entidadAfectada: string;
  entidadId: string;
  descripcion: string;
  estadoAnterior: Record<string, any> | null;
  estadoNuevo: Record<string, any> | null;
  diffCampos?: DiffCampoAudit[];
  metadataTecnica: {
    ipAddress: string;
    userAgent: string;
    duracionMs?: number;
    origen: "WEB_APP" | "API" | "CRON_JOB" | "SISTEMA";
  };
}

export interface RegistrarEventoAuditoriaInput {
  usuarioId?: string;
  usuarioNombre?: string;
  usuarioRol?: string;
  modulo: ModuloSistema;
  tipoAccion: TipoAccionAuditoria;
  severidad?: NivelSeveridadAuditoria;
  entidadAfectada: string;
  entidadId: string;
  descripcion: string;
  estadoAnterior?: Record<string, any> | null;
  estadoNuevo?: Record<string, any> | null;
  diffCampos?: DiffCampoAudit[];
  duracionMs?: number;
  origen?: "WEB_APP" | "API" | "CRON_JOB" | "SISTEMA";
}

export interface AuditoriaFiltros {
  busqueda?: string;
  modulo?: ModuloSistema[];
  severidad?: NivelSeveridadAuditoria[];
  tipoAccion?: TipoAccionAuditoria[];
  usuarioId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  soloConDiff?: boolean;
}

export interface AuditoriaKpis {
  totalEventosHistoricos: number;
  eventosUltimas24h: number;
  eventosCriticosYSeguridad: number;
  porcentajeIntegridad: number; // 100.0%
  usuariosActivosAuditados: number;
  desglosesPorModulo: Record<ModuloSistema, number>;
  desglosesPorSeveridad: Record<NivelSeveridadAuditoria, number>;
}
