import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NotFoundContent } from "@/components/layout/NotFoundContent";

export const metadata: Metadata = { title: "Página no encontrada" };

// 404 de rutas que no existen: solo tiene el layout raíz, así que suma la barra y el pie del sitio.
// La sesión se lee en el navegador, igual que en el home.
export default function NotFound() {
  return (
    <>
      <Navbar user={null} loadUserOnClient />
      <NotFoundContent />
      <Footer />
    </>
  );
}
