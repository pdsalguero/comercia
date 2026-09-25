import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";
import { destacadoActivadoTemplate } from "@/lib/emailTemplates";
import { publicAppUrl } from "@/lib/site-url";
import MercadoPagoConfig, { Payment } from "mercadopago";

/**
 * Consulta el pago a Mercado Pago y confirma que está aprobado, que corresponde a esta referencia
 * (aviso + plan + usuario) y que el monto cubre el precio del plan. Nunca activar un destacado con
 * datos que llegan en la URL o en el webhook sin pasar por acá.
 */
export async function verifyApprovedPayment(paymentId: string, expectedRef?: string) {
  const payment = await new Payment(new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! }))
    .get({ id: paymentId });
  const ref = payment.external_reference ?? "";
  const [listingId, planKey, userId] = ref.split("__");
  const { PLAN_META } = await import("@/app/api/mp/checkout/route");
  const plan = PLAN_META[planKey ?? ""];
  const ok =
    payment.status === "approved" &&
    !!listingId && !!userId && !!plan &&
    (!expectedRef || ref === expectedRef) &&
    payment.currency_id === "ARS" &&
    Number(payment.transaction_amount) >= plan.price;
  return { ok, status: payment.status, listingId, planKey, userId };
}

/**
 * MercadoPago redirects here after checkout (browser redirect).
 * Query params: status, external_reference, payment_id, collection_status
 *
 * Los parámetros de la URL NO se creen: cualquiera puede armar
 * ?status=approved&external_reference=… a mano. El pago se verifica contra la API de Mercado Pago.
 */
export async function GET(req: NextRequest) {
  const BASE = publicAppUrl();
  const { searchParams } = new URL(req.url);
  const externalRef = searchParams.get("external_reference");
  const paymentId   = searchParams.get("payment_id") ?? searchParams.get("collection_id");
  const refListingId = externalRef?.split("__")[0];
  const errorUrl = refListingId ? `${BASE}/upgrade?listing_id=${refListingId}&error=1` : `${BASE}/upgrade?error=1`;

  if (!externalRef || !paymentId || paymentId === "null") return NextResponse.redirect(errorUrl);

  try {
    const v = await verifyApprovedPayment(paymentId, externalRef);
    if (!v.ok) {
      // Pendiente (ej. pago en efectivo): el webhook lo activa cuando se acredite
      if (v.status === "pending" || v.status === "in_process") {
        return NextResponse.redirect(`${BASE}/upgrade?listing_id=${v.listingId}&pending=1`);
      }
      return NextResponse.redirect(errorUrl);
    }
    await applyDestacado({ listingId: v.listingId, planKey: v.planKey, userId: v.userId, paymentId });
    return NextResponse.redirect(`${BASE}/listings/${v.listingId}?destacado=1`);
  } catch (err) {
    console.error("[mp/callback] no se pudo verificar el pago:", err);
    return NextResponse.redirect(errorUrl);
  }
}

/**
 * Shared helper: marks listing as destacado and updates pagos record.
 */
export async function applyDestacado({
  listingId,
  planKey,
  userId,
  paymentId,
}: {
  listingId: string;
  planKey: string;
  userId: string;
  paymentId: string | null;
}) {
  const { PLAN_META } = await import("@/app/api/mp/checkout/route");
  const plan = PLAN_META[planKey];
  if (!plan) return;

  const service = createServiceClient();

  // Un mismo pago se aplica una sola vez: el retorno del navegador y el webhook llegan los dos, y
  // reabrir el link de retorno de un pago viejo reiniciaba el destacado (días gratis).
  if (paymentId) {
    const { data: already } = await service.from("pagos").select("id")
      .eq("mp_payment_id", paymentId).eq("mp_status", "approved").limit(1);
    if (already?.length) return;
  }

  const hasta = new Date();
  hasta.setDate(hasta.getDate() + plan.days);

  // Update listing
  await service.from("listings").update({
    featured_level:   plan.featured_level,
    destacado_activo: true,
    destacado_hasta:  hasta.toISOString(),
    destacado_tipo:   plan.featured_level,
    is_featured:      true,
    featured_until:   hasta.toISOString(),
  }).eq("id", listingId).eq("user_id", userId);

  // Update pago record
  await service.from("pagos").update({
    mp_payment_id: paymentId,
    mp_status:     "approved",
    updated_at:    new Date().toISOString(),
  }).eq("listing_id", listingId).eq("user_id", userId).eq("mp_status", "pending");

  // Enviar email de confirmación (fire-and-forget)
  const [{ data: listing }, { data: authUser }] = await Promise.all([
    service.from("listings").select("title").eq("id", listingId).single(),
    service.auth.admin.getUserById(userId),
  ]);

  const userEmail = authUser?.user?.email;
  if (userEmail && listing?.title) {
    const { data: profile } = await service.from("profiles").select("full_name").eq("id", userId).single();
    const userName = profile?.full_name?.split(" ")[0] ?? userEmail.split("@")[0];
    const BASE = publicAppUrl();
    const { subject, html } = destacadoActivadoTemplate({
      userName,
      listingTitle: listing.title,
      listingUrl: `${BASE}/listings/${listingId}`,
      planLevel: plan.featured_level,
      planDays: plan.days,
      expiresAt: hasta,
    });
    sendEmail({ to: userEmail, subject, html }).catch(console.error);
  }

  // Postear en Facebook Page (fire-and-forget)
  const FB_TOKEN  = process.env.FACEBOOK_PAGE_TOKEN;
  const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
  if (FB_TOKEN && FB_PAGE_ID && listing?.title) {
    const FBASE = publicAppUrl();
    const listingUrl = `${FBASE}/listings/${listingId}`;
    const planLabel  = plan.featured_level === "premium" ? "⭐ PREMIUM" : "🔝 DESTACADO";
    const { data: listingData } = await service.from("listings").select("price, slug").eq("id", listingId).single();
    const priceText = listingData?.price
      ? `💰 $${Number(listingData.price).toLocaleString("es-AR")}`
      : "";
    const message = [
      `${planLabel} | ${listing.title}`,
      priceText,
      listingUrl,
    ].filter(Boolean).join("\n");
    fetch(`https://graph.facebook.com/v20.0/${FB_PAGE_ID}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, access_token: FB_TOKEN }),
    }).catch((e) => console.error("[facebook]", e));
  }

  // Invalidar caché del home para que el aviso destacado aparezca de inmediato
  revalidatePath('/', 'layout');
}
