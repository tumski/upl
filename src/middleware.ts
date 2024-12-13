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
  // Skip i18n middleware for Stripe and Topaz webhook routes
  if (request.nextUrl.pathname === "/api/webhooks/stripe" || request.nextUrl.pathname === "/api/webhooks/topaz") {
    return NextResponse.next();
  }

  // Apply i18n middleware for all other routes
  return intlMiddleware(request);
}

// Configure the middleware to match all routes except Stripe and Topaz webhooks
export const config = {
  matcher: [
    "/((?!api/webhooks/stripe|api/webhooks/topaz|_next|.*\\..*).*)",
  ],
};
