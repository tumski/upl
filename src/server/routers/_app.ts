import { router, publicProcedure } from "@/server/trpc";
import { uploadRouter } from "@/server/routers/upload";
import { ordersRouter } from "@/server/routers/orders";
import { topazRouter } from "@/server/routers/topaz";

export const appRouter = router({
  ping: publicProcedure.query(() => {
    return "pong";
  }),
  upload: uploadRouter,
  orders: ordersRouter,
  topaz: topazRouter,
});

export type AppRouter = typeof appRouter;
