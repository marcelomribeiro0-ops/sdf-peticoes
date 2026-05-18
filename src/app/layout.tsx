import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SDF Petições — Agente de Contestação",
  description: "Agente de IA para auxiliar na elaboração de contestações.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
