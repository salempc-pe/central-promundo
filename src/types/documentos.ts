import { DocumentoTerreno } from "@/types";

export type TipoDocumento =
  | "Certificado_Parametros"
  | "Partida_Registral"
  | "Plano_Catastral"
  | "Otros";

export type EstadoVigencia = "vigente" | "por_vencer" | "vencido" | "permanente";

export interface DocumentoConTerreno {
  id: string;
  terrenoId: string;
  tipoDocumento: TipoDocumento;
  nombreArchivo: string;
  archivoUrl: string;
  fechaVencimiento: string | Date | null;
  esConfidencial: boolean;
  createdAt: string | Date;
  
  // Metadatos enriquecidos
  tamanoBytes?: number;
  mimeType?: string;
  extension?: string;
  numeroDocumento?: string;
  entidadEmisora?: string;
  fechaEmision?: string | Date | null;
  notas?: string;

  // Calculados reactivos
  diasParaVencer?: number | null;
  estadoVigencia: EstadoVigencia;

  // Datos contextuales del terreno vinculado
  terreno: {
    id: string;
    codigoInterno: string;
    distrito: string;
    direccion: string;
    zonificacion: string;
    alturaMaxPisos: number | null;
    areaM2: string;
    moneda: "USD" | "PEN";
    precioTotal: string;
    precioM2: string;
    propietarioNombre?: string;
  };
}

export interface DocumentoFiltros {
  busqueda?: string;
  terrenoId?: string;
  distrito?: string[];
  tipoDocumento?: TipoDocumento[];
  estadoVigencia?: EstadoVigencia[];
  esConfidencial?: boolean | null;
}

export interface DocumentosKpis {
  totalDocumentos: number;
  totalCpus: number;
  cpusVigentes: number;
  cpusPorVencer: number;
  cpusVencidos: number;
  terrenosSinCpu: number;
  documentosConfidenciales: number;
  espacioUtilizadoBytes: number;
}

export interface UploadDocumentoInput {
  terrenoId: string;
  tipoDocumento: TipoDocumento;
  nombreArchivo: string;
  archivoUrl?: string;
  fechaEmision?: string | null;
  fechaVencimiento?: string | null;
  esConfidencial: boolean;
  tamanoBytes?: number;
  mimeType?: string;
  numeroDocumento?: string;
  entidadEmisora?: string;
  notas?: string;
}
