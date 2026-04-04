import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { listing_id } = await req.json();
    if (!listing_id) {
      return NextResponse.json({ error: "listing_id es requerido" }, { status: 400 });
    }

    const service = createServiceClient();

    // Verificar que el listing pertenece al usuario
    const { data: listing } = await service
      .from("listings")
      .select("id")
      .eq("id", listing_id)
      .eq("user_id", user.id)
      .single();

    if (!listing) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
    }

    // Decremento atómico: solo procede si credits > 0
    const { data: decremented, error: rpcError } = await service.rpc(
      "decrement_free_credit",
      { p_user_id: user.id }
    );

    if (rpcError || !decremented) {
      return NextResponse.json({ error: "Sin créditos disponibles" }, { status: 400 });
    }

    // Activar Gold indefinido (sin fecha de vencimiento)
    await service.from("listings").update({
      featured_level:   "gold",
      destacado_activo: true,
      destacado_hasta:  null,   // sin límite de tiempo
      destacado_tipo:   "gold",
      is_featured:      true,
      featured_until:   null,
    }).eq("id", listing_id).eq("user_id", user.id);

    // Registrar en pagos con amount = 0
    await service.from("pagos").insert({
      listing_id:     listing_id,
      user_id:        user.id,
      plan_key:       "gold_free",
      plan_name:      "Premium Gold indefinido (crédito gratuito)",
      amount:         0,
      days:           0,
      featured_level: "gold",
      mp_status:      "free",
    });

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error("[free-destacado] error:", err?.message ?? err);
    return NextResponse.json({ error: "Error al activar destacado gratuito" }, { status: 500 });
  }
}
