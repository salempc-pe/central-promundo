import { Metadata } from "next";
import { ConfiguracionClient } from "./configuracion-client";

export const metadata: Metadata = {
  title: "Configuración GIS & Parámetros Normativos | Promundo Sistema",
  description:
    "Gobernanza de parámetros urbanísticos distritales de Lima, calibración del motor de matching lote-constructora y telemetría de base de datos PostGIS.",
};

export default function ConfiguracionPage() {
  return <ConfiguracionClient />;
}
