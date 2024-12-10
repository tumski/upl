import { router, publicProcedure } from "@/server/trpc";
import { uploadRouter } from "@/server/routers/upload";
import { ordersRouter } from "@/server/routers/orders";

export const appRouter = router({
  ping: publicProcedure.query(() => {
    return "pong";
  }),
  upload: uploadRouter,
  orders: ordersRouter,
});

export type AppRouter = typeof appRouter;
