import type { Metadata } from "next";

// La página es de cliente: el título va acá.
export const metadata: Metadata = { title: "Mi tienda", description: "Configurá la página de tu concesionaria en CuyoRodados." };

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
