import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales: ["en", "de", "nl", "dk", "pl"],
  defaultLocale: "en",
});

// Export the middleware function
export default function middleware(request: NextRequest) {
  // Skip i18n middleware for Stripe webhook route
  if (request.nextUrl.pathname === "/api/webhooks/stripe") {
    return NextResponse.next();
  }

  // Apply i18n middleware for all other routes
  return intlMiddleware(request);
}

// Configure the middleware to match all routes except Stripe webhook
export const config = {
  matcher: ["/((?!api/webhooks/stripe|_next|.*\\..*).*)"],
};
