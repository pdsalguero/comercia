import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const BASE = process.env.NEXT_PUBLIC_APP_URL!;

/**
 * MercadoPago redirects here after checkout (browser redirect).
 * Query params: status, external_reference, payment_id, collection_status
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status      = searchParams.get("status") ?? searchParams.get("collection_status");
  const externalRef = searchParams.get("external_reference");
  const paymentId   = searchParams.get("payment_id") ?? searchParams.get("collection_id");

  if (status !== "approved" || !externalRef) {
    const listingId = externalRef?.split("|")[0];
    return NextResponse.redirect(
      listingId ? `${BASE}/upgrade?listing_id=${listingId}&error=1` : `${BASE}/upgrade?error=1`
    );
  }

  const [listingId, planKey, userId] = externalRef.split("__");
  if (!listingId || !planKey || !userId) {
    return NextResponse.redirect(`${BASE}/upgrade?error=1`);
  }

  await applyDestacado({ listingId, planKey, userId, paymentId: paymentId ?? null });

  return NextResponse.redirect(`${BASE}/listings/${listingId}?destacado=1`);
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

  const hasta = new Date();
  hasta.setDate(hasta.getDate() + plan.days);

  const service = createServiceClient();

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
}
