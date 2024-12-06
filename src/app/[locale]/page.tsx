import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/ui/layout';
import { FormattedCurrency } from '@/components/ui/formatted-currency';

type Props = {
  params: { locale: string };
};

export default async function HomePage({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations('home');
  const tCommon = await getTranslations('common.actions');

  return (
    <Layout>
      {/* Hero Section */}
      <section className="flex min-h-[70vh] flex-col items-center justify-center space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            {t('hero.title')}
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            {t('hero.subtitle')}
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href={`/${locale}/upload`}>{t('hero.cta')}</Link>
        </Button>
      </section>

      {/* Features Grid */}
      <section className="mx-auto grid max-w-5xl gap-8 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {/* AI Upscaling */}
        <div className="space-y-3 rounded-lg border p-6">
          <div className="text-3xl">🤖</div>
          <h3 className="text-xl font-semibold">{t('features.ai.title')}</h3>
          <p className="text-muted-foreground">{t('features.ai.description')}</p>
        </div>

        {/* Quality Prints */}
        <div className="space-y-3 rounded-lg border p-6">
          <div className="text-3xl">🖼️</div>
          <h3 className="text-xl font-semibold">{t('features.quality.title')}</h3>
          <p className="text-muted-foreground">{t('features.quality.description')}</p>
        </div>

        {/* Easy Process */}
        <div className="space-y-3 rounded-lg border p-6">
          <div className="text-3xl">✨</div>
          <h3 className="text-xl font-semibold">{t('features.easy.title')}</h3>
          <p className="text-muted-foreground">{t('features.easy.description')}</p>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-muted py-16 text-center">
        <div className="mx-auto max-w-4xl space-y-4">
          <h2 className="text-3xl font-bold">{t('pricing.title')}</h2>
          <p className="text-muted-foreground">{t('pricing.description')}</p>
          <div className="mt-8 flex flex-wrap items-baseline justify-center gap-2">
            <span className="text-muted-foreground">{t('pricing.startingAt')}</span>
            <FormattedCurrency amount={29.99} className="text-3xl font-bold tracking-tight" />
          </div>
          <Button size="lg" variant="outline" className="mt-8" asChild>
            <Link href={`/${locale}/upload`}>{tCommon('upload')}</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
