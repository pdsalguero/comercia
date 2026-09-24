import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";

// La página es de cliente: la metadata va acá. Indexable: es la entrada de "vender mi auto".
export const metadata: Metadata = {
  title: "Publicá tu vehículo gratis",
  description: "Vendé tu auto, camioneta o moto en Mendoza, San Juan y San Luis. Sacá una foto y el aviso se completa solo. Publicar es gratis.",
  alternates: { canonical: absoluteUrl("/listings/new") },
};

export default function NewListingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
