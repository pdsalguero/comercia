// src/app/api/listings/price-suggestion/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = Number(searchParams.get("category_id") ?? 0);

  if (!categoryId) {
    return NextResponse.json(
      { error: "category_id requerido" },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();

    const { data: listings } = await supabase
      .from("listings")
      .select("price")
      .eq("category_id", categoryId)
      .eq("status", "active")
      .not("price", "is", null)
      .gt("price", 0)
      .gte("created_at", new Date(Date.now() - 90 * 86400000).toISOString()); // últimos 90 días

    if (!listings || listings.length < 3) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    const prices = listings.map((l) => l.price).sort((a, b) => a - b);
    // Descartar 10% inferior y superior (outliers)
    const trimmed = prices.slice(
      Math.floor(prices.length * 0.1),
      Math.ceil(prices.length * 0.9),
    );

    const min = Math.min(...trimmed);
    const max = Math.max(...trimmed);
    const avg = Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);
    const suggested = trimmed[Math.floor(trimmed.length / 2)]; // mediana

    return NextResponse.json({
      count: trimmed.length,
      min,
      max,
      avg,
      suggested,
      source: "comerxia",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
