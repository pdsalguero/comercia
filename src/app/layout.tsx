import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const BASE = "https://comerxia.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "ComerxIA — Sacá una foto. Publicá. Vendé en todo el país.",
    template: "%s | ComerxIA",
  },
  description:
    "Comprá y vendé en toda la Argentina. Publicá tu aviso en 30 segundos, gratis y sin comisiones. Autos, motos, inmuebles, electrónica y más. Para particulares y comercios.",
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
    "tienda online gratis argentina",
    "publicar aviso gratis",
  ],
  openGraph: {
    title: "ComerxIA — Sacá una foto. Publicá. Vendé en todo el país.",
    description: "Publicá tu aviso en 30 segundos, gratis. Autos, motos, inmuebles y más.",
    url: BASE,
    siteName: "ComerxIA",
    locale: "es_AR",
    type: "website",
    images: [{ url: `${BASE}/og-image.jpg`, width: 1200, height: 630, alt: "ComerxIA marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ComerxIA — Sacá una foto. Publicá. Vendé en todo el país.",
    description: "Publicá tu aviso en 30 segundos, gratis. Autos, motos, inmuebles y más.",
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
      <head>
        {/* Preconnect a dominios externos críticos para reducir latencia */}
        <link rel="preconnect" href="https://snrxpyolkxcficxnzaxh.supabase.co" />
        <link rel="dns-prefetch" href="https://snrxpyolkxcficxnzaxh.supabase.co" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body style={{ fontFamily: "var(--font-inter), 'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>{children}</body>
      {process.env.NODE_ENV === "production" && <GoogleAnalytics gaId="G-GQSJBS2HWF" />}
    </html>
  );
}
