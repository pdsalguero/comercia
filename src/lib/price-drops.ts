import type { SupabaseClient } from "@supabase/supabase-js";

// Una baja de precio se marca en las tarjetas solo si es reciente: pasado este plazo deja de ser noticia.
export const PRICE_DROP_WINDOW_DAYS = 30;

// Devuelve { listingId: porcentaje } para los avisos cuyo ÚLTIMO cambio de precio fue una baja dentro
// del plazo (si después volvió a subir, no se marca). Una sola consulta para toda la lista.
// Si la tabla de historial no existe o falla, devuelve {}: las tarjetas se muestran sin el ícono.
export async function getRecentPriceDrops(supabase: SupabaseClient, listingIds: string[]): Promise<Record<string, number>> {
  if (listingIds.length === 0) return {};
  const since = new Date(Date.now() - PRICE_DROP_WINDOW_DAYS * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("listing_price_history")
    .select("listing_id, old_price, new_price, old_currency, new_currency, changed_at")
    .in("listing_id", listingIds)
    .gte("changed_at", since)
    .order("changed_at", { ascending: false });
  if (error || !data) return {};

  const drops: Record<string, number> = {};
  const seen = new Set<string>();
  for (const ch of data) {
    if (seen.has(ch.listing_id)) continue; // ya se vio el cambio más reciente de este aviso
    seen.add(ch.listing_id);
    const oldP = Number(ch.old_price);
    const newP = Number(ch.new_price);
    if (ch.old_currency !== ch.new_currency || !(oldP > 0) || !(newP > 0) || newP >= oldP) continue;
    drops[ch.listing_id] = Math.max(1, Math.round(((oldP - newP) / oldP) * 100));
  }
  return drops;
}
