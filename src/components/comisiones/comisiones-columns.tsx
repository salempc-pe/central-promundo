"use client";

import React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ComisionLiquidacion, EstadoLiquidacion } from "@/types/comisiones";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Building,
  User,
  MapPin,
  ArrowUpDown,
  MoreHorizontal,
  FileCheck2,
  Landmark,
  Receipt,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ComisionesColumnsCallbacks {
  onVerDetalle: (item: ComisionLiquidacion) => void;
  onCambiarEstado: (item: ComisionLiquidacion, estadoSiguiente?: EstadoLiquidacion) => void;
  onGenerarVoucher: (item: ComisionLiquidacion) => void;
}

export function getComisionesColumns({
  onVerDetalle,
  onCambiarEstado,
  onGenerarVoucher,
}: ComisionesColumnsCallbacks): ColumnDef<ComisionLiquidacion>[] {
  const formatUSD = (monto: number | string) => {
    const val = typeof monto === "string" ? parseFloat(monto) : monto;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const getEstadoBadge = (estado: EstadoLiquidacion) => {
    switch (estado) {
      case "Pendiente":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-2.5 h-2.5 mr-1 text-slate-500" />
            Pendiente
          </span>
        );
      case "Facturado":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <FileSpreadsheet className="w-2.5 h-2.5 mr-1 text-amber-600" />
            Facturado
          </span>
        );
      case "Cobrado":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-blue-600" />
            Cobrado
          </span>
        );
      case "Liquidado":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileCheck2 className="w-2.5 h-2.5 mr-1 text-emerald-600" />
            Liquidado
          </span>
        );
      default:
        return null;
    }
  };

  return [
    // 1. Selección
    {
      id: "select",
      header: ({ table }) => (
        <div
          className="flex items-center justify-center w-full h-full cursor-pointer py-1"
          onClick={(e) => {
            e.stopPropagation();
            table.toggleAllPageRowsSelected(!table.getIsAllPageRowsSelected());
          }}
        >
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todos"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div
          className="flex items-center justify-center w-full h-full cursor-pointer py-1"
          onClick={(e) => {
            e.stopPropagation();
            row.toggleSelected(!row.getIsSelected());
          }}
        >
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 36,
    },

    // 2. Código de Liquidación
    {
      accessorKey: "codigoLiquidacion",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-7 -ml-2 text-2xs font-mono font-semibold text-slate-700 hover:text-slate-900"
        >
          <span>LIQUIDACIÓN</span>
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <button
            onClick={() => onVerDetalle(item)}
            className="text-left font-mono text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
          >
            <span>{item.codigoLiquidacion}</span>
          </button>
        );
      },
      size: 90,
    },

    // 3. Terreno & Ubicación
    {
      id: "terreno",
      header: "TERRENO / DISTRITO",
      cell: ({ row }) => {
        const t = row.original.terreno;
        return (
          <div className="flex flex-col min-w-0 max-w-[170px]">
            <div className="flex items-center space-x-1.5">
              <Link
                href={`/terrenos?q=${t.codigoInterno}`}
                className="font-mono text-3xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                title="Ver lote en Data Grid de Terrenos"
              >
                {t.codigoInterno}
              </Link>
              <Link
                href={`/mapa?terrenoId=${t.id}`}
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="Ver en mapa geoespacial"
              >
                <MapPin className="w-2.5 h-2.5" />
              </Link>
              <span className="text-3xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-700 truncate">
                {t.distrito}
              </span>
            </div>
            <span className="text-3xs text-slate-500 truncate" title={t.direccion}>
              {t.direccion}
            </span>
          </div>
        );
      },
      size: 170,
    },

    // 4. Constructora / Cliente
    {
      id: "cliente",
      header: "CONSTRUCTORA / CLIENTE",
      cell: ({ row }) => {
        const c = row.original.cliente;
        const ruc = row.original.rucReceptor;
        return (
          <div className="flex flex-col min-w-0 max-w-[160px]">
            <span className="text-xs font-medium text-slate-800 truncate" title={c.razonSocial}>
              {c.razonSocial}
            </span>
            <span className="font-mono text-3xs text-slate-500">
              RUC: {ruc || "N/A"}
            </span>
          </div>
        );
      },
      size: 160,
    },

    // 5. Broker Responsable
    {
      id: "broker",
      header: "BROKER",
      cell: ({ row }) => {
        const b = row.original.broker;
        return (
          <div className="flex items-center space-x-1.5 min-w-0 max-w-[130px]">
            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
              <User className="w-3 h-3 text-slate-600" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-slate-800 truncate">
                {b.nombre}
              </span>
              <span className="text-3xs font-mono text-slate-500 uppercase">
                {b.rol.replace("_", " ")}
              </span>
            </div>
          </div>
        );
      },
      size: 130,
    },

    // 6. Monto de Venta
    {
      accessorKey: "montoVentaFinal",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-7 text-2xs font-mono font-semibold text-slate-700 hover:text-slate-900"
          >
            <span>VENTA LOTE</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-right font-mono text-xs text-slate-700 font-medium">
            {formatUSD(row.original.montoVentaFinal)}
          </div>
        );
      },
      size: 110,
    },

    // 7. Comisión Bruta Total (3.00%)
    {
      accessorKey: "montoComisionTotal",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-7 text-2xs font-mono font-semibold text-slate-700 hover:text-slate-900"
          >
            <span>ARANCEL (3%)</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <div className="font-mono text-xs font-bold text-slate-900">
              {formatUSD(row.original.montoComisionTotal)}
            </div>
            <div className="text-3xs font-mono text-slate-500">
              +18% IGV: {formatUSD(row.original.montoFacturadoIGV)}
            </div>
          </div>
        );
      },
      size: 130,
    },

    // 8. Comprobante & SPOT
    {
      id: "factura",
      header: "COMPROBANTE",
      cell: ({ row }) => {
        const item = row.original;
        if (!item.numeroFactura) {
          return (
            <span className="text-3xs font-mono text-slate-500 italic">
              Sin Facturar
            </span>
          );
        }
        return (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-semibold text-slate-800">
              {item.numeroFactura}
            </span>
            <span className="text-3xs font-mono text-slate-500">
              {item.numeroConstanciaDetraccion
                ? `SPOT: ${item.numeroConstanciaDetraccion}`
                : "SPOT: Pendiente"}
            </span>
          </div>
        );
      },
      size: 110,
    },

    // 9. Estado de Liquidación
    {
      accessorKey: "estadoLiquidacion",
      header: "ESTADO",
      cell: ({ row }) => {
        return getEstadoBadge(row.original.estadoLiquidacion);
      },
      size: 100,
    },

    // 10. Split Interno
    {
      id: "splits",
      header: "DISTRIBUCIÓN",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col text-3xs font-mono leading-tight">
            <div className="flex justify-between gap-1 text-slate-600">
              <span>Promundo (50%):</span>
              <strong className="text-slate-800">{formatUSD(item.comisionEmpresa)}</strong>
            </div>
            <div className="flex justify-between gap-1 text-slate-600">
              <span>Broker (50%):</span>
              <strong className="text-purple-700">{formatUSD(item.montoNetoBrokerUSD)}</strong>
            </div>
          </div>
        );
      },
      size: 140,
    },

    // 11. Acciones
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-white border-slate-200 text-xs">
                <DropdownMenuLabel className="text-3xs uppercase font-mono text-slate-500">
                  Operaciones {item.codigoLiquidacion}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem
                  onClick={() => onVerDetalle(item)}
                  className="text-slate-700 cursor-pointer text-xs"
                >
                  <FileText className="w-3.5 h-3.5 mr-2 text-blue-600" />
                  Ver Ficha de Liquidación
                </DropdownMenuItem>

                {/* Acciones contextuales según estado */}
                {item.estadoLiquidacion === "Pendiente" && (
                  <DropdownMenuItem
                    onClick={() => onCambiarEstado(item, "Facturado")}
                    className="text-amber-700 cursor-pointer text-xs font-medium"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-2 text-amber-600" />
                    Registrar Factura Comercial
                  </DropdownMenuItem>
                )}

                {item.estadoLiquidacion === "Facturado" && (
                  <DropdownMenuItem
                    onClick={() => onCambiarEstado(item, "Cobrado")}
                    className="text-blue-700 cursor-pointer text-xs font-medium"
                  >
                    <Landmark className="w-3.5 h-3.5 mr-2 text-blue-600" />
                    Registrar Cobranza & SPOT
                  </DropdownMenuItem>
                )}

                {item.estadoLiquidacion === "Cobrado" && (
                  <DropdownMenuItem
                    onClick={() => onCambiarEstado(item, "Liquidado")}
                    className="text-emerald-700 cursor-pointer text-xs font-medium"
                  >
                    <Receipt className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                    Liquidar y Pagar a Broker
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem
                  onClick={() => onGenerarVoucher(item)}
                  className="text-slate-700 cursor-pointer text-xs"
                >
                  <FileCheck2 className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  Voucher / Recibo Imprimible
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 45,
    },
  ];
}
