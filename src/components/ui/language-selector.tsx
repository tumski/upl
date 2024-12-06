'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';

const languages = {
  en: { name: 'English', flag: '🇬🇧' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
  da: { name: 'Dansk', flag: '🇩🇰' },
  pl: { name: 'Polski', flag: '🇵🇱' },
} as const;

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'en';

  const handleLocaleChange = (newLocale: keyof typeof languages) => {
    const newPathname = pathname?.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPathname || `/${newLocale}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0">
          <span className="text-base">
            {languages[currentLocale as keyof typeof languages].flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([locale, { name, flag }]) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale as keyof typeof languages)}
            className="cursor-pointer"
          >
            <span className="mr-2">{flag}</span>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
