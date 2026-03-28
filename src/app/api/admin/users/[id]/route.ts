import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  return profile?.is_admin ? user : null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const { action, reason } = await req.json();
  const service = createServiceClient();

  if (action === "block") {
    const { error } = await service
      .from("profiles")
      .update({ is_blocked: true, blocked_at: new Date().toISOString(), blocked_reason: reason ?? null })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // Also pause all their active listings
    await service.from("listings").update({ status: "paused" }).eq("user_id", id).eq("status", "active");
    return NextResponse.json({ ok: true });
  }

  if (action === "unblock") {
    const { error } = await service
      .from("profiles")
      .update({ is_blocked: false, blocked_at: null, blocked_reason: null })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "verify") {
    const { error } = await service
      .from("profiles")
      .update({ is_verified: true, identity_verified_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
