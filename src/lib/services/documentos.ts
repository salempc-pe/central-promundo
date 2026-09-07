import { EstadoVigencia } from "@/types/documentos";

/**
 * Calcula el estado de vigencia y los días restantes para el vencimiento de un documento
 */
export function calculateVigencia(
  fechaVencimiento: string | Date | null | undefined
): { estadoVigencia: EstadoVigencia; diasParaVencer: number | null } {
  if (!fechaVencimiento) {
    return { estadoVigencia: "permanente", diasParaVencer: null };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fecha =
    typeof fechaVencimiento === "string"
      ? new Date(
          fechaVencimiento.includes("T")
            ? fechaVencimiento
            : `${fechaVencimiento}T00:00:00`
        )
      : new Date(fechaVencimiento.getTime());
  fecha.setHours(0, 0, 0, 0);

  if (isNaN(fecha.getTime())) {
    return { estadoVigencia: "permanente", diasParaVencer: null };
  }

  const diffMs = fecha.getTime() - hoy.getTime();
  const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (dias < 0) {
    return { estadoVigencia: "vencido", diasParaVencer: dias };
  } else if (dias <= 60) {
    return { estadoVigencia: "por_vencer", diasParaVencer: dias };
  } else {
    return { estadoVigencia: "vigente", diasParaVencer: dias };
  }
}
