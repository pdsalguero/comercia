import { createPublicClient } from "@/lib/supabase/public";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get("province");

    const supabase = createPublicClient();

    let query = supabase
      .from("listings")
      .select(
        "id,title,price,currency,condition,neighborhood,created_at,bumped_at,view_count,user_id,listing_images(url,position),categories(name,slug)"
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8);

    if (province) {
      // neighborhood se guarda como "Localidad, Provincia" o solo "Provincia"
      query = query.ilike("neighborhood", `%${province}`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[home-recent]", error);
      return NextResponse.json([], { status: 500 });
    }

    // Fetch store info for user_ids
    const userIds = [
      ...new Set((data ?? []).map((l: any) => l.user_id).filter(Boolean)),
    ] as string[];
    let storeMap: Record<string, { is_store: boolean; store_name: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, is_store, store_name")
        .in("id", userIds);
      for (const p of profiles ?? []) storeMap[p.id] = p;
    }

    const result = (data ?? []).map((l: any) => ({
      ...l,
      listing_images: [...(l.listing_images ?? [])].sort(
        (a: any, b: any) => a.position - b.position
      ),
      is_store: storeMap[l.user_id]?.is_store ?? null,
      store_name: storeMap[l.user_id]?.store_name ?? null,
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error("[home-recent] unhandled:", e);
    return NextResponse.json([], { status: 500 });
  }
}
