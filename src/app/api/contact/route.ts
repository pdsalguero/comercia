import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 });
    }

    // 1. Save to Supabase (always, regardless of email config)
    try {
      const supabase = await createClient();
      await supabase.from("contact_messages").insert({
        name, email, phone: phone || null,
        subject: subject || "Consulta general",
        message, email_sent: false,
      });
    } catch {
      // Table may not exist yet — not critical, continue
    }

    // 2. Send email if Gmail credentials are configured
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      });

      await transporter.sendMail({
        from: `"ComerxIA Contacto" <${gmailUser}>`,
        to: "pdsalguero@gmail.com",
        replyTo: email,
        subject: `[ComerxIA] ${subject ?? "Consulta"} — ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0f172a; padding: 24px 32px; border-radius: 10px 10px 0 0;">
              <h2 style="color: #f97316; margin: 0; font-size: 20px;">📩 Nuevo mensaje de contacto</h2>
            </div>
            <div style="background: #f8fafc; padding: 28px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 120px;">Nombre</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 14px;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Email</td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #6366f1; font-size: 14px;">${email}</a></td>
                </tr>
                ${phone ? `<tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Teléfono</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${phone}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Asunto</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${subject}</td>
                </tr>
              </table>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
              <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">Mensaje:</p>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; color: #1e293b; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
              <p style="margin: 20px 0 0; font-size: 11px; color: #94a3b8;">
                Respondé directamente a este correo para responderle a ${name}.
              </p>
            </div>
          </div>
        `,
      });

      // Mark as sent in DB
      try {
        const supabase = await createClient();
        await supabase
          .from("contact_messages")
          .update({ email_sent: true })
          .eq("email", email)
          .order("created_at", { ascending: false })
          .limit(1);
      } catch { /* not critical */ }
    } else {
      console.warn("⚠️  GMAIL_USER / GMAIL_APP_PASSWORD no configurados. El mensaje fue guardado pero no enviado por email.");
      console.info("📩 Mensaje de:", name, email, "|", subject);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en /api/contact:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
