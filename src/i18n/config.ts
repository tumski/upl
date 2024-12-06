import { Pathnames } from 'next-intl/navigation';

export const pathnames = {
  '/': '/',
  '/upload': '/upload',
  '/configure': '/configure',
  '/orders': '/orders',
} satisfies Pathnames<typeof pathnames>;

// Use the default: `always`
export const localePrefix = 'always';

export type AppPathnames = keyof typeof pathnames;
