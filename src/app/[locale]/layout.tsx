import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
 
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
        <LanguageSwitcher />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}