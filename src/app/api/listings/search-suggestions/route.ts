import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("id, title, price, currency")
    .eq("status", "active")
    .ilike("title", `%${q}%`)
    .order("created_at", { ascending: false })
    .limit(6);

  return NextResponse.json(data ?? []);
}
