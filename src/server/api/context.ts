import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { prisma } from '../db/client';

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    prisma,
    // Add more context properties as needed (e.g., session, headers)
    headers: opts.req.headers,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
