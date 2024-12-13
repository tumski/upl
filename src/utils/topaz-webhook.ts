import { z } from "zod";
import crypto from "crypto";

// Ensure TOPAZ_WEBHOOK_SECRET is set
if (!process.env.TOPAZ_WEBHOOK_SECRET) {
  throw new Error("TOPAZ_WEBHOOK_SECRET must be defined in environment variables");
}

// Webhook payload schema
export const topazWebhookSchema = z.object({
  process_id: z.string(),
  status: z.enum(["completed", "failed"]),
  filename: z.string(),
  result_url: z.string().optional(),
  error: z.string().optional(),
});

export type TopazWebhookPayload = z.infer<typeof topazWebhookSchema>;

/**
 * Verify that the webhook request is coming from Topaz
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const hmac = crypto.createHmac("sha256", process.env.TOPAZ_WEBHOOK_SECRET!);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
