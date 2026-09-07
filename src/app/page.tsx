import React from "react";
import Link from "next/link";
import {
  FileCheck,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink,
  Plus,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { getSolicitudesPendientesCount } from "@/lib/services/auth-service";
import {
  getDashboardKpisAction,
  getRecentTerrenosAction,
} from "@/lib/actions/dashboard-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatArea, formatPricePerM2 } from "@/lib/utils";

export const revalidate = 0;

export default async function DashboardPage() {
  const [pendientesCount, kpis, terrenosDestacados] = await Promise.all([
    getSolicitudesPendientesCount(),
    getDashboardKpisAction(),
    getRecentTerrenosAction(5),
  ]);

  return (
    <div className="space-y-3">
      {/* Banner de Solicitudes Pendientes para el Administrador */}
      {pendientesCount > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded px-3 py-2 flex items-center justify-between text-2xs text-amber-900 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
            <span>
              <strong>Alerta de Acceso Institucional:</strong> Hay{" "}
              <strong className="font-mono font-bold underline">
                {pendientesCount} solicitud(es) de acceso
              </strong>{" "}
              vía Google en espera de revisión fiduciaria. Los postulantes no tienen acceso al catálogo de suelo.
            </span>
          </div>
          <Link
            href="/accesos"
            className="flex items-center gap-1 font-mono font-bold text-amber-800 hover:text-amber-950 hover:underline shrink-0 bg-white/70 border border-amber-300 px-2 py-0.5 rounded text-3xs"
          >
            <ShieldCheck className="w-3 h-3 text-amber-600" />
            <span>Gestionar Solicitudes &rarr;</span>
          </Link>
        </div>
      )}

      {/* Título de Sección y Acciones Rápidas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
            Centro de Control Operativo
          </h1>
          <p className="text-2xs text-slate-500 font-mono">
            Pipeline activo de suelo comercial e inversiones en Lima Metropolitana
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/documentos?estado=por_vencer">
            <Button variant="outline" size="sm" className="h-7 text-2xs gap-1 font-mono hover:bg-slate-100">
              <FileCheck className="w-3 h-3 text-slate-600" />
              <span>Auditar Vencimientos</span>
            </Button>
          </Link>
          <Link href="/terrenos">
            <Button size="sm" className="h-7 text-2xs gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium">
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Lote</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid Compacto con Enlaces Directos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        <Link href="/terrenos" className="block group">
          <Card className="border-slate-200 group-hover:border-blue-400 group-hover:shadow-xs transition-all cursor-pointer">
            <CardContent className="p-2.5">
              <div className="text-3xs font-mono uppercase text-slate-500 group-hover:text-blue-600">Lotes en Cartera</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                {kpis.lotesEnCartera} lotes
              </div>
              <div className="text-3xs text-emerald-600 font-mono flex items-center mt-1">
                <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> +{kpis.lotesNuevosEsteMes} este mes
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/mapa" className="block group">
          <Card className="border-slate-200 group-hover:border-blue-400 group-hover:shadow-xs transition-all cursor-pointer">
            <CardContent className="p-2.5">
              <div className="text-3xs font-mono uppercase text-slate-500 group-hover:text-blue-600">Área Total en Gestión</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                {kpis.areaTotalM2.toLocaleString()} m²
              </div>
              <div className="text-3xs text-slate-400 font-mono mt-1">
                {kpis.areaTotalHectareas} hectáreas
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pipeline" className="block group">
          <Card className="border-slate-200 group-hover:border-blue-400 group-hover:shadow-xs transition-all cursor-pointer">
            <CardContent className="p-2.5">
              <div className="text-3xs font-mono uppercase text-slate-500 group-hover:text-blue-600">Pipeline en Negociación</div>
              <div className="text-base font-bold text-blue-600 font-mono mt-0.5">
                ${kpis.pipelineMontoUSD.toLocaleString()}
              </div>
              <div className="text-3xs text-blue-500 font-mono mt-1">
                {kpis.pipelineDealsActivos} ofertas en curso
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/matching" className="block group">
          <Card className="border-slate-200 group-hover:border-blue-400 group-hover:shadow-xs transition-all cursor-pointer">
            <CardContent className="p-2.5">
              <div className="text-3xs font-mono uppercase text-slate-500 group-hover:text-blue-600">Constructoras Registradas</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                {kpis.constructorasTotal} fondos/desarr.
              </div>
              <div className="text-3xs text-slate-400 font-mono mt-1">Mandatos activos en BD</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/documentos?estado=por_vencer" className="block group">
          <Card className="border-slate-200 bg-amber-50/40 border-amber-200 group-hover:border-amber-400 group-hover:shadow-xs transition-all cursor-pointer">
            <CardContent className="p-2.5">
              <div className="text-3xs font-mono uppercase text-amber-800 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Certificados por Vencer</span>
              </div>
              <div className="text-base font-bold text-amber-900 font-mono mt-0.5">
                {kpis.documentosPorVencer} lote(s)
              </div>
              <div className="text-3xs text-amber-700 font-mono mt-1">&lt; 30 días restantes</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Grid Principal: Data Grid Rápido + Vista Previa de Módulos */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Tabla Rápida de Lotes (3 columnas) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Inventario Destacado (Últimas Altas en PostgreSQL)
              </span>
              <Badge variant="secondary" className="font-mono">
                {terrenosDestacados.length} registros
              </Badge>
            </div>
            <Link
              href="/terrenos"
              className="text-2xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 font-mono"
            >
              <span>Abrir Data Grid Completo</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">CÓDIGO</TableHead>
                <TableHead>DISTRITO & DIRECCIÓN</TableHead>
                <TableHead className="w-20">ZONIF.</TableHead>
                <TableHead className="text-right w-24">ÁREA</TableHead>
                <TableHead className="text-right w-20">FRENTE</TableHead>
                <TableHead className="text-right w-28">PRECIO/M²</TableHead>
                <TableHead className="text-right w-32">PRECIO TOTAL</TableHead>
                <TableHead className="w-24">ESTADO</TableHead>
                <TableHead className="w-24 text-center">PARÁMETROS</TableHead>
                <TableHead className="w-20 text-center">MATCH</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terrenosDestacados.map((t) => (
                <TableRow key={t.codigo} className="dense-row-hover">
                  <TableCell className="font-mono font-bold text-xs">
                    <Link
                      href={`/terrenos?q=${t.codigo}`}
                      className="text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1"
                    >
                      {t.codigo}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/terrenos?q=${t.codigo}`} className="group block">
                      <div className="font-medium text-slate-900 text-xs group-hover:text-blue-700 group-hover:underline">
                        {t.distrito}
                      </div>
                      <div className="text-3xs text-slate-500 truncate max-w-xs">{t.direccion}</div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-2xs bg-slate-50 font-bold">
                      {t.zonificacion}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatArea(t.areaM2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {t.frenteM !== null ? `${t.frenteM} m` : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-slate-900 text-xs">
                    {formatPricePerM2(t.precioM2, t.moneda)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-slate-900 text-xs">
                    {formatCurrency(t.precioTotal, t.moneda)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.estado === "Disponible"
                          ? "success"
                          : t.estado === "En Negociacion"
                          ? "warning"
                          : t.estado === "Vendido"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {t.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {t.tieneParametros ? (
                      <Link href={`/documentos?q=${t.codigo}`}>
                        <span className="inline-flex items-center text-3xs font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition-colors cursor-pointer">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> PDF
                        </span>
                      </Link>
                    ) : (
                      <span className="inline-flex items-center text-3xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Sin adjunto
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/matching?terrenoId=${t.codigo}`}>
                      <span className="inline-flex items-center text-2xs font-mono font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer">
                        {t.matchingCount} match
                      </span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Panel Lateral de Acceso Rápido y Estado de la Arquitectura */}
        <div className="space-y-3">
          <Card className="border-slate-200">
            <CardHeader className="p-2.5">
              <CardTitle className="text-xs font-bold text-slate-800">
                Estado del Motor Backend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 space-y-2 text-2xs font-mono">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Base de Datos:</span>
                <span className="text-emerald-600 font-semibold">PostgreSQL (Supabase)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">PostGIS Ext.:</span>
                <span className="text-emerald-600 font-semibold">HABILITADO (SRID 4326)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">ORM:</span>
                <span className="text-slate-800 font-semibold">Drizzle ORM v0.39</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Esquema Relacional:</span>
                <span className="text-slate-800 font-semibold">8 Tablas + 8 Enums</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Spatial Index:</span>
                <span className="text-slate-800 font-semibold">GIST(geom)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Persistencia de Datos:</span>
                <span className="text-emerald-600 font-semibold">100% PostgreSQL Real</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white text-slate-800 shadow-xs">
            <CardHeader className="p-2.5 bg-slate-50 border-b border-slate-200">
              <CardTitle className="text-xs font-bold text-slate-900">
                Lógica de Matching Inmobiliario
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 space-y-1.5 text-2xs">
              <p className="text-slate-600">
                El motor cruza automáticamente cada alta de terreno en PostgreSQL con:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700 font-mono text-3xs">
                <li>Ticket Financiero (mín - máx)</li>
                <li>Zonas de Interés (distrito)</li>
                <li>Zonificación técnica (RDA, CZ, etc.)</li>
                <li>Altura mínima en pisos requerida</li>
              </ul>
              <div className="pt-1.5">
                <Link href="/matching" className="w-full block">
                  <Button variant="dense" className="w-full text-2xs h-6 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                    Ejecutar Re-Matching Global
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
