import { z } from "zod";
import { put } from "@vercel/blob";
import { router, publicProcedure } from "@/server/trpc";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/tiff"] as const;

export const uploadRouter = router({
  uploadImage: publicProcedure
    .input(
      z.object({
        file: z.object({
          type: z.enum(ALLOWED_FILE_TYPES),
          size: z.number().max(MAX_FILE_SIZE),
          base64: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { file } = input;

      // Convert base64 to Buffer
      const base64Data = file.base64.split(";base64,").pop();
      if (!base64Data) throw new Error("Invalid base64 data");
      const buffer = Buffer.from(base64Data, "base64");

      // Create Blob on the server side
      const blob = new Blob([buffer], { type: file.type });

      const { url } = await put(`${Date.now()}.${file.type.split("/")[1]}`, blob, {
        access: "public",
        contentType: file.type,
      });
      return { url };
    }),
});
