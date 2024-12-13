import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { items } from "@/server/db/schema";
import { checkEnhancementStatus, downloadEnhancedImage, getDownloadUrl } from "./topaz";
import { put } from "@vercel/blob";
import { sendAdminNotification } from "./notifications";

const MAX_RETRY_ATTEMPTS = 3;

interface ProcessingSummary {
  itemId: string;
  status: "completed" | "failed" | "processing" | "error";
  error?: string;
  enhancedImageUrl?: string;
  attempts: number;
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
              // Download the enhanced image
              const enhancedImage = await downloadEnhancedImage(downloadResponse.url);
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
            } catch (error) {
              console.error("- Error processing completed image:", error);
              await handleUpscalingFailure(
                item, 
                error instanceof Error ? error.message : "Error processing enhanced image"
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

async function handleUpscalingFailure(
  item: typeof items.$inferSelect,
  error: string
) {
  const attempts = (item.upscalingAttempts || 0) + 1;
  console.log(`Handling failure for item ${item.id} (Attempt ${attempts}/${MAX_RETRY_ATTEMPTS})`);

  await db
    .update(items)
    .set({
      status: "upscaling_failed",
      upscalingAttempts: attempts,
      updatedAt: new Date(),
    })
    .where(eq(items.id, item.id));

  if (attempts >= MAX_RETRY_ATTEMPTS) {
    console.log("Max retry attempts reached, notifying admin");
    await sendAdminNotification({
      subject: "Upscaling Failed - Max Retries Reached",
      message: `Item ${item.id} has failed upscaling after ${attempts} attempts.\nLast error: ${error}`,
      severity: "high",
    });
  } else {
    console.log(`Item marked as failed, ${MAX_RETRY_ATTEMPTS - attempts} retries remaining`);
  }
}
