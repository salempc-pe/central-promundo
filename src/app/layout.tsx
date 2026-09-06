import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Promundo Sistema | CRM & ERP Inmobiliario de Inversión",
  description:
    "Plataforma web operativa de alta densidad para corredores de terrenos de inversión, constructoras y fondos de inversión.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="h-screen w-screen overflow-hidden flex bg-slate-100 text-slate-900 antialiased font-sans">
        {/* Sidebar fija */}
        <Sidebar />

        {/* Contenido principal con Header superior */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-slate-50/70 p-3">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
