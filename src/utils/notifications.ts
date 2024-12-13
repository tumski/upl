import { z } from "zod";
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY must be defined in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const notificationSchema = z.object({
  subject: z.string(),
  message: z.string(),
  severity: z.enum(["low", "medium", "high"]).default("medium"),
});

type NotificationPayload = z.infer<typeof notificationSchema>;

export async function sendAdminNotification(payload: NotificationPayload): Promise<void> {
  const { subject, message, severity } = notificationSchema.parse(payload);

  const notificationBody = `
=== ADMIN NOTIFICATION ===
Severity: ${severity.toUpperCase()}
Time: ${new Date().toISOString()}

${message}

This is an automated message from Upscale Print Labs.
========================
`;

  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Logging email instead of sending');
    console.log(notificationBody);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Upscale Print Labs <notifications@upscaleprintlabs.com>',
      to: process.env.ADMIN_EMAIL!,
      subject: `[UPL ${severity.toUpperCase()}] ${subject}`,
      text: notificationBody,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    // Log the email content in case of failure
    console.log('Email that would have been sent:', notificationBody);
  }
}

export async function sendCustomerEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Logging email instead of sending');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    if (html) console.log(`HTML: ${html}`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Upscale Print Labs <notifications@upscaleprintlabs.com>',
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Failed to send customer email:', error);
    // Log the email content in case of failure
    console.log('Email that would have been sent:', { to, subject, text, html });
  }
}
