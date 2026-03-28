import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createServiceClient } from "@/lib/supabase/service";
import { applyDestacado } from "@/app/api/mp/callback/route";

/**
 * MercadoPago IPN webhook.
 * Fires when a payment status changes — reliable backup for browser-redirect failures.
 * Always returns 200 so MP doesn't retry indefinitely.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // MP sends { type: "payment", data: { id: "..." } }
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ ok: true });
    }

    const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
    const paymentClient = new Payment(mpClient);
    const payment = await paymentClient.get({ id: String(body.data.id) });

    const externalRef = payment.external_reference;
    if (!externalRef) return NextResponse.json({ ok: true });

    const [listingId, planKey, userId] = externalRef.split("__");
    if (!listingId || !planKey || !userId) return NextResponse.json({ ok: true });

    const service = createServiceClient();

    if (payment.status === "approved") {
      await applyDestacado({
        listingId,
        planKey,
        userId,
        paymentId: String(body.data.id),
      });
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      // Mark pago as rejected
      await service.from("pagos").update({
        mp_payment_id: String(body.data.id),
        mp_status:     payment.status,
        updated_at:    new Date().toISOString(),
      }).eq("listing_id", listingId).eq("user_id", userId).eq("mp_status", "pending");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("MP webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
