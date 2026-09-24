import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin as assertAdmin } from "@/lib/supabase/admin-auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const { action, reason } = await req.json();
  const service = createServiceClient();

  if (action === "remove") {
    const { error } = await service
      .from("listings")
      .update({ status: "removed", removed_by_admin: true, removed_reason: reason ?? null })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "restore") {
    const { error } = await service
      .from("listings")
      .update({ status: "active", removed_by_admin: false, removed_reason: null })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "feature") {
    const until = new Date();
    until.setDate(until.getDate() + 30);
    const { error } = await service
      .from("listings")
      .update({ featured_level: "gold", is_featured: true, featured_until: until.toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  }

  if (action === "unfeature") {
    const { error } = await service
      .from("listings")
      .update({ featured_level: null, is_featured: false, featured_until: null })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
