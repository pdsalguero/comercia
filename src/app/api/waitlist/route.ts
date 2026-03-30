import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
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
    }

    await sendEmail({
      to: process.env.NOTIFY_EMAIL ?? "pdsalguero@gmail.com",
      subject: `Nueva suscripción en ComerxIA: ${email}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#f97316;margin:0 0 16px">🎉 Nueva suscripción en ComerxIA</h2>
          <p style="font-size:16px;color:#0f172a;margin:0 0 8px">
            Un nuevo usuario se registró para acceso anticipado:
          </p>
          <p style="font-size:20px;font-weight:700;color:#1e293b;background:#f1f5f9;padding:12px 16px;border-radius:8px;margin:0">
            ${email}
          </p>
          <p style="font-size:13px;color:#94a3b8;margin:24px 0 0">
            ${new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[waitlist]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
