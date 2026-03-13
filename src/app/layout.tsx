import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "ComerxIA — Comprá y vendé en San Juan",
    template: "%s | ComerxIA",
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
    title: "ComerxIA",
    description: "El marketplace inteligente de San Juan.",
    url: "https://comerxia.com.ar",
    siteName: "ComerxIA",
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
    <html lang="es" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), 'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{children}</body>
    </html>
  );
}
