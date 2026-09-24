import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { ENABLED_CATEGORY_IDS } from "@/lib/site-config";
import { buildVehicleFacets } from "@/lib/hero-facets";
import { POPULAR_BRANDS } from "@/lib/popular-brands";

// Marcas para el menú del Navbar: primero las que tienen avisos (con su contador) y, si sobra lugar,
// las más buscadas en Argentina (sin contador).
const POPULAR = POPULAR_BRANDS;
const MAX_BRANDS = 12;

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get("tipo") ?? "";
  if (!(tipo in POPULAR)) return NextResponse.json([]);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("listings")
    .select("attributes")
    .eq("status", "active")
    .in("category_id", ENABLED_CATEGORY_IDS)
    .eq("attributes->>sub_category", tipo)
    .limit(1000);

  const catalog = buildVehicleFacets(data ?? []).brandsByType[tipo] ?? [];
  const byValue = new Map(catalog.map((b) => [b.value, b]));

  const withStock = catalog.filter((b) => b.count > 0);
  const popular = POPULAR[tipo]
    .map((value) => byValue.get(value))
    .filter((b): b is NonNullable<typeof b> => !!b && b.count === 0);

  return NextResponse.json([...withStock, ...popular].slice(0, MAX_BRANDS), {
    headers: { "Cache-Control": "public, max-age=120, s-maxage=300, stale-while-revalidate=600" },
  });
}
