import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { listing_id } = await req.json();
  if (!listing_id) return NextResponse.json({ ok: false }, { status: 400 });

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

  await supabase
    .from("listings")
    .update({ view_count: (listing.view_count ?? 0) + 1 })
    .eq("id", listing_id);

  return NextResponse.json({ ok: true });
}
