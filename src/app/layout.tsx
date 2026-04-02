import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "ComerxIA — Comprá y vendé",
    template: "%s | ComerxIA",
  },
  description:
    "El marketplace inteligente. Publicá en 30 segundos con IA.",
  keywords: [
    "clasificados",
    "comprar",
    "vender",
    "usado",
    "marketplace",
  ],
  openGraph: {
    title: "ComerxIA",
    description: "El marketplace inteligente.",
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
      {process.env.NODE_ENV === "production" && <GoogleAnalytics gaId="G-GQSJBS2HWF" />}
    </html>
  );
}
