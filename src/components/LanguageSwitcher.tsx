'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { routing } from '@/i18n/routing';
import { useParams } from 'next/navigation';


export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale || routing.defaultLocale;

  const handleLocaleChange = (locale: string) => {
     if (locale !== currentLocale)
      router.replace(pathname,  {locale: locale});
  };

  return (
    <Select onValueChange={handleLocaleChange} value={currentLocale}>
      <SelectTrigger className="w-[100px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {locale}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}