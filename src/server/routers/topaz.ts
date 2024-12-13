import { router, publicProcedure } from "@/server/trpc";
import { db } from "@/server/db";
import { items } from "@/server/db/schema";
import { z } from "zod";
import { eq, and, lte } from "drizzle-orm";
import { enhanceImage, checkEnhancementStatus, downloadEnhancedImage } from "@/utils/topaz";
import { put } from "@vercel/blob";
import { sendAdminNotification } from "@/utils/notifications";

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_HOURS = 1;

export const topazRouter = router({
  // Start upscaling process for an order item
  startUpscaling: publicProcedure
    .input(
      z.object({
        itemId: z.string().uuid(),
        outputHeight: z.number().optional(),
        outputWidth: z.number().optional(),
        outputFormat: z.enum(["jpg", "png"]).optional(),
        faceEnhancement: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Get the item
      const item = await db.query.items.findFirst({
        where: eq(items.id, input.itemId),
      });

      if (!item) {
        throw new Error("Item not found");
      }

      if (item.upscalingAttempts >= MAX_RETRY_ATTEMPTS) {
        await sendAdminNotification({
          subject: "Upscaling Failed - Max Retries Reached",
          message: `Item ${item.id} has failed upscaling ${MAX_RETRY_ATTEMPTS} times. Manual intervention required.`,
          severity: "high",
        });

        throw new Error("Max retry attempts reached");
      }

      try {
        // Start upscaling process
        const enhanceResponse = await enhanceImage({
          imageUrl: item.originalImageUrl,
          outputHeight: input.outputHeight,
          outputWidth: input.outputWidth,
          outputFormat: input.outputFormat,
          faceEnhancement: input.faceEnhancement,
        });

        // Update item with process ID
        await db
          .update(items)
          .set({
            topazProcessId: enhanceResponse.process_id,
            status: "upscaling",
            upscalingAttempts: item.upscalingAttempts + 1,
            lastUpscalingAttempt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(items.id, input.itemId));

        return enhanceResponse;
      } catch (error) {
        console.error("Error starting upscaling:", error);
        throw new Error("Failed to start upscaling");
      }
    }),

  // Check upscaling status for an item
  checkStatus: publicProcedure
    .input(
      z.object({
        itemId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      // Get the item
      const item = await db.query.items.findFirst({
        where: eq(items.id, input.itemId),
      });

      if (!item || !item.topazProcessId) {
        throw new Error("Item not found or no Topaz process ID");
      }

      // Check status
      const status = await checkEnhancementStatus(item.topazProcessId);

      // If completed, download and save the enhanced image
      if (status.status === "completed" && status.result_url) {
        try {
          // Download the enhanced image
          const enhancedImageBlob = await downloadEnhancedImage(status.result_url);

          // Upload to Vercel Blob
          const { url } = await put(
            `enhanced-${item.id}.${status.filename.split(".").pop() || "jpg"}`,
            enhancedImageBlob,
            {
              access: "public",
            }
          );

          // Update item with enhanced image URL
          await db
            .update(items)
            .set({
              enhancedImageUrl: url,
              status: "upscaled",
              updatedAt: new Date(),
            })
            .where(eq(items.id, input.itemId));

          return {
            ...status,
            enhancedImageUrl: url,
          };
        } catch (error) {
          console.error("Error saving enhanced image:", error);
          // Update item status to failed
          await db
            .update(items)
            .set({
              status: "upscaling_failed",
              updatedAt: new Date(),
            })
            .where(eq(items.id, input.itemId));
          throw error;
        }
      }

      // If failed, update item status
      if (status.status === "failed") {
        await db
          .update(items)
          .set({
            status: "upscaling_failed",
            updatedAt: new Date(),
          })
          .where(eq(items.id, input.itemId));
      }

      return status;
    }),

  // Retry failed upscaling items
  retryFailedItems: publicProcedure.mutation(async () => {
    const retryableItems = await db.query.items.findMany({
      where: and(
        eq(items.status, "upscaling_failed"),
        lte(items.upscalingAttempts, MAX_RETRY_ATTEMPTS),
        lte(
          items.lastUpscalingAttempt,
          new Date(Date.now() - RETRY_DELAY_HOURS * 60 * 60 * 1000)
        )
      ),
    });

    const results = await Promise.allSettled(
      retryableItems.map(async (item) => {
        try {
          await topazRouter.startUpscaling({ input: { itemId: item.id } });
          return { itemId: item.id, status: "retried" };
        } catch (error) {
          return { itemId: item.id, status: "failed", error };
        }
      })
    );

    return {
      totalItems: retryableItems.length,
      results,
    };
  }),
});
