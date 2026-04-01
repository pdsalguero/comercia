import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";
import { destacadoPorVencerTemplate } from "@/lib/emailTemplates";

/**
 * GET /api/cron/expire-destacados
 *
 * Debe ejecutarse 1 vez al día (ej: Vercel Cron a las 08:00 AR).
 * Hace dos cosas:
 *   1. Envía alerta a listados cuyo destacado vence en exactamente 3 días.
 *   2. Apaga el destacado de listados ya vencidos.
 *
 * Protegido por CRON_SECRET para que solo lo llame el scheduler.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const now = new Date();

  // ── 1. Alertas: destacados que vencen entre 72 h y 73 h desde ahora ─────────
  const alertFrom = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();
  const alertTo   = new Date(now.getTime() + 73 * 60 * 60 * 1000).toISOString();

  const { data: toAlert } = await service
    .from("listings")
    .select("id, title, user_id, destacado_hasta")
    .eq("destacado_activo", true)
    .gte("destacado_hasta", alertFrom)
    .lt("destacado_hasta", alertTo);

  let alertsSent = 0;

  for (const listing of toAlert ?? []) {
    const [{ data: profile }, { data: authUser }] = await Promise.all([
      service.from("profiles").select("full_name").eq("id", listing.user_id).single(),
      service.auth.admin.getUserById(listing.user_id),
    ]);

    const userEmail = authUser?.user?.email;
    if (!userEmail) continue;

    const userName = profile?.full_name?.split(" ")[0] ?? userEmail.split("@")[0];
    const { subject, html } = destacadoPorVencerTemplate({
      userName,
      listingTitle: listing.title,
      listingUrl:   `${BASE}/listings/${listing.id}`,
      upgradeUrl:   `${BASE}/upgrade?listing_id=${listing.id}`,
      expiresAt:    new Date(listing.destacado_hasta),
    });

    await sendEmail({ to: userEmail, subject, html }).catch(console.error);
    alertsSent++;
  }

  // ── 2. Expirar destacados vencidos ───────────────────────────────────────────
  const { data: expired, error: expireError } = await service
    .from("listings")
    .update({
      destacado_activo: false,
      is_featured:      false,
      featured_level:   null,
      featured_until:   null,
    })
    .eq("destacado_activo", true)
    .lt("destacado_hasta", now.toISOString())
    .select("id");

  if (expireError) {
    console.error("[cron/expire-destacados] Error expirando:", expireError);
  }

  return NextResponse.json({
    ok: true,
    alerts_sent: alertsSent,
    expired_count: expired?.length ?? 0,
  });
}
