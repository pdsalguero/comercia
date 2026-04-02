import { sendEmail } from '@/lib/email';
import { welcomeEmailTemplate } from '@/lib/emailTemplates';

export async function GET() {
  console.log("KEY_ID:", process.env.AWS_ACCESS_KEY_ID?.slice(0, 8));
  console.log("SECRET len:", process.env.AWS_SECRET_ACCESS_KEY?.length);
  console.log("REGION:", process.env.AWS_SES_REGION);
  try {
    const { html } = welcomeEmailTemplate('Pablo');
    await sendEmail({
      to: 'pdsalguero@gmail.com',
      subject: '¡Bienvenido a ComerxIA!',
      html,
    });
    return Response.json({ success: true, message: 'Email enviado' });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
