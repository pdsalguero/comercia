import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import MercadoPagoConfig, { Preference } from "mercadopago";

export const maxDuration = 30;

export const PLAN_META: Record<string, { name: string; price: number; days: number; featured_level: string }> = {
  bronze_7:  { name: "Estandar 7 dias",   price: 699,  days: 7,  featured_level: "bronze" },
  bronze_15: { name: "Estandar 15 dias",  price: 1299, days: 15, featured_level: "bronze" },
  bronze_30: { name: "Estandar 30 dias",  price: 2499, days: 30, featured_level: "bronze" },
  silver_7:  { name: "Destacado 7 dias",  price: 1299, days: 7,  featured_level: "silver" },
  silver_15: { name: "Destacado 15 dias", price: 2299, days: 15, featured_level: "silver" },
  silver_30: { name: "Destacado 30 dias", price: 4199, days: 30, featured_level: "silver" },
  gold_7:    { name: "Premium 7 dias",    price: 1799, days: 7,  featured_level: "gold"   },
  gold_15:   { name: "Premium 15 dias",   price: 3299, days: 15, featured_level: "gold"   },
  gold_30:   { name: "Premium 30 dias",   price: 6999, days: 30, featured_level: "gold"   },
};

export async function POST(req: NextRequest) {
  try {
    // Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Get user email from auth
    const userEmail = user.email ?? "";

    // Validate email
    if (!userEmail || !userEmail.includes("@")) {
      console.error("[mp/checkout] Invalid payer email:", userEmail);
      return NextResponse.json({ error: "Email de usuario inválido" }, { status: 400 });
    }

    // Parse body — always JSON
    const body = await req.json();
    const listingId: string = body.listing_id;
    const planKey: string   = body.plan_key;

    // Fetch full name from profiles + listing data in parallel
    const service = createServiceClient();
    const [{ data: profile }, { data: listing }] = await Promise.all([
      service.from("profiles").select("full_name").eq("id", user.id).single(),
      listingId
        ? service.from("listings").select("id, title, category_id, price, status").eq("id", listingId).single()
        : Promise.resolve({ data: null, error: null }),
    ]);

    const fullName = profile?.full_name ?? "Usuario ComerxIA";

    // LOG 1: User data
    console.log("[mp/checkout] USER:", JSON.stringify({
      id:       user.id,
      email:    userEmail,
      name:     fullName,
    }, null, 2));

    // LOG 2: Listing data
    console.log("[mp/checkout] LISTING:", JSON.stringify(listing, null, 2));

    if (!listingId || !planKey) {
      return NextResponse.json({ error: "listing_id y plan_key son requeridos" }, { status: 400 });
    }

    const plan = PLAN_META[planKey];
    if (!plan) {
      return NextResponse.json({ error: `Plan no reconocido: ${planKey}` }, { status: 400 });
    }

    const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    if (!BASE) {
      return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL no configurado" }, { status: 500 });
    }

    const externalRef = `${listingId}__${planKey}__${user.id}`;

    // Create MP preference
    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });
    const prefClient = new Preference(mpClient);

    const prefBody = {
      items: [
        {
          id:          planKey,
          title:       `ComerxIA - ${plan.name}`,
          description: `Destacado por ${plan.days} dias en ComerxIA`,
          quantity:    1,
          unit_price:  plan.price,
          currency_id: "ARS",
        },
      ],
      payer: {
        name:  fullName,
        email: userEmail,
      },
      back_urls: {
        success: `${BASE}/api/mp/callback`,
        failure: `${BASE}/upgrade?listing_id=${listingId}&error=1`,
        pending: `${BASE}/upgrade?listing_id=${listingId}&pending=1`,
      },
      auto_return:        "approved",
      external_reference: externalRef,
      notification_url:   `${BASE}/api/mp/webhook`,
      statement_descriptor: "ComerxIA",
    };

    // LOG 3: Full preference body + token info
    console.log("[mp/checkout] MP_ACCESS_TOKEN prefix:", process.env.MP_ACCESS_TOKEN?.slice(0, 16));
    console.log("[mp/checkout] PREFERENCE BODY:", JSON.stringify(prefBody, null, 2));

    let pref: any;
    try {
      pref = await prefClient.create({ body: prefBody });
      // LOG 4: MP response
      console.log("[mp/checkout] MP RESPONSE:", JSON.stringify(pref, null, 2));
    } catch (mpErr: any) {
      // LOG 4 (error): full MP error
      console.error("[mp/checkout] MP ERROR:", JSON.stringify(mpErr, null, 2));
      console.error("[mp/checkout] MP ERROR message:", mpErr?.message);
      console.error("[mp/checkout] MP ERROR cause:", mpErr?.cause);
      throw mpErr;
    }

    if (!pref.init_point) {
      return NextResponse.json({ error: "MP no devolvio init_point" }, { status: 500 });
    }

    console.log("[mp/checkout] SUCCESS — pref.id:", pref.id);

    // Save pago record
    await service.from("pagos").insert({
      listing_id:       listingId,
      user_id:          user.id,
      plan_key:         planKey,
      plan_name:        plan.name,
      amount:           plan.price,
      days:             plan.days,
      featured_level:   plan.featured_level,
      mp_preference_id: pref.id,
      mp_status:        "pending",
    });

    return NextResponse.json({ init_point: pref.init_point });

  } catch (err: any) {
    console.error("[mp/checkout] error:", err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? "Error al crear preferencia MercadoPago" },
      { status: 500 }
    );
  }
}
