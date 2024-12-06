import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const testRouter = router({
  health: publicProcedure.input(z.void()).query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }),

  userCount: publicProcedure.input(z.void()).query(async ({ ctx }) => {
    const count = await ctx.prisma.user.count();
    return {
      count,
    };
  }),
});
