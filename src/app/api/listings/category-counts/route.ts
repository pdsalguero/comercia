import { createPublicClient } from "@/lib/supabase/public";
import { NextResponse } from "next/server";

// IDs de todas las categorías del marketplace
const CATEGORY_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 21, 22, 23, 24, 25, 26];

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
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .eq("category_id", id);
        if (province) q = q.ilike("neighborhood", `%${province}`);
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
