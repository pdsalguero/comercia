import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const adminClient = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const recentViews = new Map<string, number>();
const THROTTLE_MS = 60 * 60 * 1000;

function isThrottled(ip: string, listingId: string): boolean {
  const key = `${ip}:${listingId}`;
  const last = recentViews.get(key);
  if (last && Date.now() - last < THROTTLE_MS) return true;
  recentViews.set(key, Date.now());
  if (recentViews.size > 100) {
    const cutoff = Date.now() - THROTTLE_MS;
    for (const [k, t] of recentViews) {
      if (t < cutoff) recentViews.delete(k);
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  const { listing_id } = await req.json();
  if (!listing_id) return NextResponse.json({ ok: false }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isThrottled(ip, listing_id)) return NextResponse.json({ ok: true });

  const supabase = await createClient();

  // Don't count views from the owner
  const { data: { user } } = await supabase.auth.getUser();
  const { data: listing } = await supabase
    .from("listings")
    .select("user_id, view_count")
    .eq("id", listing_id)
    .single();

  if (!listing) return NextResponse.json({ ok: false }, { status: 404 });
  if (user && user.id === listing.user_id) return NextResponse.json({ ok: true });

  await Promise.all([
    adminClient.from("listings").update({ view_count: (listing.view_count ?? 0) + 1 }).eq("id", listing_id),
    adminClient.from("listing_views_log").insert({ listing_id }),
  ]);

  return NextResponse.json({ ok: true });
}
