'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './button';

export function Header() {
  const t = useTranslations('common.navigation');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';

  const navigation = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/upload`, label: t('upload') },
    { href: `/${locale}/orders`, label: t('orders') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <nav className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {navigation.map(({ href, label }) => (
            <Button
              key={href}
              variant={pathname === href ? 'default' : 'ghost'}
              size="sm"
              className="px-4"
              asChild
            >
              <Link href={href}>{label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
