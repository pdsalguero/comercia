import { createPublicClient } from "@/lib/supabase/public";
import { NextResponse } from "next/server";
import { ENABLED_CATEGORY_IDS } from "@/lib/site-config";

// Solo las categorías habilitadas en la etapa actual; el resto cuenta 0 en el cliente
const CATEGORY_IDS = ENABLED_CATEGORY_IDS;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get("province");

    const supabase = createPublicClient();

    // 16 queries HEAD paralelas — devuelven solo el count en headers, cero egress de datos
    const results = await Promise.all(
      CATEGORY_IDS.map(async (id) => {
        let q = supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("status", "active")
          .eq("category_id", id);
        if (province) q = (q as any).or(`city.ilike.%${province}%,neighborhood.ilike.%${province}%`);
        const { count } = await q;
        return [id, count ?? 0] as [number, number];
      })
    );

    const counts = Object.fromEntries(results);
    return NextResponse.json(counts);
  } catch (e) {
    console.error("[category-counts]", e);
    return NextResponse.json({}, { status: 500 });
  }
}
