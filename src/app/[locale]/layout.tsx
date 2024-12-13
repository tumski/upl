import '@/app/globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Navigation } from '@/components/Navigation';
import { TRPCProvider } from '@/components/TRPCProvider';
 
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }
 
  const messages = await getMessages();
 
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <TRPCProvider>
          <NextIntlClientProvider messages={messages}>
            <div className="relative flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                  <LanguageSwitcher />
                  <Navigation />
                </div>
              </header>
              <div className="flex-1">{children}</div>
            </div>
          </NextIntlClientProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}