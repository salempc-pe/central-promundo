import { MatchEvaluationResult } from "@/types";

/**
 * Exporta un listado de resultados de matching a formato CSV compatible con Excel.
 */
export function exportarMatchingCSV(
  results: MatchEvaluationResult[],
  titulo: string = "matching_promundo"
) {
  if (!results || results.length === 0) return;

  const headers = [
    "ID Match",
    "Score Match (%)",
    "Nivel",
    "Código Lote",
    "Distrito Lote",
    "Zonificación Lote",
    "Precio Lote USD",
    "Área m2 Lote",
    "Altura Pisos Lote",
    "Frente Lineal m",
    "Constructora / Fondo",
    "Tipo Cliente",
    "Ticket Min Comprador USD",
    "Ticket Max Comprador USD",
    "Zonas Interés",
    "Contacto",
    "Teléfono",
    "Email",
    "Puntos Ticket",
    "Puntos Zona",
    "Puntos Zonificación",
    "Puntos Altura",
    "Puntos Frente",
    "Bonus CPU",
    "Recomendación Comercial",
  ];

  const rows = results.map((r) => [
    `"${r.id}"`,
    `"${r.scoreMatch}%"`,
    `"${r.nivelCompatibilidad}"`,
    `"${r.terreno.codigoInterno}"`,
    `"${r.terreno.distrito}"`,
    `"${r.terreno.zonificacion}"`,
    `"${Number(r.terreno.precioTotal).toFixed(2)}"`,
    `"${r.terreno.areaM2}"`,
    `"${r.terreno.alturaMaxPisos || 0}"`,
    `"${r.terreno.frenteLinealM || 0}"`,
    `"${r.cliente.razonSocial.replace(/"/g, '""')}"`,
    `"${r.cliente.tipoCliente}"`,
    `"${r.cliente.ticketMin ? Number(r.cliente.ticketMin).toFixed(2) : ""}"`,
    `"${r.cliente.ticketMax ? Number(r.cliente.ticketMax).toFixed(2) : ""}"`,
    `"${(r.cliente.zonasInteres || []).join("; ")}"`,
    `"${r.cliente.contactoNombre || ""}"`,
    `"${r.cliente.telefono || ""}"`,
    `"${r.cliente.email || ""}"`,
    r.breakdown.ticketScore,
    r.breakdown.zonaScore,
    r.breakdown.zonifScore,
    r.breakdown.alturaScore,
    r.breakdown.frenteAreaScore,
    r.breakdown.bonusCpuVigente,
    `"${r.recomendacionComercial.replace(/"/g, '""')}"`,
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fecha = new Date().toISOString().split("T")[0];

  link.setAttribute("href", url);
  link.setAttribute("download", `${titulo}_${fecha}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
