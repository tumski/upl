import { db } from "@/server/db";
import { eq, and, not, inArray } from "drizzle-orm";
import { items, orders } from "@/server/db/schema";
import { checkEnhancementStatus, downloadEnhancedImage, getDownloadUrl } from "./topaz";
import { put } from "@vercel/blob";
import { sendAdminNotification, sendCustomerEmail } from "./notifications";

const MAX_RETRY_ATTEMPTS = 3;
const MAX_DOWNLOAD_ATTEMPTS = 3;

interface ProcessingSummary {
  itemId: string;
  status: "completed" | "failed" | "processing" | "error";
  error?: string;
  enhancedImageUrl?: string;
  attempts: number;
  downloadAttempts?: number;
}

export async function checkTopazStatus(): Promise<ProcessingSummary[]> {
  const startTime = Date.now();
  console.log("\n=== Starting Topaz Status Check ===");
  console.log("Time:", new Date().toISOString());
  
  const summary: ProcessingSummary[] = [];
  
  try {
    // Find all items that are currently being upscaled
    const processingItems = await db.query.items.findMany({
      where: eq(items.status, "upscaling"),
    });

    console.log(`Found ${processingItems.length} items in upscaling status`);

    if (processingItems.length === 0) {
      console.log("No items to process");
      return summary;
    }

    for (const item of processingItems) {
      console.log(`\nProcessing item ${item.id}:`);
      console.log("- Current attempts:", item.upscalingAttempts || 0);
      console.log("- Process ID:", item.topazProcessId);

      const itemSummary: ProcessingSummary = {
        itemId: item.id,
        status: "processing",
        attempts: item.upscalingAttempts || 0,
      };

      if (!item.topazProcessId) {
        console.error("- Error: No Topaz process ID");
        itemSummary.status = "error";
        itemSummary.error = "No Topaz process ID";
        summary.push(itemSummary);
        continue;
      }

      try {
        const status = await checkEnhancementStatus(item.topazProcessId);
        console.log("- Topaz status:", status.status);

        // Map Topaz API status to our internal status
        const statusMap = {
          "Pending": "upscaling",
          "Processing": "upscaling",
          "Completed": "ready",
          "Failed": "error",
          "Cancelled": "error"
        } as const;

        if (status.status === "Completed") {
          console.log("- Getting download URL...");
          try {
            const downloadResponse = await getDownloadUrl(item.topazProcessId);
            console.log("- Got download URL:", {
              url: downloadResponse.url.substring(0, 50) + '...',
              expiresAt: new Date(downloadResponse.expires_at * 1000).toISOString()
            });
            
            try {
              // Download the enhanced image with retries
              const enhancedImage = await downloadWithRetry(downloadResponse.url);
              console.log("- Downloaded enhanced image:", {
                size: enhancedImage.size,
                type: enhancedImage.type
              });

              if (enhancedImage.size === 0) {
                throw new Error("Downloaded image has zero size");
              }

              // Upload to blob storage
              console.log("- Uploading to blob storage...");
              const blobUrl = await put(
                `enhanced/${item.id}.${status.output_format || 'jpg'}`,
                enhancedImage,
                { 
                  access: "public",
                  contentType: enhancedImage.type || `image/${status.output_format || 'jpeg'}`
                }
              );
              console.log("- Uploaded to blob storage:", blobUrl.url);

              // Verify the uploaded image
              try {
                const verifyResponse = await fetch(blobUrl.url);
                if (!verifyResponse.ok) {
                  throw new Error(`Failed to verify uploaded image: ${verifyResponse.statusText}`);
                }
                const verifyBlob = await verifyResponse.blob();
                if (verifyBlob.size === 0) {
                  throw new Error("Verified image has zero size");
                }
                console.log("- Verified uploaded image:", {
                  size: verifyBlob.size,
                  type: verifyBlob.type
                });
              } catch (error) {
                console.error("- Error verifying uploaded image:", error);
                throw new Error("Failed to verify uploaded image");
              }

              // Update database
              await db
                .update(items)
                .set({
                  status: "upscaling_complete",
                  enhancedImageUrl: blobUrl.url,
                  updatedAt: new Date(),
                  error: null
                })
                .where(eq(items.id, item.id));

              itemSummary.status = "completed";
              itemSummary.enhancedImageUrl = blobUrl.url;
              console.log("- Database updated");

              // Check if all items in this order are complete
              const orderItems = await db.query.items.findMany({
                where: eq(items.orderId, item.orderId),
              });

              const allComplete = orderItems.every(
                item => item.status === "upscaling_complete"
              );

              if (allComplete) {
                console.log("All items in order are complete, updating order status");
                
                // Get order and customer details
                const order = await db.query.orders.findFirst({
                  where: eq(orders.id, item.orderId),
                  with: {
                    customer: true,
                  },
                });

                if (order?.customer?.email) {
                  console.log("Sending completion notification to customer");
                  await sendCustomerEmail({
                    to: order.customer.email,
                    subject: "Your Images Are Ready - Upscale Print Labs",
                    text: `Great news! We've finished enhancing your images for order #${order.id}.

Your enhanced images:
${orderItems.map(item => `- ${item.name} (${item.size})`).join('\n')}

We're now preparing to send your order to our printing partner. You'll receive another notification once your prints are on their way.

Best regards,
Upscale Print Labs Team`,
                    html: `<h1>Great news!</h1>
<p>We've finished enhancing your images for order #${order.id}.</p>

<h2>Your enhanced images:</h2>
<ul>
${orderItems.map(item => `<li>${item.name} (${item.size})</li>`).join('\n')}
</ul>

<p>We're now preparing to send your order to our printing partner. You'll receive another notification once your prints are on their way.</p>

<p>Best regards,<br>
Upscale Print Labs Team</p>`
                  });
                }

                // Update order status
                await db
                  .update(orders)
                  .set({
                    status: "fulfillment_pending",
                    updatedAt: new Date(),
                  })
                  .where(eq(orders.id, item.orderId));
              }
            } catch (error) {
              console.error("- Error processing completed image:", error);
              await handleUpscalingFailure(
                item, 
                error instanceof Error ? error.message : "Error processing enhanced image",
                "download"
              );
              itemSummary.status = "failed";
              itemSummary.error = error instanceof Error ? error.message : "Unknown error";
            }
          } catch (error) {
            console.error("- Error getting download URL:", error);
            // Don't mark as failed yet, we can retry later
            console.log("- Still processing...");
            console.log(`- Progress: ${status.progress}%`);
            itemSummary.status = "processing";
          }
        } else if (status.status === "Failed") {
          console.log("- Upscaling failed");
          await handleUpscalingFailure(item, status.error || "Unknown error");
          itemSummary.status = "failed";
          itemSummary.error = status.error || "Unknown error";
        } else {
          console.log("- Still processing...");
          if (status.progress) {
            console.log(`- Progress: ${status.progress}%`);
          }
        }
      } catch (error) {
        console.error("- Error checking status:", error);
        itemSummary.status = "error";
        itemSummary.error = error instanceof Error ? error.message : "Unknown error";
      }

      summary.push(itemSummary);
    }
  } catch (error) {
    console.error("Error in status check:", error);
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    console.log("\n=== Status Check Summary ===");
    console.log("Duration:", Math.round(duration / 1000), "seconds");
    console.log("Items processed:", summary.length);
    console.log("Status breakdown:", 
      summary.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    );
    if (summary.some(item => item.error)) {
      console.log("\nErrors encountered:");
      summary
        .filter(item => item.error)
        .forEach(item => {
          console.log(`- Item ${item.itemId}: ${item.error}`);
        });
    }
    console.log("\n=== End Status Check ===\n");
  }

  return summary;
}

