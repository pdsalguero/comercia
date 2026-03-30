import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error: dbError } = await supabase
      .from("waitlist")
      .upsert({ email: email.toLowerCase().trim() }, { onConflict: "email", ignoreDuplicates: true });

    if (dbError) {
      console.error("[waitlist] DB error:", dbError);
      return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[waitlist]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
