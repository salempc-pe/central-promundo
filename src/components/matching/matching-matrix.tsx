"use client";

import React, { useState } from "react";
import {
  MatchingMatrixData,
  TerrenoCompleto,
  Cliente,
  MatchEvaluationResult,
} from "@/types";
import { evaluarMatch } from "@/lib/services/matching";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Send, Sparkles, Filter } from "lucide-react";

interface MatchingMatrixProps {
  matrixData: MatchingMatrixData;
  onOpenDetail: (match: MatchEvaluationResult) => void;
  onStartDeal: (match: MatchEvaluationResult) => void;
}

export function MatchingMatrixView({
  matrixData,
  onOpenDetail,
  onStartDeal,
}: MatchingMatrixProps) {
  const { terrenos, clientes, matriz } = matrixData;
  const [selectedCell, setSelectedCell] = useState<{
    terreno: TerrenoCompleto;
    cliente: Cliente;
    score: number;
  } | null>(null);

  const [distritoFilter, setDistritoFilter] = useState<string>("TODOS");

  const distritosUnicos = Array.from(
    new Set(terrenos.map((t) => t.distrito))
  ).sort();

  const filteredTerrenos =
    distritoFilter === "TODOS"
      ? terrenos
      : terrenos.filter((t) => t.distrito === distritoFilter);

  const handleCellClick = (terreno: TerrenoCompleto, cliente: Cliente) => {
    const cell = matriz[terreno.id]?.[cliente.id];
    setSelectedCell({
      terreno,
      cliente,
      score: cell ? cell.score : 0,
    });
  };

  const currentMatchEval = selectedCell
    ? evaluarMatch(selectedCell.terreno, selectedCell.cliente)
    : null;

  return (
    <div className="space-y-3 font-sans select-none">
      {/* Barra de Leyenda y Filtros de Matriz */}
      <div className="bg-white border border-slate-200 shadow-xs rounded px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-2xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-600 font-bold uppercase">Leyenda de Calor:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-emerald-100 border border-emerald-300" />
            <span className="text-emerald-700 font-semibold">Prime (≥80%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-blue-100 border border-blue-300" />
            <span className="text-blue-700 font-semibold">Alto (68-79%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-amber-100 border border-amber-300" />
            <span className="text-amber-700 font-semibold">Medio (50-67%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-slate-100 border border-slate-300" />
            <span className="text-slate-500">Bajo (&lt;50%)</span>
          </div>
        </div>

        {/* Filtro por Distrito */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-700">
          <Filter className="w-3 h-3 text-slate-400" />
          <span>Distrito:</span>
          <select
            value={distritoFilter}
            onChange={(e) => setDistritoFilter(e.target.value)}
            className="bg-transparent border-none text-slate-900 font-bold focus:outline-hidden cursor-pointer"
          >
            <option value="TODOS" className="bg-white text-slate-900">
              Todos los distritos ({terrenos.length})
            </option>
            {distritosUnicos.map((d) => (
              <option key={d} value={d} className="bg-white text-slate-900">
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Matriz con Scroll Horizontal y Headers Fijos */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full border-collapse text-left font-mono">
            {/* Header de Constructoras (Columnas X) */}
            <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-200 shadow-xs">
              <tr>
                <th className="sticky left-0 z-30 bg-slate-100 p-2 min-w-[200px] border-r border-slate-200 text-3xs uppercase tracking-wider text-slate-700 font-bold">
                  Lote / Parámetros
                </th>
                {clientes.map((cli) => (
                  <th
                    key={cli.id}
                    className="p-2 min-w-[125px] max-w-[140px] text-3xs border-r border-slate-200 text-slate-700 font-semibold truncate hover:text-slate-900"
                    title={`${cli.razonSocial} (${cli.tipoCliente})\nTicket: $${Number(cli.ticketMin || 0) / 1000}K - $${Number(cli.ticketMax || 0) / 1000}K`}
                  >
                    <div className="truncate font-bold text-slate-900">
                      {cli.razonSocial}
                    </div>
                    <div className="text-3xs text-slate-500 font-normal truncate">
                      {cli.tipoCliente}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Filas de Terrenos (Eje Y) */}
            <tbody>
              {filteredTerrenos.map((terreno) => (
                <tr
                  key={terreno.id}
                  className="border-b border-slate-200 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Celda Fija Izquierda: Datos del Terreno */}
                  <td className="sticky left-0 z-10 bg-white p-2 border-r border-slate-200 min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        {terreno.codigoInterno}
                      </span>
                      <span className="text-3xs text-blue-700 font-bold">
                        {terreno.zonificacion}
                      </span>
                    </div>
                    <div className="text-3xs text-slate-500 flex items-center justify-between mt-0.5">
                      <span className="truncate">{terreno.distrito}</span>
                      <span className="text-emerald-700 font-bold">
                        ${Number(terreno.precioTotal) / 1000}K
                      </span>
                    </div>
                  </td>

                  {/* Celdas de Afinidad Lote x Constructora */}
                  {clientes.map((cliente) => {
                    const cell = matriz[terreno.id]?.[cliente.id];
                    const score = cell ? cell.score : 0;
                    const isSelected =
                      selectedCell?.terreno.id === terreno.id &&
                      selectedCell?.cliente.id === cliente.id;

                    let bgClass = "bg-slate-50 text-slate-400 border-slate-100";
                    if (score >= 80) {
                      bgClass =
                        "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-bold";
                    } else if (score >= 68) {
                      bgClass =
                        "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 font-bold";
                    } else if (score >= 50) {
                      bgClass =
                        "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100";
                    } else {
                      bgClass =
                        "bg-slate-50/40 text-slate-400 border-slate-100 hover:bg-slate-100";
                    }

                    return (
                      <td
                        key={cliente.id}
                        onClick={() => handleCellClick(terreno, cliente)}
                        className={`p-1.5 text-center border-r border-slate-200 cursor-pointer transition-all ${bgClass} ${
                          isSelected ? "ring-2 ring-blue-600 ring-inset" : ""
                        }`}
                        title={`Match: ${score}%\nLote: ${terreno.codigoInterno} (${terreno.distrito})\nComprador: ${cliente.razonSocial}`}
                      >
                        <div className="text-xs font-mono">{score}%</div>
                        <div className="text-3xs opacity-80 text-slate-500">
                          {score >= 80 ? "Prime" : score >= 68 ? "Alto" : score >= 50 ? "Medio" : "Bajo"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel Flotante de Acción Rápida al Seleccionar Celda */}
      {selectedCell && currentMatchEval && (
        <div className="bg-white border border-blue-400 rounded p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xs text-slate-500 font-mono">Intersección Seleccionada:</span>
              <span className="font-bold text-slate-900 font-mono text-xs">
                {selectedCell.terreno.codigoInterno} ({selectedCell.terreno.distrito}) ↔{" "}
                {selectedCell.cliente.razonSocial}
              </span>
            </div>

            <Badge
              className={`font-mono text-2xs font-bold ${
                selectedCell.score >= 80
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                  : selectedCell.score >= 68
                  ? "bg-blue-50 text-blue-700 border border-blue-300"
                  : "bg-amber-50 text-amber-700 border border-amber-300"
              }`}
            >
              {selectedCell.score}% de Afinidad
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenDetail(currentMatchEval)}
              className="h-7 text-xs font-mono border-slate-200 bg-white text-slate-700 hover:bg-slate-50 gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Ver Auditoría Completa</span>
            </Button>

            <Button
              size="sm"
              onClick={() => onStartDeal(currentMatchEval)}
              className="h-7 text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Iniciar Negociación Comercial</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
