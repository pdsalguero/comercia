import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ComercIA — Comprá y vendé en San Juan",
    template: "%s | comercIA",
  },
  description:
    "El marketplace inteligente de San Juan. Publicá en 30 segundos con IA.",
  keywords: [
    "clasificados",
    "san juan",
    "comprar",
    "vender",
    "usado",
    "marketplace",
  ],
  openGraph: {
    title: "ComercIA",
    description: "El marketplace inteligente de San Juan.",
    url: "https://comercia.com.ar",
    siteName: "ComercIA",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
