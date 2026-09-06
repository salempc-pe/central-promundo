import {
  DocumentoConTerreno,
  DocumentoFiltros,
  DocumentosKpis,
  EstadoVigencia,
  TipoDocumento,
  UploadDocumentoInput,
} from "@/types/documentos";
import { mockDocumentosSeed } from "@/lib/mock/documentos-seed";
import { mockTerrenosCompletos } from "@/lib/mock/terrenos-seed";

// Store reactivo en memoria para persistencia local durante la sesión
let memoryDocumentos: DocumentoConTerreno[] = [...mockDocumentosSeed];

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
      ? new Date(fechaVencimiento)
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

/**
 * Obtiene la lista de documentos aplicando filtros dinámicos y actualizando semáforos
 */
export async function getDocumentos(
  filtros?: DocumentoFiltros
): Promise<DocumentoConTerreno[]> {
  // Simulación de latencia de red ultrarrápida (30ms)
  await new Promise((resolve) => setTimeout(resolve, 30));

  let results = memoryDocumentos.map((doc) => {
    const vigencia = calculateVigencia(doc.fechaVencimiento);
    return {
      ...doc,
      estadoVigencia: vigencia.estadoVigencia,
      diasParaVencer: vigencia.diasParaVencer,
    };
  });

  if (!filtros) return results;

  if (filtros.busqueda && filtros.busqueda.trim() !== "") {
    const q = filtros.busqueda.toLowerCase().trim();
    const normQ = q.replace("terr-", "tr-");
    results = results.filter(
      (doc) =>
        doc.nombreArchivo.toLowerCase().includes(q) ||
        (doc.numeroDocumento && doc.numeroDocumento.toLowerCase().includes(q)) ||
        (doc.entidadEmisora && doc.entidadEmisora.toLowerCase().includes(q)) ||
        (doc.notas && doc.notas.toLowerCase().includes(q)) ||
        doc.terrenoId.toLowerCase().includes(q) ||
        doc.terrenoId.toLowerCase().includes(normQ) ||
        doc.terreno.codigoInterno.toLowerCase().includes(q) ||
        doc.terreno.distrito.toLowerCase().includes(q) ||
        doc.terreno.direccion.toLowerCase().includes(q)
    );
  }

  if (filtros.terrenoId) {
    const normTId = filtros.terrenoId.toLowerCase().replace("terr-", "tr-");
    results = results.filter(
      (doc) =>
        doc.terrenoId.toLowerCase() === filtros.terrenoId!.toLowerCase() ||
        doc.terrenoId.toLowerCase() === normTId ||
        doc.terreno.codigoInterno.toLowerCase() === filtros.terrenoId!.toLowerCase()
    );
  }

  if (filtros.distrito && filtros.distrito.length > 0) {
    results = results.filter((doc) =>
      filtros.distrito!.includes(doc.terreno.distrito)
    );
  }

  if (filtros.tipoDocumento && filtros.tipoDocumento.length > 0) {
    results = results.filter((doc) =>
      filtros.tipoDocumento!.includes(doc.tipoDocumento)
    );
  }

  if (filtros.estadoVigencia && filtros.estadoVigencia.length > 0) {
    results = results.filter((doc) =>
      filtros.estadoVigencia!.includes(doc.estadoVigencia)
    );
  }

  if (typeof filtros.esConfidencial === "boolean") {
    results = results.filter(
      (doc) => doc.esConfidencial === filtros.esConfidencial
    );
  }

  return results;
}

/**
 * Obtiene los documentos de un terreno específico
 */
export async function getDocumentosByTerrenoId(
  terrenoId: string
): Promise<DocumentoConTerreno[]> {
  return getDocumentos({ terrenoId });
}

/**
 * Calcula las métricas de control (KPIs) para la cabecera documental
 */
