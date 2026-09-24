// Normaliza los atributos de un aviso de vehículo antes de guardarlo (publicar y editar). Solo servidor:
// usa el catálogo de modelos, que es pesado.
import { getModelosPorMarca } from "@/data/modelos-vehiculos";
import type { TipoCatalogo } from "@/data/catalogo/marcas.generated";
import { normalizeSpecValue } from "@/lib/labels";
import { canonicalModel } from "@/lib/model-normalize";

const CATALOG_TYPES = new Set<string>(["auto", "camioneta", "moto", "cuatriciclo", "utv", "camion"]);

/**
 * Separa lo que no debe quedar en `listings.attributes` (legible por cualquiera con la clave anónima):
 * la patente va a `listing_private` salvo que el vendedor tildó "Mostrar patente", y `_patente_info`
 * (copia interna que arma la IA) no se guarda nunca.
 */
export function splitPrivateAttributes(attrs: Record<string, unknown>): {
  publicAttrs: Record<string, unknown>;
  patente: string | null;
} {
  const rest: Record<string, unknown> = { ...attrs };
  const rawPatente = rest.patente;
  delete rest.patente;
  delete rest._patente_info;
  const patente = typeof rawPatente === "string" && rawPatente.trim() ? rawPatente.trim().toUpperCase() : null;
  const show = rest.show_patente === true || rest.show_patente === "true";
  return { publicAttrs: show && patente ? { ...rest, patente } : rest, patente };
}

/** Guarda (o borra) la patente privada de un aviso. Solo servidor; el aviso ya se verificó del usuario. */
export async function savePrivatePatente(listingId: string, patente: string | null): Promise<void> {
  const { createServiceClient } = await import("@/lib/supabase/service");
  const service = createServiceClient();
  if (patente) {
    await service.from("listing_private").upsert({ listing_id: listingId, patente, updated_at: new Date().toISOString() });
  } else {
    await service.from("listing_private").delete().eq("listing_id", listingId);
  }
}

/** Patente privada de un aviso (solo servidor, para el formulario de edición del dueño). */
export async function getPrivatePatente(listingId: string): Promise<string | null> {
  const { createServiceClient } = await import("@/lib/supabase/service");
  const { data } = await createServiceClient().from("listing_private").select("patente").eq("listing_id", listingId).maybeSingle();
  return (data?.patente as string | null) ?? null;
}

export function normalizeVehicleAttributes<T extends Record<string, unknown> | null | undefined>(attrs: T): T {
  if (!attrs || typeof attrs !== "object") return attrs;
  const out: Record<string, unknown> = { ...attrs };
  if (out.fuel != null) out.fuel = normalizeSpecValue("fuel", out.fuel);
  if (out.transmission != null) out.transmission = normalizeSpecValue("transmission", out.transmission);
  if (out.model != null) {
    const tipo = String(out.sub_category ?? "");
    const brand = String(out.brand ?? "");
    const options = CATALOG_TYPES.has(tipo) && brand ? getModelosPorMarca(brand, tipo as TipoCatalogo) : [];
    out.model = canonicalModel(out.model, options);
  }
  return out as T;
}
