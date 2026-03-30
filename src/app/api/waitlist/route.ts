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
      .insert({ email: email.toLowerCase().trim() });

    // 23505 = unique_violation (email already registered), treat as success
    if (dbError && dbError.code !== "23505") {
      console.error("[waitlist] DB error:", dbError);
      return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[waitlist]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
