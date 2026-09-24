import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidateHome } from "@/lib/revalidate-home";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export async function POST(req: NextRequest) {
  // Usa la clave de servicio: sin esta verificación cualquiera podía dar de baja cualquier aviso.
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { ids, action } = await req.json();
  if (!ids?.length || !action) return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });

  const supabase = createServiceClient();

  const updates: Record<string, any> = {
    remove:   { status: "removed" },
    restore:  { status: "active" },
    pause:    { status: "paused" },
    activate: { status: "active" },
  };

  const update = updates[action];
  if (!update) return NextResponse.json({ error: "Acción inválida" }, { status: 400 });

  const { error } = await supabase.from("listings").update(update).in("id", ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateHome();
  return NextResponse.json({ ok: true, count: ids.length });
}
