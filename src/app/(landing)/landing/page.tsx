import type { Metadata } from "next";
import { ComerxIALanding } from "@/components/ComerciaLanding";

export const metadata: Metadata = {
  title: "ComerxIA — Sacá una foto. Publicá. Vendé.",
  description:
    "Publicá un aviso en 30 segundos. Sacá una foto y te armamos el título, la descripción y el precio sugerido. Gratis, para particulares y comercios de toda la Argentina.",
  keywords: ["marketplace", "clasificados", "argentina", "tienda online", "vender", "comprar", "publicar gratis"],
  openGraph: {
    title: "ComerxIA — Vendé más rápido, en todo el país",
    description: "Sacá una foto y publicá tu aviso en 30 segundos. Gratis.",
    type: "website",
    locale: "es_AR",
    siteName: "ComerxIA",
  },
  twitter: {
    card: "summary_large_image",
    title: "ComerxIA — Sacá una foto. Publicá. Vendé.",
    description: "Publicá un aviso en 30 segundos. Gratis, para particulares y comercios.",
  },
};

export default function LandingPage() {
  return <ComerxIALanding />;
}
