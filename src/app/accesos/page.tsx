import React from "react";
import type { Metadata } from "next";
import { getUsuariosSolicitudes } from "@/lib/services/auth-service";
import { AccesosClient } from "./accesos-client";

export const metadata: Metadata = {
  title: "Gestión de Accesos | Central Promundo",
  description: "Módulo administrativo para aprobación de solicitudes y control de usuarios.",
};

export const revalidate = 0; // Datos siempre frescos

export default async function AccesosPage() {
  const usuarios = await getUsuariosSolicitudes();

  return <AccesosClient initialUsuarios={usuarios} />;
}
