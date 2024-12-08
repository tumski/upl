import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Link } from '@/i18n/routing';

export default function HomePage() {
  const t = useTranslations('HomePage');
  
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-24 md:py-32">
      <div className="container flex flex-col items-center text-center max-w-3xl">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          {t('title')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          {t('description')}
        </p>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/upload">
            {t('uploadCTA')}
          </Link>
        </Button>
      </div>
    </main>
  );
}