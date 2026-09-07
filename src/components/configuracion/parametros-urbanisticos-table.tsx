"use client";

import React, { useState } from "react";
import { ParametroUrbanisticoDistrital } from "@/types/configuracion";
import { ParametroEditDialog } from "./parametro-edit-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Building2,
  Edit2,
  CheckCircle2,
  Sparkles,
  MapPin,
  Filter,
} from "lucide-react";
import { getZonificacionBadgeClass } from "@/lib/constants/zonificaciones";

interface ParametrosUrbanisticosTableProps {
  data: ParametroUrbanisticoDistrital[];
  onUpdateParametro: (
    id: string,
    cambios: Partial<ParametroUrbanisticoDistrital>
  ) => Promise<void>;
}

export function ParametrosUrbanisticosTable({
  data,
  onUpdateParametro,
}: ParametrosUrbanisticosTableProps) {
  const [busqueda, setBusqueda] = useState("");
  const [distritoFiltro, setDistritoFiltro] = useState<string>("todos");
  const [selectedParametro, setSelectedParametro] =
    useState<ParametroUrbanisticoDistrital | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Lista única de distritos disponibles
  const distritos = [
    "todos",
    ...Array.from(new Set(data.map((d) => d.distrito))).sort(),
  ];

  // Filtrado reactivo en cliente
  const filteredData = data.filter((item) => {
    if (distritoFiltro !== "todos" && item.distrito !== distritoFiltro) {
      return false;
    }
    if (busqueda.trim() !== "") {
      const q = busqueda.toLowerCase().trim();
      return (
        item.distrito.toLowerCase().includes(q) ||
        item.zonificacion.toLowerCase().includes(q) ||
        item.ordenanzaReferencia.toLowerCase().includes(q) ||
        item.notasNormativas.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleEdit = (parametro: ParametroUrbanisticoDistrital) => {
    setSelectedParametro(parametro);
    setIsEditDialogOpen(true);
  };

  const getZonifBadge = (zonif: string) => getZonificacionBadgeClass(zonif);

  return (
    <div className="bg-white border border-slate-200 rounded shadow-xs p-3 space-y-3 select-none">
      {/* Barra de Filtros de Normativa */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Input Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por ordenanza, distrito o zonif..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-8 pl-8 text-xs bg-slate-50 border-slate-200"
            />
          </div>

          {/* Selector de Distrito */}
          <div className="flex items-center space-x-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={distritoFiltro}
              onChange={(e) => setDistritoFiltro(e.target.value)}
              className="h-8 px-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {distritos.map((d) => (
                <option key={d} value={d}>
                  {d === "todos" ? "Todos los Distritos" : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-3xs font-mono text-slate-500">
          Mostrando <strong>{filteredData.length}</strong> de{" "}
          <strong>{data.length}</strong> normas distritales
        </div>
      </div>

      {/* Tabla de Alta Densidad */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-mono font-bold text-slate-600 uppercase">
              <th className="py-2 px-2.5">Distrito</th>
              <th className="py-2 px-2 text-center">Zonif.</th>
              <th className="py-2 px-2 text-center">Altura Máx.</th>
              <th className="py-2 px-2 text-center">C.E.</th>
              <th className="py-2 px-2 text-center">Área Libre</th>
              <th className="py-2 px-2 text-center">Frente Mín.</th>
              <th className="py-2 px-2 text-right">Lote Mín.</th>
              <th className="py-2 px-2">Ordenanza Ref.</th>
              <th className="py-2 px-2 text-center">Bono Verde</th>
              <th className="py-2 px-2 text-center">Vigencia</th>
              <th className="py-2 px-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-2xs">
            {filteredData.map((item) => (
              <tr
                key={item.id}
                className="h-9 hover:bg-slate-50/80 transition-colors"
              >
                <td className="py-1 px-2.5 font-sans font-semibold text-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{item.distrito}</span>
                  </div>
                </td>

                <td className="py-1 px-2 text-center">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-3xs border ${getZonifBadge(
                      item.zonificacion
                    )}`}
                  >
                    {item.zonificacion}
                  </span>
                </td>

                <td className="py-1 px-2 text-center text-slate-800 font-bold">
                  {item.alturaMaxPisos} pisos{" "}
                  <span className="text-3xs text-slate-400 font-normal">
                    ({item.alturaMaxMetros}m)
                  </span>
                </td>

                <td className="py-1 px-2 text-center font-bold text-blue-700">
                  {item.coeficienteEdificacion.toFixed(1)}
                </td>

                <td className="py-1 px-2 text-center text-slate-700">
                  {item.areaLibreMinPct}%
                </td>

                <td className="py-1 px-2 text-center text-slate-700">
                  {item.frenteMinimoM.toFixed(1)}m
                </td>

                <td className="py-1 px-2 text-right text-slate-800 font-semibold">
                  {item.loteMinimoM2.toLocaleString()} m²
                </td>

                <td className="py-1 px-2 font-sans text-slate-600 truncate max-w-[180px]">
                  <span title={item.ordenanzaReferencia}>
                    {item.ordenanzaReferencia}
                  </span>
                </td>

                <td className="py-1 px-2 text-center">
                  {item.incentivoViviendaSostenible?.activo ? (
                    <span
                      title={item.incentivoViviendaSostenible.normaRef}
                      className="inline-flex items-center space-x-0.5 px-1 py-0.2 rounded text-3xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>
                        +{item.incentivoViviendaSostenible.alturaAdicionalPisos}p
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-3xs">-</span>
                  )}
                </td>

                <td className="py-1 px-2 text-center">
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-3xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Vigente</span>
                  </span>
                </td>

                <td className="py-1 px-2 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="h-6.5 px-2 text-3xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-transparent hover:border-blue-200"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Edición */}
      <ParametroEditDialog
        parametro={selectedParametro}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={onUpdateParametro}
      />
    </div>
  );
}
