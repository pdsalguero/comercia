import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { requestOrigin, safeNextPath } from "@/lib/request-origin";
import { sendWelcomeIfJustConfirmed } from "@/lib/welcome-email";

const OTP_TYPES: EmailOtpType[] = ["signup", "email", "recovery", "invite", "email_change", "magiclink"];

/**
 * GET /api/auth/confirm?token_hash=…&type=…&next=/…
 *
 * Destino de los links de los mails de Supabase (confirmar cuenta, recuperar contraseña, invitación,
 * cambio de mail). Los templates arman el link con {{ .TokenHash }}, que se verifica acá en el servidor.
 *
 * Por qué no ?code= (PKCE): ese código solo se puede canjear en el mismo navegador donde se pidió el
 * mail (la clave queda en una cookie). Si la persona lo pide en la compu y lo abre en el celular, o
 * desde otra ventana, falla con "link expirado". El token_hash no tiene esa limitación.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = requestOrigin(request);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"), type === "recovery" ? "/reset-password" : "/");

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      if (type === "signup" || type === "email") sendWelcomeIfJustConfirmed(data.user);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=link_expirado`);
}
