import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";
import { resetPasswordTemplate } from "@/lib/emailTemplates";

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
  const { action, reason, amount } = await req.json();
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

  if (action === "add_credits") {
    const qty = Number(amount) || 1;
    const { data: profile } = await service.from("profiles").select("free_destacado_credits").eq("id", id).single();
    const current = (profile as any)?.free_destacado_credits ?? 0;
    const { error: updateError } = await service.from("profiles")
      .update({ free_destacado_credits: current + qty })
      .eq("id", id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "reset_password") {
    const { data: authUser } = await service.auth.admin.getUserById(id);
    const email = authUser?.user?.email;
    if (!email) return NextResponse.json({ error: "Usuario sin email" }, { status: 400 });

    const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://comerxia.com.ar").replace(/\/$/, "");

    // generateLink genera un token de recovery. El link redirige a /reset-password
    // con hash params (#access_token=...&type=recovery) que supabase-js lee automáticamente.
    const { data: linkData, error } = await service.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${BASE}/reset-password` },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const resetUrl = linkData?.properties?.action_link;
    if (!resetUrl) return NextResponse.json({ error: "No se pudo generar el link" }, { status: 500 });

    const { data: profile } = await service.from("profiles").select("full_name").eq("id", id).single();
    const userName = profile?.full_name?.split(" ")[0] ?? email.split("@")[0];

    const { subject, html } = resetPasswordTemplate({ userName, resetUrl });
    await sendEmail({ to: email, subject, html });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
