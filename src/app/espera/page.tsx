import React from "react";
import type { Metadata } from "next";
import { EsperaClient } from "./espera-client";

export const metadata: Metadata = {
  title: "Solicitud en Revisión | Central Promundo",
  description: "Estado de aprobación de cuenta de usuario institucional.",
};

interface EsperaPageProps {
  searchParams?: {
    denegado?: string;
  };
}

export default function EsperaPage({ searchParams }: EsperaPageProps) {
  const isDenegado = searchParams?.denegado === "1";

  return <EsperaClient isDenegado={isDenegado} />;
}
