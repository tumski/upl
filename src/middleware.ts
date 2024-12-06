import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'de', 'nl', 'da', 'pl'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Always use locale prefix in URLs
  localePrefix: 'always',
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(de|en|nl|da|pl)/:path*'],
};
