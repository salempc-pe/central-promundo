import { TerrenoCompleto, TerrenoFiltros } from "@/types";

/**
 * Genera un archivo CSV/Excel (.xlsx compatible) con formato estructurado
 * y descarga directa en el navegador.
 */
export function exportarTerrenosAExcel(
  terrenos: TerrenoCompleto[],
  filtrosAplicados?: TerrenoFiltros
) {
  const headers = [
    "CÓDIGO INTERNO",
    "DISTRITO",
    "DIRECCIÓN",
    "ZONIFICACIÓN",
    "ÁREA (M²)",
    "FRENTE (M)",
    "FONDO (M)",
    "ALTURA MÁX (PISOS)",
    "COEF. EDIF.",
    "PRECIO M² (USD)",
    "PRECIO TOTAL (USD)",
    "ESTADO",
    "PROPIETARIO / TITULAR",
    "TELÉFONO CONTACTO",
    "EMAIL CONTACTO",
    "TIENE CERTIFICADO CPU",
    "VENCIMIENTO CPU",
    "LATITUD",
    "LONGITUD",
  ];

  const rows = terrenos.map((t) => {
    const docCpu = t.documentos.find((d) => d.tipoDocumento === "Certificado_Parametros");
    return [
      t.codigoInterno,
      t.distrito,
      `"${t.direccion.replace(/"/g, '""')}"`,
      t.zonificacion,
      Number(t.areaM2).toFixed(2),
      t.frenteLinealM ? Number(t.frenteLinealM).toFixed(2) : "",
      t.fondoPromedioM ? Number(t.fondoPromedioM).toFixed(2) : "",
      t.alturaMaxPisos || "",
      t.coeficienteEdificacion ? Number(t.coeficienteEdificacion).toFixed(2) : "",
      Number(t.precioM2).toFixed(2),
      Number(t.precioTotal).toFixed(2),
      t.estadoTerreno,
      `"${t.propietario.razonSocialONombre.replace(/"/g, '""')}"`,
      t.propietario.telefono || "",
      t.propietario.email || "",
      docCpu ? "SÍ" : "NO",
      docCpu?.fechaVencimiento || "N/A",
      t.latitud || "",
      t.longitud || "",
    ];
  });

  const csvContent =
    "\uFEFF" + // BOM para que Excel en español reconozca caracteres latinos y acentos
    [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  link.setAttribute("href", url);
  link.setAttribute("download", `Promundo_Inventario_Terrenos_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
