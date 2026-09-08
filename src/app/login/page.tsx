import React from "react";
import type { Metadata } from "next";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Central Promundo",
  description: "Ingreso al sistema institucional de corretaje de suelo e inversión.",
};

interface LoginPageProps {
  searchParams?: {
    error?: string;
    msg?: string;
    redirectTo?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorParam = searchParams?.error;
  const customMsg = searchParams?.msg;
  let errorMsg: string | null = null;

  if (customMsg) {
    errorMsg = customMsg;
  } else if (errorParam === "auth_error" || errorParam === "oauth_exchange_failed") {
    errorMsg = "No se pudo completar la autenticación con Google. Intenta nuevamente.";
  } else if (errorParam === "auth_code_missing") {
    errorMsg = "El código de autorización no fue proporcionado.";
  }

  return <LoginClient errorMsg={errorMsg} />;
}
