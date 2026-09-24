import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ENABLED_CATEGORY_IDS } from "@/lib/site-config";
import { buildKeywordFilters } from "@/lib/search-query";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const supabase = await createClient();
  // Misma búsqueda que los listados (marca/modelo, sin acentos, "%" literal): ver src/lib/search-query.ts
  let query = supabase
    .from("listings")
    .select("id, title, price, currency")
    .eq("status", "active")
    .in("category_id", ENABLED_CATEGORY_IDS);
  for (const f of buildKeywordFilters(q)) query = query.or(f);
  const { data } = await query
    .order("created_at", { ascending: false })
    .limit(6);

  return NextResponse.json(data ?? []);
}
