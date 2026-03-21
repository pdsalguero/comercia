import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * MercadoPago IPN / webhook handler.
 * Applies the plan as a reliable backup in case the user closes the browser
 * before the callback redirect completes.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // MP sends { type: "payment", data: { id: "..." } }
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ ok: true });
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: body.data.id });

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    const externalRef = payment.external_reference;
    if (!externalRef) return NextResponse.json({ ok: true });

    const [listingId, planKey, userId] = externalRef.split("|");
    if (!listingId || !planKey || !userId) return NextResponse.json({ ok: true });

    const supabase = createServiceClient();
    await supabase
      .from("listings")
      .update({ featured_level: planKey })
      .eq("id", listingId)
      .eq("user_id", userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("MP webhook error:", err);
    // Always return 200 so MP doesn't retry indefinitely
    return NextResponse.json({ ok: true });
  }
}
