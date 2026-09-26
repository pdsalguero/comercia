import { RE_LOCATIONS } from "@/lib/re-locations";
import { splitListingLocation } from "@/lib/ar-locations";

// Ubicación de un aviso para mostrar. Los avisos guardaron la ubicación de distintas formas según la
// versión del sitio (provincia en `city`, "Albardón, San Juan" en `neighborhood`, o solo un código de
// zona en attributes.zone); splitListingLocation las unifica en provincia + localidad.
//   - Tarjetas, listados y carruseles muestran solo la provincia (listingProvince).
//   - La ficha muestra "Localidad, Provincia" si hay localidad (listingLocationFull).

type LocationSource = {
  city?: string | null;
  neighborhood?: string | null;
  attributes?: Record<string, unknown> | null;
};

function zoneLabelOf(zone: unknown): { province: string; locality: string } | null {
  if (typeof zone !== "string" || !zone) return null;
  for (const p of Object.values(RE_LOCATIONS)) {
    const z = p.zones.find((x) => x.value === zone);
    if (z) return { province: p.label, locality: z.label };
  }
  return null;
}

export function listingLocationParts(l: LocationSource): { province: string; locality: string } {
  return splitListingLocation(l.city, l.neighborhood, zoneLabelOf(l.attributes?.zone));
}

/** "San Juan" — o "" si el aviso no tiene provincia reconocible. */
export function listingProvince(l: LocationSource): string {
  return listingLocationParts(l).province;
}

/** "Albardón, San Juan", "San Juan" o "" — para la ficha del aviso. */
export function listingLocationFull(l: LocationSource): string {
  const { province, locality } = listingLocationParts(l);
  if (locality && province && locality.toLowerCase() !== province.toLowerCase()) return `${locality}, ${province}`;
  return province || locality;
}