async function downloadWithRetry(url: string, maxAttempts: number = MAX_DOWNLOAD_ATTEMPTS): Promise<Blob> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`- Download attempt ${attempt}/${maxAttempts}`);
      const blob = await downloadEnhancedImage(url);
      
      if (blob.size === 0) {
        throw new Error("Downloaded image has zero size");
      }
      
      return blob;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      console.error(`- Download attempt ${attempt} failed:`, lastError.message);
      
      if (attempt < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
        console.log(`- Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("All download attempts failed");
}

async function handleUpscalingFailure(
  item: typeof items.$inferSelect,
  error: string,
  errorType: "upscaling" | "download" = "upscaling"
) {
  const attempts = (item.upscalingAttempts || 0) + 1;
  console.log(`Handling ${errorType} failure for item ${item.id} (Attempt ${attempts}/${MAX_RETRY_ATTEMPTS})`);

  await db
    .update(items)
    .set({
      status: "upscaling_failed",
      upscalingAttempts: attempts,
      updatedAt: new Date(),
      error: error,
    })
    .where(eq(items.id, item.id));

  if (attempts >= MAX_RETRY_ATTEMPTS) {
    console.log("Max retry attempts reached, notifying admin");
    await sendAdminNotification({
      subject: `${errorType === "upscaling" ? "Upscaling" : "Download"} Failed - Max Retries Reached`,
      message: `Item ${item.id} has failed ${errorType} after ${attempts} attempts.
Original Image: ${item.originalImageUrl}
Process ID: ${item.topazProcessId}
Last error: ${error}

Please check the Topaz dashboard for more details.`,
      severity: "high",
    });
  } else {
    console.log(`Item marked as failed, ${MAX_RETRY_ATTEMPTS - attempts} retries remaining`);
  }
}
