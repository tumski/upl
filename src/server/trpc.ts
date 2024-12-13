import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { type IronSession, getIronSession } from "iron-session";
import { type SessionData, sessionOptions } from "./session";
import { type NextRequest, type NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

export type Context = {
  session: IronSession<SessionData>;
  locale: string;
  req?: NextRequest;
  res?: NextResponse;
};

export const createContext = async ({ 
  req, 
  res, 
  session,
  locale 
}: { 
  req?: NextRequest; 
  res?: NextResponse; 
  session?: IronSession<SessionData>;
  locale?: string;
}): Promise<Context> => {
  if (req && res) {
    const ironSession = session || await getIronSession(req, res, sessionOptions);
    // Get locale from URL or default to 'en'
    const urlLocale = req.nextUrl?.pathname?.split('/')[1];
    const finalLocale = routing.locales.includes(urlLocale as typeof routing.locales[number]) 
      ? urlLocale 
      : routing.defaultLocale;

    return {
      session: ironSession,
      locale: finalLocale,
      req,
      res,
    };
  }
  // Return minimal context for non-api calls
  return {
    session: session || {} as IronSession<SessionData>,
    locale: locale || routing.defaultLocale,
  };
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated'
    });
  }
  return next({
    ctx: {
      // Infers the session type
      session: ctx.session,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
