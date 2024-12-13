import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyWebhookSignature, topazWebhookSchema } from "@/utils/topaz-webhook";
import { db } from "@/server/db";
import { items } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { downloadEnhancedImage, enhanceImage } from "@/utils/topaz";
import { put } from "@vercel/blob";
import { sendAdminNotification } from "@/utils/notifications";

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MINUTES = 5;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get("x-webhook-signature");

  if (!signature) {
    return new NextResponse("No signature", { status: 400 });
  }

  if (!verifyWebhookSignature(body, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  try {
    const payload = topazWebhookSchema.parse(JSON.parse(body));
    const item = await db.query.items.findFirst({
      where: eq(items.topazProcessId, payload.process_id),
    });

    if (!item) {
      console.error(`No item found for process ID: ${payload.process_id}`);
      return new NextResponse(null, { status: 200 });
    }

    if (payload.status === "completed" && payload.result_url) {
      try {
        const enhancedImageBlob = await downloadEnhancedImage(payload.result_url);
        const { url } = await put(
          `enhanced-${item.id}.${payload.filename.split(".").pop() || "jpg"}`,
          enhancedImageBlob,
          { access: "public" }
        );

        await db
          .update(items)
          .set({
            enhancedImageUrl: url,
            status: "upscaled",
            updatedAt: new Date(),
          })
          .where(eq(items.id, item.id));

      } catch (error) {
        console.error("Error processing enhanced image:", error);
        await handleUpscalingFailure(item, "Error processing enhanced image");
      }
    } else if (payload.status === "failed") {
      await handleUpscalingFailure(item, payload.error || "Unknown error");
    }

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new NextResponse("Webhook error", { status: 400 });
  }
}

async function handleUpscalingFailure(item: typeof items.$inferSelect, error: string) {
  const attempts = (item.upscalingAttempts || 0) + 1;
  const shouldRetry = attempts < MAX_RETRY_ATTEMPTS;

  if (shouldRetry) {
    const lastAttempt = new Date(Date.now() - RETRY_DELAY_MINUTES * 60 * 1000);
    if (!item.lastUpscalingAttempt || item.lastUpscalingAttempt < lastAttempt) {
      try {
        // Retry immediately if enough time has passed
        const processId = await enhanceImage(item.originalImageUrl);
        await db
          .update(items)
          .set({
            topazProcessId: processId,
            status: "upscaling",
            upscalingAttempts: attempts,
            lastUpscalingAttempt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(items.id, item.id));
        
        console.log(`Retrying upscaling for item ${item.id}, attempt ${attempts}`);
        return;
      } catch (retryError) {
        console.error("Error during retry:", retryError);
      }
    }
  }

  // If we can't retry or retry failed, mark as failed
  await db
    .update(items)
    .set({
      status: "upscaling_failed",
      upscalingAttempts: attempts,
      lastUpscalingAttempt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(items.id, item.id));

  if (!shouldRetry) {
    await sendAdminNotification({
      subject: "Upscaling Failed - Max Retries Reached",
      message: `Item ${item.id} has failed upscaling after ${attempts} attempts. Last error: ${error}`,
      severity: "high",
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
