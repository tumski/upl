import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const testRouter = router({
  health: publicProcedure.query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }),

  userCount: publicProcedure.query(async () => {
    // Placeholder count for now
    return {
      count: 42,
    };
  }),
});
