import { isCategoryEnabled } from "@/lib/site-config";
import { priceForSort } from "@/lib/listing-filters";

/** "$ 9.500.000", "U$S 47.000" o "A consultar" si el aviso no tiene precio (null o 0). */
export function formatListingPrice(price: number | string | null | undefined, currency?: string | null): string {
  const n = priceForSort(price);
  if (n == null) return "A consultar";
  return `${currency === "USD" ? "U$S" : "$"} ${n.toLocaleString("es-AR")}`;
}

/** Nombre del vendedor para saludar: sin espacios de más y solo el primer nombre ("Diego Morales " → "Diego"). */
export function greetingName(sellerName: string | null | undefined): string {
  const clean = (sellerName ?? "").trim().replace(/\s+/g, " ");
  if (!clean) return "";
  return clean.startsWith("@") ? clean : clean.split(" ")[0];
}

/** Mensaje que viene ya escrito (y editable) al contactar a un vendedor. */
export function defaultContactMessage(sellerName: string | null | undefined, listingTitle: string): string {
  const name = greetingName(sellerName);
  return `Hola${name ? ` ${name}` : ""}, estoy interesado en tu publicación "${listingTitle.trim()}". ¿Sigue disponible?`;
}

/**
 * Si un aviso guardado en favoritos se puede seguir viendo. No disponible: eliminado (la relación
 * viene vacía), no activo (vendido, vencido, borrado) o de una categoría que el sitio ya no muestra
 * (ej. una casa guardada cuando el sitio tenía inmuebles). Los pausados se muestran aparte.
 */
export function favoriteStatus(
  listing: { status?: string | null; category_id?: number | null } | null | undefined,
): "available" | "paused" | "unavailable" {
  if (!listing) return "unavailable";
  if (listing.category_id != null && !isCategoryEnabled(listing.category_id)) return "unavailable";
  if (listing.status === "active") return "available";
  if (listing.status === "paused") return "paused";
  return "unavailable";
}
