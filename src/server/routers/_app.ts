import { router, publicProcedure } from "@/server/trpc";
import { uploadRouter } from "@/server/routers/upload";
import { ordersRouter } from "@/server/routers/orders";
import { topazRouter } from "@/server/routers/topaz";
import { authRouter } from "@/server/routers/auth";

export const appRouter = router({
  ping: publicProcedure.query(() => {
    return "pong";
  }),
  upload: uploadRouter,
  orders: ordersRouter,
  topaz: topazRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
