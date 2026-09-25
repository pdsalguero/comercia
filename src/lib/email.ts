import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_SES_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  /** "Responder a": al contestar el mail, la respuesta va a esta dirección y no al remitente no-reply@ */
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  try {
    const command = new SendEmailCommand({
      Source: process.env.AWS_SES_FROM_EMAIL ?? "pdsalguero@gmail.com",
      Destination: { ToAddresses: [to] },
      ...(replyTo ? { ReplyToAddresses: [replyTo] } : {}),
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: { Html: { Data: html, Charset: "UTF-8" } },
      },
    });

    const result = await ses.send(command);
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error("[SES] Error enviando email:", error);
    return { success: false, error };
  }
}
