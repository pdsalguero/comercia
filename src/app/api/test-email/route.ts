import { sendEmail } from '@/lib/email';
import { welcomeEmailTemplate } from '@/lib/emailTemplates';

export async function GET() {
  try {
    await sendEmail({
      to: 'pdsalguero@gmail.com',
      subject: '¡Bienvenido a ComerxIA!',
      html: welcomeEmailTemplate('Pablo'),
    });
    return Response.json({ success: true, message: 'Email enviado' });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
