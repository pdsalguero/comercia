import { sendEmail } from "@/lib/email";
import { welcomeEmailTemplate } from "@/lib/emailTemplates";

export async function GET() {
  try {
    const { subject, html } = welcomeEmailTemplate("Pablo");
    await sendEmail({ to: "pdsalguero@gmail.com", subject, html });
    return Response.json({ success: true, message: "Email enviado" });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
