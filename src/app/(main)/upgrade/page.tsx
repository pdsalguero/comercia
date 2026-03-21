import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

const PLANS = [
  {
    key: "bronze",
    name: "Estándar",
    badge: "⭐ ESTÁNDAR",
    price: 1500,
    color: "#f97316",
    colorLight: "#fff7ed",
    colorBorder: "#fed7aa",
    gradient: "linear-gradient(135deg,#f97316,#fb923c)",
    shadow: "0 4px 24px rgba(249,115,22,0.18)",
    description: "Dale más visibilidad a tu publicación dentro de su categoría.",
    features: [
      "Aparece antes que los anuncios gratuitos",
      "Badge ⭐ Estándar en tu publicación",
      "Borde naranja destacado",
      "Vigencia 7 días",
    ],
    cta: "Activar Estándar",
  },
  {
    key: "silver",
    name: "Destacado",
    badge: "🚀 DESTACADO",
    price: 3500,
    color: "#6366f1",
    colorLight: "#eef2ff",
    colorBorder: "#c7d2fe",
    gradient: "linear-gradient(135deg,#6366f1,#818cf8)",
    shadow: "0 4px 24px rgba(99,102,241,0.22)",
    description: "Mayor exposición en toda la categoría con diseño diferenciado.",
    features: [
      "Todo lo de Estándar",
      "Badge 🚀 Destacado en tu publicación",
      "Borde violeta llamativo",
      "Posición preferencial en la categoría",
      "Vigencia 15 días",
    ],
    cta: "Activar Destacado",
    popular: true,
  },
  {
    key: "gold",
    name: "Premium",
    badge: "👑 PREMIUM",
    price: 6000,
    color: "#d97706",
    colorLight: "#fffbeb",
    colorBorder: "#fde68a",
    gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)",
    shadow: "0 4px 24px rgba(251,191,36,0.28)",
    description: "Máxima visibilidad: aparece en la home y al tope de cada categoría.",
    features: [
      "Todo lo de Destacado",
      "Badge 👑 Premium en tu publicación",
      "Borde dorado exclusivo",
      "Aparece en la sección Premium de la página principal",
      "Primero en cualquier categoría",
      "Vigencia 30 días",
    ],
    cta: "Activar Premium",
  },
];

async function createCheckout(listingId: string, planKey: string) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const plan = PLANS.find((p) => p.key === planKey);
  if (!plan) redirect(`/upgrade?listing_id=${listingId}`);

  const BASE = process.env.NEXT_PUBLIC_APP_URL!;
  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
  const prefClient = new Preference(client);

  const pref = await prefClient.create({
    body: {
      items: [
        {
          id: planKey,
          title: `Plan ${plan.name} — ComerxIA`,
          quantity: 1,
          unit_price: plan.price,
          currency_id: "ARS",
          description: plan.description,
        },
      ],
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

  redirect(pref.init_point!);
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ listing_id?: string; error?: string; pending?: string }>;
}) {
  const { listing_id, error, pending } = await searchParams;

  // Fetch listing title if id provided
  let listingTitle: string | null = null;
  if (listing_id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings")
      .select("title")
      .eq("id", listing_id)
      .single();
    listingTitle = data?.title ?? null;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px 16px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111", marginBottom: "6px" }}>
          📣 Destacá tu publicación
        </h1>
        {listingTitle ? (
          <p style={{ fontSize: "13px", color: "#6366f1", fontWeight: 600, maxWidth: "480px", margin: "0 auto" }}>
            Aplicar plan a: &ldquo;{listingTitle}&rdquo;
          </p>
        ) : (
          <p style={{ fontSize: "13px", color: "#888", maxWidth: "480px", margin: "0 auto" }}>
            Más personas ven tu aviso, más rápido vendés. Elegí el plan que mejor se adapte.
          </p>
        )}
      </div>

      {/* Payment status banners */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: "12px",
          padding: "14px 20px", marginBottom: "16px",
          display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#b91c1c",
        }}>
          <span style={{ fontSize: "18px" }}>❌</span>
          <span>El pago no fue procesado. Podés intentarlo nuevamente eligiendo un plan.</span>
        </div>
      )}
      {pending && (
        <div style={{
          background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "12px",
          padding: "14px 20px", marginBottom: "16px",
          display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#92400e",
        }}>
          <span style={{ fontSize: "18px" }}>⏳</span>
          <span>Tu pago está siendo procesado. Te avisaremos cuando se acredite y el plan se active automáticamente.</span>
        </div>
      )}

      {/* Plans grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "16px",
        alignItems: "start",
      }}>
        {PLANS.map((plan) => {
          const action = listing_id
            ? createCheckout.bind(null, listing_id, plan.key)
            : null;

          return (
            <div
              key={plan.key}
              style={{
                background: "#fff",
                borderRadius: "16px",
                border: `2px solid ${plan.colorBorder}`,
                boxShadow: plan.shadow,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Color header */}
              <div style={{
                background: plan.colorLight,
                padding: "16px 20px 14px",
                borderBottom: `1px solid ${plan.colorBorder}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <div style={{
                    display: "inline-block",
                    background: plan.gradient,
                    color: "#fff",
                    borderRadius: "6px",
                    padding: "3px 9px",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}>
                    {plan.badge}
                  </div>
                  {plan.popular && (
                    <div style={{
                      background: plan.gradient,
                      color: "#fff", borderRadius: "20px",
                      padding: "2px 9px", fontSize: "10px", fontWeight: 700,
                    }}>
                      MÁS ELEGIDO
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#111" }}>
                    {plan.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                    <span style={{ fontSize: "12px", color: "#888" }}>$</span>
                    <span style={{ fontSize: "24px", fontWeight: 900, color: plan.color, lineHeight: 1 }}>
                      {plan.price.toLocaleString("es-AR")}
                    </span>
                    <span style={{ fontSize: "11px", color: "#aaa" }}>ARS</span>
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "#777", lineHeight: 1.4 }}>
                  {plan.description}
                </div>
              </div>

              {/* Features */}
              <div style={{ padding: "14px 20px" }}>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "7px", fontSize: "12px", color: "#444" }}>
                      <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div style={{ padding: "0 20px 18px" }}>
                {action ? (
                  <form action={action}>
                    <button type="submit" style={{
                      width: "100%",
                      background: plan.gradient,
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "13px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: plan.shadow,
                    }}>
                      {plan.cta}
                    </button>
                  </form>
                ) : (
                  <Link href="/listings/new" style={{ textDecoration: "none" }}>
                    <button style={{
                      width: "100%",
                      background: plan.gradient,
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "13px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: plan.shadow,
                    }}>
                      {plan.cta}
                    </button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div style={{
        marginTop: "20px",
        background: "#f8fafc",
        borderRadius: "12px",
        padding: "14px 20px",
        display: "flex",
        gap: "16px",
        alignItems: "flex-start",
      }}>
        <span style={{ fontSize: "22px" }}>💡</span>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#333", marginBottom: "4px" }}>¿Cómo funciona?</div>
          <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
            Al publicar tu aviso, podés elegir un plan para que aparezca antes que los anuncios gratuitos.
            Los planes <strong>Premium</strong> también aparecen en la página principal del sitio, lo que maximiza la exposición.
            El destacado se activa de forma inmediata y dura según el plan elegido.
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        {listing_id ? (
          <Link href={`/dashboard/my-listings/${listing_id}/edit`} style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
            ← Volver al aviso
          </Link>
        ) : (
          <Link href="/listings" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
            ← Volver a los avisos
          </Link>
        )}
      </div>
    </div>
  );
}
