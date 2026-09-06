"use client";

import React, { useState } from "react";
import { EvolucionPeriodo } from "@/types/reportes";
import { BarChart3, TrendingUp, DollarSign } from "lucide-react";

interface EvolucionFinancieraChartProps {
  data: EvolucionPeriodo[];
}

export function EvolucionFinancieraChart({ data }: EvolucionFinancieraChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded p-4 text-center text-xs text-slate-500 font-mono">
        Sin datos cronológicos para el período seleccionado.
      </div>
    );
  }

  // Dimensiones del lienzo SVG
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Escala máxima de ventas
  const maxVenta = Math.max(...data.map((d) => d.volumenVentasUSD), 10000000);
  // Redondear techo al múltiplo de 2M superior
  const ceilingVenta = Math.ceil(maxVenta / 2000000) * 2000000;

  const maxArancel = Math.max(...data.map((d) => d.arancelesUSD), 300000);
  const ceilingArancel = Math.ceil(maxArancel / 50000) * 50000;

  const barCount = data.length;
  const groupWidth = chartWidth / barCount;
  const barWidth = Math.min(32, groupWidth * 0.55);

  // Líneas horizontales de referencia (4 divisiones)
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  // Puntos para la línea de tendencia de aranceles (overlay line)
  const trendPoints = data.map((d, i) => {
    const x = paddingLeft + i * groupWidth + groupWidth / 2;
    const ratio = d.arancelesUSD / ceilingArancel;
    const y = paddingTop + chartHeight - ratio * chartHeight;
    return { x, y, valor: d.arancelesUSD };
  });

  const pathD = trendPoints
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const formatM = (m: number) => `$${(m / 1000000).toFixed(1)}M`;
  const formatK = (k: number) => `$${(k / 1000).toFixed(0)}K`;

  return (
    <div className="bg-white border border-slate-200 rounded p-3 flex flex-col justify-between shadow-xs select-none">
      {/* Cabecera del Gráfico */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-blue-50 border border-blue-200">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">
              Evolución de Colocaciones & Aranceles
            </h3>
            <p className="text-3xs text-slate-500 font-sans">
              Volumen transaccionado ($ USD) vs. Comisiones brutas de corretaje (3.00%)
            </p>
          </div>
        </div>

        {/* Leyenda Integrada */}
        <div className="flex items-center space-x-4 text-3xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs inline-block" />
            <span className="text-slate-600 font-medium">Volumen Venta ($M)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-600 inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 -ml-2 inline-block" />
            <span className="text-slate-600 font-medium">Aranceles 3% ($K)</span>
          </div>
        </div>
      </div>

      {/* Contenedor SVG Responsivo */}
      <div className="relative w-full overflow-x-auto pt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[580px] overflow-visible"
        >
          {/* Líneas de Guía Horizontales */}
          {yTicks.map((t, idx) => {
            const y = paddingTop + chartHeight - t * chartHeight;
            const valorVenta = ceilingVenta * t;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 font-mono text-[9px]"
                >
                  {formatM(valorVenta)}
                </text>
              </g>
            );
          })}

          {/* Barras de Volumen de Ventas */}
          {data.map((d, i) => {
            const barHeight = (d.volumenVentasUSD / ceilingVenta) * chartHeight;
            const x = paddingLeft + i * groupWidth + (groupWidth - barWidth) / 2;
            const y = paddingTop + chartHeight - barHeight;
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={d.periodoId}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-all"
              >
                {/* Zona de hover invisible más ancha para facilitar interacción */}
                <rect
                  x={paddingLeft + i * groupWidth}
                  y={paddingTop}
                  width={groupWidth}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Barra Principal */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, barHeight)}
                  rx="2"
                  className={`transition-colors ${
                    isHovered
                      ? "fill-blue-700"
                      : "fill-blue-500 hover:fill-blue-600"
                  }`}
                />

                {/* Etiqueta del Eje X (Mes) */}
                <text
                  x={paddingLeft + i * groupWidth + groupWidth / 2}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className={`font-mono text-[9px] ${
                    isHovered
                      ? "fill-blue-700 font-bold"
                      : "fill-slate-600 font-medium"
                  }`}
                >
                  {d.label.split(" ")[0]}
                </text>
              </g>
            );
          })}

          {/* Línea de Tendencia de Aranceles */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Puntos en la línea de aranceles */}
          {trendPoints.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={isHovered ? "4.5" : "3"}
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth={isHovered ? "2.5" : "2"}
                className="transition-all"
              />
            );
          })}
        </svg>

        {/* Tooltip Dinámico Flotante */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            className="absolute z-20 bg-white border border-slate-300 shadow-lg rounded p-2 text-2xs font-mono pointer-events-none transition-all"
            style={{
              left: `${
                ((paddingLeft + hoveredIndex * groupWidth + groupWidth / 2) /
                  svgWidth) *
                100
              }%`,
              top: "10px",
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">
              {data[hoveredIndex].label}
            </div>
            <div className="space-y-0.5 text-3xs">
              <div className="flex justify-between gap-3 text-slate-600">
                <span>Venta Suelo:</span>
                <strong className="text-blue-700 font-bold">
                  {formatM(data[hoveredIndex].volumenVentasUSD)}
                </strong>
              </div>
              <div className="flex justify-between gap-3 text-slate-600">
                <span>Arancel 3%:</span>
                <strong className="text-emerald-700 font-bold">
                  {formatK(data[hoveredIndex].arancelesUSD)}
                </strong>
              </div>
              <div className="flex justify-between gap-3 text-slate-600">
                <span>Margen Promundo:</span>
                <strong className="text-slate-800">
                  {formatK(data[hoveredIndex].margenPromundoUSD)}
                </strong>
              </div>
              <div className="flex justify-between gap-3 text-slate-500 pt-0.5 border-t border-slate-100">
                <span>Cierres / Área:</span>
                <span>
                  {data[hoveredIndex].dealsCerrados} lts ({data[hoveredIndex].areaM2Transaccionada} m²)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
