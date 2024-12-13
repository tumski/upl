import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { items } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { enhanceImage } from "@/utils/topaz";
import { sendAdminNotification } from "@/utils/notifications";

export const topazRouter = router({
  startUpscaling: publicProcedure
    .input(
      z.object({
        itemId: z.string(),
        outputHeight: z.number().optional(),
        outputWidth: z.number().optional(),
        outputFormat: z.string().optional(),
        faceEnhancement: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const item = await db.query.items.findFirst({
        where: eq(items.id, input.itemId),
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Item not found",
        });
      }

      if (item.upscalingAttempts >= 3) {
        await sendAdminNotification({
          subject: "Upscaling Failed - Max Retries Reached",
          message: `Item ${item.id} has failed upscaling 3 times. Manual intervention required.`,
          severity: "high",
        });

        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Max retry attempts reached",
        });
      }

      try {
        const processId = await enhanceImage({
          imageUrl: item.originalImageUrl,
          outputHeight: input.outputHeight,
          outputWidth: input.outputWidth,
          outputFormat: input.outputFormat,
          faceEnhancement: input.faceEnhancement,
        });

        await db
          .update(items)
          .set({
            topazProcessId: processId,
            status: "upscaling",
            upscalingAttempts: (item.upscalingAttempts || 0) + 1,
            updatedAt: new Date(),
          })
          .where(eq(items.id, item.id));

        return { processId };
      } catch (error) {
        console.error("Error starting upscaling:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start upscaling",
        });
      }
    }),
});
