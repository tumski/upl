import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/server/session";

// Remove edge runtime as it's not compatible with Iron session
// export const runtime = "edge";

const handler = async (req: NextRequest) => {
  const res = NextResponse.next();
  
  // Get the Iron session
  const session = await getIronSession(req, res, sessionOptions);
  
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      return createContext({
        req,
        res,
        session,
        locale: req.headers.get('accept-language')?.split(',')[0] || 'en',
      });
    },
  });

  // Copy session cookie to the response
  const cookieHeader = res.headers.get('Set-Cookie');
  if (cookieHeader) {
    response.headers.set('Set-Cookie', cookieHeader);
  }

  return response;
};

export { handler as GET, handler as POST };
