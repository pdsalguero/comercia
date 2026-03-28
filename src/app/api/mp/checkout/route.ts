import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import MercadoPagoConfig, { Preference } from "mercadopago";

export const PLAN_META: Record<string, { name: string; price: number; days: number; featured_level: string }> = {
  bronze_7:  { name: "Estándar 7 días",   price: 699,  days: 7,  featured_level: "bronze" },
  bronze_15: { name: "Estándar 15 días",  price: 1299, days: 15, featured_level: "bronze" },
  bronze_30: { name: "Estándar 30 días",  price: 2499, days: 30, featured_level: "bronze" },
  silver_7:  { name: "Destacado 7 días",  price: 1299, days: 7,  featured_level: "silver" },
  silver_15: { name: "Destacado 15 días", price: 2299, days: 15, featured_level: "silver" },
  silver_30: { name: "Destacado 30 días", price: 4199, days: 30, featured_level: "silver" },
  gold_7:    { name: "Premium 7 días",    price: 1799, days: 7,  featured_level: "gold"   },
  gold_15:   { name: "Premium 15 días",   price: 3299, days: 15, featured_level: "gold"   },
  gold_30:   { name: "Premium 30 días",   price: 6999, days: 30, featured_level: "gold"   },
};

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  // Parse body (supports both JSON and form-data)
  let listingId: string;
  let planKey: string;
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = await req.json();
    listingId = body.listing_id;
    planKey   = body.plan_key;
  } else {
    const fd = await req.formData();
    listingId = fd.get("listing_id") as string;
    planKey   = fd.get("plan_key") as string;
  }

  const plan = PLAN_META[planKey];
  if (!plan || !listingId) {
    return NextResponse.redirect(new URL(`/upgrade?listing_id=${listingId ?? ""}&error=1`, req.url));
  }

  const BASE = process.env.NEXT_PUBLIC_APP_URL!;

  // Create MP preference
  const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
  const prefClient = new Preference(mpClient);

  const pref = await prefClient.create({
    body: {
      items: [{
        id: planKey,
        title: `Plan ${plan.name} — ComerxIA`,
        quantity: 1,
        unit_price: plan.price,
        currency_id: "ARS",
        description: `Destacado por ${plan.days} días`,
      }],
      back_urls: {
        success: `${BASE}/api/mp/callback`,
        failure: `${BASE}/upgrade?listing_id=${listingId}&error=1`,
        pending: `${BASE}/upgrade?listing_id=${listingId}&pending=1`,
      },
      auto_return: "approved",
      external_reference: `${listingId}|${planKey}|${user.id}`,
      notification_url: `${BASE}/api/mp/webhook`,
    },
  });

  // Save pago record with status=pending
  const service = createServiceClient();
  await service.from("pagos").insert({
    listing_id:      listingId,
    user_id:         user.id,
    plan_key:        planKey,
    plan_name:       plan.name,
    amount:          plan.price,
    days:            plan.days,
    featured_level:  plan.featured_level,
    mp_preference_id: pref.id,
    mp_status:       "pending",
  });

  return NextResponse.redirect(pref.init_point!);
}