export async function getDocumentoStats(): Promise<DocumentosKpis> {
  const todos = await getDocumentos();
  const cpus = todos.filter((d) => d.tipoDocumento === "Certificado_Parametros");

  const cpusVigentes = cpus.filter((d) => d.estadoVigencia === "vigente").length;
  const cpusPorVencer = cpus.filter((d) => d.estadoVigencia === "por_vencer").length;
  const cpusVencidos = cpus.filter((d) => d.estadoVigencia === "vencido").length;

  // Lotes que no tienen CPU
  const terrenosConCpu = new Set(cpus.map((d) => d.terrenoId));
  const totalTerrenosRegistrados = mockTerrenosCompletos.length;
  const terrenosSinCpu = Math.max(
    0,
    totalTerrenosRegistrados - terrenosConCpu.size
  );

  const documentosConfidenciales = todos.filter((d) => d.esConfidencial).length;
  const espacioUtilizadoBytes = todos.reduce(
    (acc, cur) => acc + (cur.tamanoBytes || 0),
    0
  );

  return {
    totalDocumentos: todos.length,
    totalCpus: cpus.length,
    cpusVigentes,
    cpusPorVencer,
    cpusVencidos,
    terrenosSinCpu,
    documentosConfidenciales,
    espacioUtilizadoBytes,
  };
}

/**
 * Registra o sube un nuevo documento vinculado a un lote
 */
export async function createDocumento(
  input: UploadDocumentoInput
): Promise<DocumentoConTerreno> {
  const terrenoEncontrado = mockTerrenosCompletos.find(
    (t) => t.id === input.terrenoId
  );

  if (!terrenoEncontrado) {
    throw new Error(`Terreno con ID ${input.terrenoId} no fue encontrado.`);
  }

  const vigencia = calculateVigencia(input.fechaVencimiento);

  const nuevoDoc: DocumentoConTerreno = {
    id: `doc-${Date.now()}`,
    terrenoId: input.terrenoId,
    tipoDocumento: input.tipoDocumento,
    nombreArchivo: input.nombreArchivo,
    archivoUrl:
      input.archivoUrl ||
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fechaEmision: input.fechaEmision || null,
    fechaVencimiento: input.fechaVencimiento || null,
    esConfidencial: input.esConfidencial,
    createdAt: new Date().toISOString(),
    tamanoBytes: input.tamanoBytes || 1500000,
    mimeType: input.mimeType || "application/pdf",
    extension: input.nombreArchivo.split(".").pop()?.toLowerCase() || "pdf",
    numeroDocumento: input.numeroDocumento,
    entidadEmisora: input.entidadEmisora,
    notas: input.notas,
    estadoVigencia: vigencia.estadoVigencia,
    diasParaVencer: vigencia.diasParaVencer,
    terreno: {
      id: terrenoEncontrado.id,
      codigoInterno: terrenoEncontrado.codigoInterno,
      distrito: terrenoEncontrado.distrito,
      direccion: terrenoEncontrado.direccion,
      zonificacion: terrenoEncontrado.zonificacion,
      alturaMaxPisos: terrenoEncontrado.alturaMaxPisos,
      areaM2: String(terrenoEncontrado.areaM2),
      moneda: terrenoEncontrado.moneda,
      precioTotal: String(terrenoEncontrado.precioTotal),
      precioM2: String(terrenoEncontrado.precioM2),
      propietarioNombre: terrenoEncontrado.propietario?.razonSocialONombre,
    },
  };

  memoryDocumentos = [nuevoDoc, ...memoryDocumentos];
  return nuevoDoc;
}

/**
 * Conmuta el estado de confidencialidad de un documento
 */
export async function toggleConfidencial(
  id: string
): Promise<DocumentoConTerreno | null> {
  const doc = memoryDocumentos.find((d) => d.id === id);
  if (!doc) return null;

  doc.esConfidencial = !doc.esConfidencial;
  return { ...doc };
}

/**
 * Elimina un documento
 */
export async function deleteDocumento(id: string): Promise<boolean> {
  const lenInicial = memoryDocumentos.length;
  memoryDocumentos = memoryDocumentos.filter((d) => d.id !== id);
  return memoryDocumentos.length < lenInicial;
}
