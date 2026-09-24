import { redirect } from "next/navigation";

// Ruta vieja: los favoritos viven en /dashboard/favorites (esta página era una copia con los mismos bugs).
export default function FavoritesLegacyPage() {
  redirect("/dashboard/favorites");
}
