'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { trpc } from '@/utils/trpc';

export default function OrderConfirmedPage() {
  const t = useTranslations('Order');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const { data: orderStatus, isLoading } = trpc.orders.checkSessionStatus.useQuery(
    { sessionId: sessionId! },
    {
      enabled: !!sessionId,
      refetchInterval: (data) => (data?.status === 'paid' ? false : 2000),
      onSuccess: (data) => {
        if (data?.status === 'paid') {
          router.push(`/${params.locale}/order/${data.orderId}`);
        }
      },
    }
  );

  if (!sessionId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <CardTitle>{t('confirmed.error.title')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              {t('confirmed.error.description')}
            </p>
            <div className="pt-4">
              <Link href={`/${params.locale}`} passHref>
                <Button variant="default" className="w-full">
                  {t('confirmed.back_home')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          {isLoading ? (
            <Loader2 className="w-16 h-16 mx-auto text-primary mb-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
          )}
          <CardTitle>{t('confirmed.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            {t('confirmed.description')}
          </p>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('confirmed.next_steps')}
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>{t('confirmed.step_upscaling')}</li>
              <li>{t('confirmed.step_printing')}</li>
              <li>{t('confirmed.step_shipping')}</li>
            </ul>
          </div>
          <div className="pt-4">
            <Link href={`/${params.locale}`} passHref>
              <Button variant="default" className="w-full">
                {t('confirmed.back_home')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}