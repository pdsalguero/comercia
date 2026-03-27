import { NextRequest, NextResponse } from "next/server";
import { getModelosPorMarca } from "@/data/modelos-vehiculos";
import { getModelosMotoByTipo } from "@/data/modelos-motos";
import { createClient } from "@/lib/supabase/server";

/** Deduplicate models that are identical when spaces/hyphens are removed */
function dedup(models: string[]): string[] {
  const seen = new Map<string, string>();
  for (const m of models) {
    const key = m.toUpperCase().replace(/[\s\-]/g, "");
    if (!seen.has(key)) seen.set(key, m);
  }
  return Array.from(seen.values());
}

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get("brand");
  const tipo  = req.nextUrl.searchParams.get("tipo");

  if (!brand || !tipo) return NextResponse.json([]);

  if (tipo === "moto" || tipo === "cuatriciclo" || tipo === "utv") {
    const staticModels = getModelosMotoByTipo(brand, tipo as "moto" | "cuatriciclo" | "utv");

    // Merge user-contributed models from DB
    let dbModels: string[] = [];
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("vehicle_models")
        .select("model")
        .eq("tipo", tipo)
        .eq("brand", brand)
        .order("listing_count", { ascending: false });
      if (data) dbModels = data.map((r) => r.model);
    } catch {
      // non-critical, fall through to static only
    }

    return NextResponse.json(dedup([...staticModels, ...dbModels]));
  }

  if (tipo === "auto" || tipo === "camioneta" || tipo === "camion") {
    return NextResponse.json(dedup(getModelosPorMarca(brand, tipo)));
  }

  return NextResponse.json([]);
}
