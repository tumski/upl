import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/config/locales';
import { pathnames } from './src/i18n/config';

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale,
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  localePrefix: 'always',
  // Configure available pathnames
  pathnames,
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
