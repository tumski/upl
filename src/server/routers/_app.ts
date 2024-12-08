import { router, publicProcedure } from "@/server/trpc";

export const appRouter = router({
  ping: publicProcedure.query(() => {
    return "pong";
  }),
});

export type AppRouter = typeof appRouter;
