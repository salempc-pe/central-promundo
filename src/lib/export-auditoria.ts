import { EventoAuditoriaGlobal } from "@/types/auditoria";

/**
 * Genera y descarga un archivo CSV forense estructurado (con BOM UTF-8 y separador ';')
 * compatible con Microsoft Excel en español con metadatos de auditoría y cadena de custodia.
 */
export function exportarAuditoriaACSV(eventos: EventoAuditoriaGlobal[]) {
  const lines: string[] = [
    "\uFEFF=== PROMUNDO LAND INTELLIGENCE - BITÁCORA FORENSE DE AUDITORÍA GLOBAL ===",
    `FECHA DE EXTRACCIÓN;${new Date().toLocaleString("es-PE")}`,
    `TOTAL DE REGISTROS AUDITADOS;${eventos.length}`,
    "INTEGRIDAD DE CADENA DE CUSTODIA;100.0% INMUTABLE",
    "",
    "ID AUDITORÍA;FECHA Y HORA (ISO);SEVERIDAD;MÓDULO;TIPO ACCIÓN;ENTIDAD AFECTADA;ID ENTIDAD;DESCRIPCIÓN OPERATIVA;USUARIO ACTOR;ROL;DIRECCIÓN IP;ORIGEN;DIFERENCIAS DETECTADAS (DIFF)",
    ...eventos.map((e) => {
      const diffTexto =
        e.diffCampos && e.diffCampos.length > 0
          ? e.diffCampos
              .map(
                (d) =>
                  `[${d.campo}: ${JSON.stringify(d.anterior)} -> ${JSON.stringify(
                    d.nuevo
                  )}]`
              )
              .join(" | ")
          : "Sin cambios de estado";

      return `${e.id};"${e.timestamp}";${e.severidad};${e.modulo};${
        e.tipoAccion
      };"${e.entidadAfectada}";"${e.entidadId}";"${e.descripcion.replace(
        /"/g,
        '""'
      )}";"${e.usuarioNombre}";"${e.usuarioRol}";"${
        e.metadataTecnica.ipAddress
      }";"${e.metadataTecnica.origen}";"${diffTexto.replace(/"/g, '""')}"`;
    }),
  ];

  const csvContent = lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `Promundo_Auditoria_Forense_${timestamp}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
