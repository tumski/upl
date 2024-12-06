import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const testRouter = router({
  health: publicProcedure.query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }),

  userCount: publicProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.user.count();
    return {
      count,
    };
  }),
});
