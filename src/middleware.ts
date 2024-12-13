import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/server/session";
import { routing } from "@/i18n/routing";

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
});

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/orders",
  "/settings",
  "/profile",
];

// Export the middleware function
export default async function middleware(request: NextRequest) {
  // Skip i18n middleware for Stripe and Topaz webhook routes
  if (request.nextUrl.pathname === "/api/webhooks/stripe" || request.nextUrl.pathname === "/api/webhooks/topaz") {
    return NextResponse.next();
  }

  // Create response and get session
  let response = NextResponse.next();
  const session = await getIronSession(request, response, sessionOptions);
  
  console.log('Session in middleware:', session, 'for path:', request.nextUrl.pathname);

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(`/${request.nextUrl.locale}${route}`)
  );

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !session.user) {
    console.log('Redirecting to login - no session user found');
    const loginUrl = new URL(`/${request.nextUrl.locale}/login`, request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    response = NextResponse.redirect(loginUrl);
  } else {
    // Apply i18n middleware for all other routes
    response = await intlMiddleware(request);
  }

  // Copy over the session cookie to the final response
  const cookieHeader = response.headers.get('Set-Cookie');
  if (cookieHeader) {
    response.headers.set('Set-Cookie', cookieHeader);
  }

  return response;
}

// Configure the middleware to match all routes except Stripe and Topaz webhooks
export const config = {
  matcher: [
    "/((?!api/webhooks/stripe|api/webhooks/topaz|_next|.*\\..*).*)",
  ],
};
