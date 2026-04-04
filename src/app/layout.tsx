import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const BASE = "https://comerxia.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "ComerxIA — El marketplace inteligente. Todo con el poder de la IA.",
    template: "%s | ComerxIA",
  },
  description:
    "El marketplace inteligente. Todo con el poder de la IA. Publicá tu aviso en 30 segundos con inteligencia artificial. Autos, motos, inmuebles, electrónica y más.",
  keywords: [
    "clasificados argentina",
    "comprar usado argentina",
    "vender online argentina",
    "marketplace argentina",
    "avisos clasificados",
    "comprar moto argentina",
    "vender auto argentina",
    "inmuebles argentina",
    "clasificados san juan",
    "marketplace inteligente",
    "publicar aviso gratis",
  ],
  openGraph: {
    title: "ComerxIA — El marketplace inteligente. Todo con el poder de la IA.",
    description: "Publicá tu aviso en 30 segundos con IA. Autos, motos, inmuebles y más.",
    url: BASE,
    siteName: "ComerxIA",
    locale: "es_AR",
    type: "website",
    images: [{ url: `${BASE}/og-image.jpg`, width: 1200, height: 630, alt: "ComerxIA marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ComerxIA — El marketplace inteligente. Todo con el poder de la IA.",
    description: "Publicá tu aviso en 30 segundos con IA. Autos, motos, inmuebles y más.",
    images: [`${BASE}/og-image.jpg`],
  },
  alternates: { canonical: BASE },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
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
