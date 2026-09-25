import type { User } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";
import { welcomeEmailTemplate } from "@/lib/emailTemplates";

/**
 * Mail de bienvenida al confirmar el registro. Se manda solo si el mail se acaba de confirmar
 * (el link de confirmación es de un solo uso, así que no se repite). Antes se miraba
 * created_at < 1 minuto y casi nunca se cumplía: la gente tarda más que eso en abrir el mail.
 */
export function sendWelcomeIfJustConfirmed(user: User | null | undefined): void {
  if (!user?.email || !user.email_confirmed_at) return;
  if (Date.now() - new Date(user.email_confirmed_at).getTime() > 10 * 60_000) return;
  const userName = user.user_metadata?.full_name?.split(" ")[0] ?? user.email.split("@")[0];
  const { subject, html } = welcomeEmailTemplate(userName);
  sendEmail({ to: user.email, subject, html }).catch(console.error);
}
