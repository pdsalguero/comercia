import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_REASONS = ["scam", "fake", "prohibited", "duplicate", "inappropriate", "other"] as const;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Debés iniciar sesión para denunciar un aviso." }, { status: 401 });

  const { listing_id, reason, description } = await req.json();

  if (!listing_id || typeof listing_id !== "string") {
    return NextResponse.json({ error: "listing_id inválido" }, { status: 400 });
  }
  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "Motivo inválido" }, { status: 400 });
  }

  // Evitar denuncias duplicadas del mismo usuario al mismo aviso
  const { data: existing } = await supabase
    .from("listing_reports")
    .select("id")
    .eq("listing_id", listing_id)
    .eq("reporter_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Ya denunciaste este aviso anteriormente." }, { status: 409 });
  }

  const { error } = await supabase.from("listing_reports").insert({
    listing_id,
    reporter_id: user.id,
    reason,
    description: description?.trim() || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
