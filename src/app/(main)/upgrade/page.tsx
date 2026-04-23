import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PlanCards } from "@/components/upgrade/PlanCards";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ listing_id?: string; error?: string; pending?: string }>;
}) {
  const { listing_id, error, pending } = await searchParams;

  let listingTitle: string | null = null;
  let freeCredits = 0;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (listing_id) {
    const { data } = await supabase
      .from("listings")
      .select("title")
      .eq("id", listing_id)
      .single();
    listingTitle = data?.title ?? null;
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("free_destacado_credits")
      .eq("id", user.id)
      .single();
    freeCredits = profile?.free_destacado_credits ?? 0;
  }

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "20px 16px" }}>

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
            Más personas ven tu aviso, más rápido vendés. Elegí el plan y la duración que mejor se adapte.
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

      {/* Plans */}
      <PlanCards listingId={listing_id} freeCredits={freeCredits} />

      {/* Bottom note */}
      <div style={{
        marginTop: "20px", background: "#f8fafc", borderRadius: "12px",
        padding: "14px 20px", display: "flex", gap: "16px", alignItems: "flex-start",
      }}>
        <span style={{ fontSize: "22px" }}>💡</span>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#333", marginBottom: "4px" }}>¿Cómo funciona?</div>
          <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>
            Elegí el plan y la duración que más te convenga. Los planes <strong>Premium</strong> también aparecen
            en la página principal del sitio, maximizando la exposición. El destacado se activa de forma inmediata.
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        {listing_id && (
          <Link
            href={`/listings/${listing_id}`}
            style={{
              fontSize: "13px", color: "#64748b", textDecoration: "none", fontWeight: 500,
              background: "#f1f5f9", borderRadius: "8px", padding: "9px 20px",
              border: "1px solid #e2e8f0",
            }}
          >
            Publicar sin destacar (aviso gratuito)
          </Link>
        )}
        {listing_id ? (
          <Link href={`/listings/${listing_id}`} style={{ fontSize: "12px", color: "#94a3b8", textDecoration: "none" }}>
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
