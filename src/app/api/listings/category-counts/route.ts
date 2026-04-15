import { createPublicClient } from "@/lib/supabase/public";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get("province");

    const supabase = createPublicClient();

    let query = supabase
      .from("listings")
      .select("category_id")
      .eq("status", "active");

    if (province) {
      query = query.ilike("neighborhood", `%${province}`);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({}, { status: 500 });

    const counts: Record<number, number> = {};
    for (const row of data ?? []) {
      counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
    }

    return NextResponse.json(counts);
  } catch (e) {
    console.error("[category-counts]", e);
    return NextResponse.json({}, { status: 500 });
  }
}
