import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from '../config/locales';

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
  locales,
});

export const localePrefix = 'always'; // Configure if you want to always show the locale prefix
