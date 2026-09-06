import { pgEnum } from "drizzle-orm/pg-core";

export const rolUsuarioEnum = pgEnum("rol_usuario", [
  "admin",
  "broker_senior",
  "broker_junior",
]);

export const tipoDocumentoEnum = pgEnum("tipo_documento", [
  "Certificado_Parametros",
  "Partida_Registral",
  "Plano_Catastral",
  "Otros",
]);

export const monedaEnum = pgEnum("moneda", ["USD", "PEN"]);

export const estadoTerrenoEnum = pgEnum("estado_terreno", [
  "Disponible",
  "En Negociacion",
  "Vendido",
  "Inactivo",
]);

export const tipoClienteEnum = pgEnum("tipo_cliente", [
  "Constructora",
  "Fondo_Inversion",
  "Privado",
]);

export const etapaNegociacionEnum = pgEnum("etapa_negociacion", [
  "Ficha_Enviada",
  "En_Evaluacion",
  "Visita_Realizada",
  "LOI_Oferta",
  "Due_Diligence",
  "Cierre_Ganado",
  "Descartado",
]);

export const tipoEventoBitacoraEnum = pgEnum("tipo_evento_bitacora", [
  "Nota",
  "Llamada",
  "Reunion",
  "Cambio_Estado",
  "Oferta_Presentada",
]);

export const estadoPagoComisionEnum = pgEnum("estado_pago_comision", [
  "Pendiente",
  "Facturado",
  "Cobrado",
]);
