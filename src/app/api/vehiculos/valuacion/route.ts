import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dnrpaValuation, VALUACION_VIGENCIA } from "@/lib/dnrpa-valuation";

// Valuación fiscal DNRPA de marca + modelo + año, para mostrarle al vendedor mientras publica.
// No se muestra a compradores: por eso pide sesión (el formulario de publicar ya la exige).
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const brand = sp.get("brand") ?? "";
  const model = sp.get("model") ?? "";
  const year = sp.get("year") ?? "";
  if (!brand || !model || !/^\d{4}$/.test(year)) return NextResponse.json(null);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json(null, { status: 401 });

  const v = dnrpaValuation(brand, model, year);
  if (!v) return NextResponse.json(null);
  return NextResponse.json({ min: v[0], max: v[1], vigencia: VALUACION_VIGENCIA });
}
