import { relations } from "drizzle-orm";
import {
  usuarios,
  propietarios,
  terrenos,
  documentosTerreno,
  clientes,
  negociaciones,
  bitacoraNegociacion,
  comisionesCierres,
} from "./tables";

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  negociaciones: many(negociaciones),
  bitacoras: many(bitacoraNegociacion),
}));

export const propietariosRelations = relations(propietarios, ({ many }) => ({
  terrenos: many(terrenos),
}));

export const terrenosRelations = relations(terrenos, ({ one, many }) => ({
  propietario: one(propietarios, {
    fields: [terrenos.propietarioId],
    references: [propietarios.id],
  }),
  documentos: many(documentosTerreno),
  negociaciones: many(negociaciones),
}));

export const documentosTerrenoRelations = relations(documentosTerreno, ({ one }) => ({
  terreno: one(terrenos, {
    fields: [documentosTerreno.terrenoId],
    references: [terrenos.id],
  }),
}));

export const clientesRelations = relations(clientes, ({ many }) => ({
  negociaciones: many(negociaciones),
}));

export const negociacionesRelations = relations(negociaciones, ({ one, many }) => ({
  terreno: one(terrenos, {
    fields: [negociaciones.terrenoId],
    references: [terrenos.id],
  }),
  cliente: one(clientes, {
    fields: [negociaciones.clienteId],
    references: [clientes.id],
  }),
  broker: one(usuarios, {
    fields: [negociaciones.brokerId],
    references: [usuarios.id],
  }),
  bitacoras: many(bitacoraNegociacion),
  comision: one(comisionesCierres, {
    fields: [negociaciones.id],
    references: [comisionesCierres.negociacionId],
  }),
}));

export const bitacoraNegociacionRelations = relations(bitacoraNegociacion, ({ one }) => ({
  negociacion: one(negociaciones, {
    fields: [bitacoraNegociacion.negociacionId],
    references: [negociaciones.id],
  }),
  usuario: one(usuarios, {
    fields: [bitacoraNegociacion.usuarioId],
    references: [usuarios.id],
  }),
}));

export const comisionesCierresRelations = relations(comisionesCierres, ({ one }) => ({
  negociacion: one(negociaciones, {
    fields: [comisionesCierres.negociacionId],
    references: [negociaciones.id],
  }),
}));
