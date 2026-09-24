import { createPublicClient } from "@/lib/supabase/public";
import { NextResponse } from "next/server";
import { ENABLED_CATEGORY_IDS } from "@/lib/site-config";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { getRecentPriceDrops } from "@/lib/price-drops";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get("province");

    const supabase = createPublicClient();

    let query = supabase
      .from("listings")
      .select(
        "id,title,description,price,currency,condition,neighborhood,created_at,bumped_at,view_count,user_id,featured_level,attributes,listing_images(url,position),categories(name,slug)"
      )
      .eq("status", "active")
      .in("category_id", ENABLED_CATEGORY_IDS)
      .order("created_at", { ascending: false })
      .limit(8);

    if (province) {
      query = (query as any).or(`city.ilike.%${province}%,neighborhood.ilike.%${province}%`);
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
    let storeMap: Record<string, { is_store: boolean; store_name: string | null; store_whatsapp: string | null; phone: string | null; show_phone: boolean | null }> = {};
    const [{ data: profiles }, priceDrops] = await Promise.all([
      userIds.length > 0
        ? supabase.from("profiles").select("id, is_store, store_name, store_whatsapp, phone, show_phone").in("id", userIds)
        : Promise.resolve({ data: [] as any[] }),
      getRecentPriceDrops(supabase, (data ?? []).map((l: any) => l.id)),
    ]);
    for (const p of profiles ?? []) storeMap[p.id] = p as any;

    const result = (data ?? []).map((l: any) => {
      const seller = storeMap[l.user_id];
      return {
        ...l,
        listing_images: [...(l.listing_images ?? [])].sort(
          (a: any, b: any) => a.position - b.position
        ),
        is_store: seller?.is_store ?? null,
        store_name: seller?.store_name ?? null,
        price_drop_pct: priceDrops[l.id] ?? null,
        whatsapp_url: buildWhatsappUrl({
          showPhone: seller?.show_phone,
          storeWhatsapp: seller?.store_whatsapp,
          phone: seller?.phone,
          listingWhatsappOverride: l.attributes?.whatsapp_phone,
          listingTitle: l.title,
        }),
      };
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("[home-recent] unhandled:", e);
    return NextResponse.json([], { status: 500 });
  }
}
