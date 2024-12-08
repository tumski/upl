import { router, publicProcedure } from "@/server/trpc";
import { uploadRouter } from "@/server/routers/upload";

export const appRouter = router({
  ping: publicProcedure.query(() => {
    return "pong";
  }),
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
