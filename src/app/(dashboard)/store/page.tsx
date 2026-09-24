import { redirect } from "next/navigation";

// Ruta vieja: la tienda se configura en /dashboard/store (esta página era una copia de esa).
export default function LegacyStoreRedirect() {
  redirect("/dashboard/store");
}
