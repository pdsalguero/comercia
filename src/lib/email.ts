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
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const command = new SendEmailCommand({
      Source: process.env.AWS_SES_FROM_EMAIL ?? "noreply@comerxia.com.ar",
      Destination: { ToAddresses: [to] },
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
