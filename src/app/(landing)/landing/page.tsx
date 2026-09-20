import type { Metadata } from "next";
import { ComerxIALanding } from "@/components/ComerciaLanding";

export const metadata: Metadata = {
  title: "ComerxIA — Vendé tu auto o moto en 30 segundos",
  description:
    "Sacá una foto de tu vehículo y publicá en 30 segundos: te armamos el título, la descripción y el precio sugerido. Gratis, para particulares y concesionarias de toda la Argentina.",
  keywords: ["autos usados", "motos usadas", "camionetas", "clasificados de autos", "argentina", "vender auto", "comprar auto", "concesionarias", "publicar gratis"],
  openGraph: {
    title: "ComerxIA — Vendé tu auto o moto, en todo el país",
    description: "Sacá una foto y publicá tu vehículo en 30 segundos. Gratis.",
    type: "website",
    locale: "es_AR",
    siteName: "ComerxIA",
  },
  twitter: {
    card: "summary_large_image",
    title: "ComerxIA — Vendé tu auto o moto en 30 segundos",
    description: "Sacá una foto y publicá tu vehículo. Gratis, para particulares y concesionarias.",
  },
};

export default function LandingPage() {
  return <ComerxIALanding />;
}
