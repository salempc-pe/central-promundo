import {
  Negociacion,
  BitacoraNegociacion,
  TerrenoCompleto,
  Cliente,
  Usuario,
} from "@/types";

export type EtapaNegociacion =
  | "Ficha_Enviada"
  | "En_Evaluacion"
  | "Visita_Realizada"
  | "LOI_Oferta"
  | "Due_Diligence"
  | "Cierre_Ganado"
  | "Descartado";

export type TipoEventoBitacora =
  | "Nota"
  | "Llamada"
  | "Reunion"
  | "Cambio_Estado"
  | "Oferta_Presentada";

export interface BitacoraConUsuario extends Omit<BitacoraNegociacion, "createdAt"> {
  createdAt: string | Date;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
}

export interface NegociacionCompleta extends Omit<Negociacion, "createdAt" | "updatedAt"> {
  createdAt: string | Date;
  updatedAt: string | Date;
  diasEnEtapaActual: number;
  diasTotales: number;
  comisionEstimadaUSD: number; // 3% arancel corporativo Promundo
  
  // Relaciones completas
  terreno: TerrenoCompleto;
  cliente: Cliente;
  broker: Usuario;
  bitacora: BitacoraConUsuario[];
}

export interface NegociacionFiltros {
  busqueda?: string;
  etapa?: EtapaNegociacion[];
  brokerId?: string[];
  clienteId?: string[];
  distrito?: string[];
  soloEstancados?: boolean; // > 14 días en etapa actual
  montoMin?: number;
  montoMax?: number;
  probabilidadMin?: number;
}

export interface PipelineKpis {
  totalNegociaciones: number;
  dealsActivos: number;
  dealsEstancados: number;
  volumenTotalNominalUSD: number;
  volumenPonderadoUSD: number;
  cierresGanados: number;
  volumenCerradoUSD: number;
  tasaConversionPct: number;
  ticketPromedioUSD: number;
  comisionEstimadaTotalUSD: number;
  porEtapa: Record<
    EtapaNegociacion,
    {
      count: number;
      totalUSD: number;
      ponderadoUSD: number;
      probabilidadMedia: number;
    }
  >;
}

export interface CreateNegociacionInput {
  terrenoId: string;
  clienteId: string;
  brokerId: string;
  etapaInicial?: EtapaNegociacion;
  montoOferta: number | string;
  probabilidadCierre?: number;
  notaInicial: string;
}

export interface UpdateEtapaNegociacionInput {
  id: string;
  nuevaEtapa: EtapaNegociacion;
  tipoEvento: TipoEventoBitacora;
  notaBitacora: string;
  montoOferta?: number | string;
  probabilidadCierre?: number;
  usuarioId: string;
  archivoAdjuntoUrl?: string;
}

export interface AddBitacoraEventoInput {
  negociacionId: string;
  usuarioId: string;
  tipoEvento: TipoEventoBitacora;
  descripcion: string;
  archivoAdjuntoUrl?: string;
}

export interface EtapaConfig {
  id: EtapaNegociacion;
  label: string;
  shortLabel: string;
  probabilidadDefault: number;
  colorBorder: string;
  colorBg: string;
  colorText: string;
  badgeVariant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
  description: string;
}

export const ETAPAS_CONFIG: Record<EtapaNegociacion, EtapaConfig> = {
  Ficha_Enviada: {
    id: "Ficha_Enviada",
    label: "Ficha Enviada",
    shortLabel: "Ficha",
    probabilidadDefault: 10,
    colorBorder: "border-slate-500",
    colorBg: "bg-slate-500/10",
    colorText: "text-slate-400",
    badgeVariant: "secondary",
    description: "Teaser o ficha técnica enviada a la constructora.",
  },
  En_Evaluacion: {
    id: "En_Evaluacion",
    label: "En Evaluación",
    shortLabel: "Evaluación",
    probabilidadDefault: 25,
    colorBorder: "border-blue-500",
    colorBg: "bg-blue-500/10",
    colorText: "text-blue-400",
    badgeVariant: "default",
    description: "Cabida arquitectónica y factibilidad económica en curso.",
  },
  Visita_Realizada: {
    id: "Visita_Realizada",
    label: "Visita Realizada",
    shortLabel: "Visita",
    probabilidadDefault: 40,
    colorBorder: "border-indigo-500",
    colorBg: "bg-indigo-500/10",
    colorText: "text-indigo-400",
    badgeVariant: "default",
    description: "Inspección técnica in situ completada con el cliente.",
  },
  LOI_Oferta: {
    id: "LOI_Oferta",
    label: "LOI / Oferta Formal",
    shortLabel: "Oferta LOI",
    probabilidadDefault: 60,
    colorBorder: "border-amber-500",
    colorBg: "bg-amber-500/10",
    colorText: "text-amber-400",
    badgeVariant: "warning",
    description: "Carta de Intención u oferta económica presentada.",
  },
  Due_Diligence: {
    id: "Due_Diligence",
    label: "Due Diligence Legal",
    shortLabel: "Due Diligence",
    probabilidadDefault: 80,
    colorBorder: "border-purple-500",
    colorBg: "bg-purple-500/10",
    colorText: "text-purple-400",
    badgeVariant: "warning",
    description: "Auditoría de títulos, gravámenes y licencias en SUNARP.",
  },
  Cierre_Ganado: {
    id: "Cierre_Ganado",
    label: "Cierre Ganado",
    shortLabel: "Ganado",
    probabilidadDefault: 100,
    colorBorder: "border-emerald-500",
    colorBg: "bg-emerald-500/10",
    colorText: "text-emerald-400",
    badgeVariant: "success",
    description: "Minuta de compraventa firmada y liquidación de comisión.",
  },
  Descartado: {
    id: "Descartado",
    label: "Descartado / Perdido",
    shortLabel: "Descartado",
    probabilidadDefault: 0,
    colorBorder: "border-rose-500",
    colorBg: "bg-rose-500/10",
    colorText: "text-rose-400",
    badgeVariant: "destructive",
    description: "Negociación descalificada o rechazada por las partes.",
  },
};
