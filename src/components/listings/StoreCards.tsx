import { createClient } from "@/lib/supabase/server";
import { StoreCarousel } from "./StoreCarousel";

const CAT_ID_LABEL: Record<number, string> = {
  1: "electronics", 2: "vehicles", 3: "real-estate", 4: "clothing",
  5: "home-garden", 6: "sports", 7: "tools", 8: "books", 9: "pets",
  10: "other", 21: "phones", 22: "appliances", 23: "babies",
  24: "beauty-health", 25: "toys", 26: "services",
};

export async function StoreCards() {
  const supabase = await createClient();

  const { data: stores } = await supabase
    .from("profiles")
    .select("id, store_name, store_slug, store_logo_url, store_banner_url, store_verified, store_description")
    .eq("is_store", true)
    .not("store_slug", "is", null)
    .order("store_name", { ascending: true })
    .limit(20);

  if (!stores?.length) return null;

  const storeIds = stores.map((s) => s.id);

  const { data: listings } = await supabase
    .from("listings")
    .select("user_id, category_id")
    .eq("status", "active")
    .in("user_id", storeIds);

  // Build enriched store data
  const storeData = stores
    .filter((s) => s.store_name && s.store_slug)
    .map((store) => {
      const sl = listings?.filter((l) => l.user_id === store.id) ?? [];
      // Count categories
      const catCount: Record<string, number> = {};
      for (const l of sl) {
        const label = l.category_id ? (CAT_ID_LABEL[l.category_id] ?? "other") : "other";
        catCount[label] = (catCount[label] ?? 0) + 1;
      }
      const mainCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      return {
        id: store.id,
        store_name: store.store_name,
        store_slug: store.store_slug,
        store_logo_url: store.store_logo_url,
        store_banner_url: store.store_banner_url,
        store_verified: store.store_verified,
        store_description: store.store_description,
        listing_count: sl.length,
        main_cat_label: mainCat,
      };
    });

  if (!storeData.length) return null;

  return <StoreCarousel stores={storeData} />;
}
