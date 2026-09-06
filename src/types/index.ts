import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import {
  usuarios,
  propietarios,
  terrenos,
  documentosTerreno,
  clientes,
  negociaciones,
  bitacoraNegociacion,
  comisionesCierres,
} from "@/db/schema";

// TIPOS DE ENTIDADES (SELECT E INSERT)
export type Usuario = InferSelectModel<typeof usuarios>;
export type NewUsuario = InferInsertModel<typeof usuarios>;

export type Propietario = InferSelectModel<typeof propietarios>;
export type NewPropietario = InferInsertModel<typeof propietarios>;

export type Terreno = InferSelectModel<typeof terrenos>;
export type NewTerreno = InferInsertModel<typeof terrenos>;

export type DocumentoTerreno = InferSelectModel<typeof documentosTerreno>;
export type NewDocumentoTerreno = InferInsertModel<typeof documentosTerreno>;

export type Cliente = InferSelectModel<typeof clientes>;
export type NewCliente = InferInsertModel<typeof clientes>;

export type Negociacion = InferSelectModel<typeof negociaciones>;
export type NewNegociacion = InferInsertModel<typeof negociaciones>;

export type BitacoraNegociacion = InferSelectModel<typeof bitacoraNegociacion>;
export type NewBitacoraNegociacion = InferInsertModel<typeof bitacoraNegociacion>;

export type ComisionCierre = InferSelectModel<typeof comisionesCierres>;
export type NewComisionCierre = InferInsertModel<typeof comisionesCierres>;

// TIPO EXTENDIDO DE TERRENO CON RELACIONES
export type TerrenoCompleto = Terreno & {
  propietario: Propietario;
  documentos: DocumentoTerreno[];
  negociaciones?: (Negociacion & {
    cliente: Cliente;
    broker: Usuario;
  })[];
};

// FILTROS ACUMULATIVOS DE TERRENOS (DATA GRID & MAPA)
export interface TerrenoFiltros {
  busqueda?: string;
  distrito?: string[];
  zonificacion?: string[];
  areaMin?: number;
  areaMax?: number;
  precioM2Max?: number;
  precioTotalMax?: number;
  alturaMinPisos?: number;
  frenteLinealMin?: number;
  soloConCertificadoParametros?: boolean;
  estado?: Array<"Disponible" | "En Negociacion" | "Vendido" | "Inactivo">;
}

// RESULTADO DE MATCHING AUTOMÁTICO DE CLIENTE
export interface ClientMatchResult {
  cliente: Cliente;
  scoreMatch: number; // 0 - 100%
  criteriosCumplidos: {
    ticket: boolean;
    zona: boolean;
    zonificacion: boolean;
    altura: boolean;
  };
  razon: string[];
}

export * from "./documentos";
export * from "./negociaciones";
export * from "./matching";
export * from "./comisiones";
export * from "./reportes";
export * from "./configuracion";
export * from "./auditoria";

