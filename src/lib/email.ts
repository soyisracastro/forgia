import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SES_SMTP_HOST,
  port: Number(process.env.SES_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SES_SMTP_USER,
    pass: process.env.SES_SMTP_PASS,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Forgia <hola@forgia.fit>',
    to,
    subject,
    html,
  });
}

interface BulkResult {
  sent: number;
  failed: number;
  errors: string[];
}

export async function sendBulkEmail(
  recipients: { email: string; displayName: string | null }[],
  subject: string,
  htmlTemplate: (name: string) => string
): Promise<BulkResult> {
  const result: BulkResult = { sent: 0, failed: 0, errors: [] };

  for (const recipient of recipients) {
    try {
      const name = recipient.displayName || 'Atleta';
      await sendEmail({
        to: recipient.email,
        subject,
        html: htmlTemplate(name),
      });
      result.sent++;

      // Respetar rate limit de SES (max 14/seg en producción, 1/seg en sandbox)
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      result.failed++;
      result.errors.push(
        `${recipient.email}: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  return result;
}
