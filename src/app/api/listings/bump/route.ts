import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 días

export async function POST(req: NextRequest) {
  const { listing_id } = await req.json();
  if (!listing_id) return NextResponse.json({ ok: false, error: "listing_id requerido" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });

  const { data: listing } = await supabase
    .from("listings")
    .select("user_id, bumped_at, status")
    .eq("id", listing_id)
    .single();

  if (!listing) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
  if (listing.user_id !== user.id) return NextResponse.json({ ok: false, error: "Sin permiso" }, { status: 403 });
  if (listing.status !== "active") return NextResponse.json({ ok: false, error: "Solo avisos activos" }, { status: 400 });

  if (listing.bumped_at) {
    const elapsed = Date.now() - new Date(listing.bumped_at).getTime();
    if (elapsed < COOLDOWN_MS) {
      const remainingMs = COOLDOWN_MS - elapsed;
      return NextResponse.json({ ok: false, error: "cooldown", remaining_ms: remainingMs }, { status: 429 });
    }
  }

  const { error } = await supabase
    .from("listings")
    .update({ bumped_at: new Date().toISOString() })
    .eq("id", listing_id);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
