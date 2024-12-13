import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { type IronSession } from "iron-session";

export type Context = {
  session: IronSession;
  locale: string;
};

export const sessionConfig = {
  cookieName: "upl_session",
  password: process.env.SESSION_SECRET || "development_secret_at_least_32_characters_long",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
