'use client';

import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderItemCard } from '@/app/[locale]/order/_components';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OrdersPage() {
  const { data: session, isLoading: sessionLoading } = trpc.auth.getSession.useQuery();
  const { data: orders, isLoading: ordersLoading } = trpc.orders.getByCustomerId.useQuery(
    session?.user?.id ?? '',
    { 
      enabled: !!session?.user?.id,
      retry: false
    }
  );
  const t = useTranslations('orders');

  if (!session?.user && !sessionLoading) {
    redirect('/login');
  }

  if (sessionLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-muted-foreground text-center">
              {t('noOrders')}
            </p>
            <Link href="/upload" passHref>
              <Button>{t('startOrder')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {t('orderDate')}: {formatDate(new Date(order.createdAt))}
                </CardTitle>
                <span className="text-sm px-2 py-1 rounded-full bg-muted">
                  {t(`status.${order.status}`)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items?.map((item) => (
                <OrderItemCard
                  key={item.id}
                  item={item}
                  currency={order.currency}
                  showActions={false}
                />
              ))}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-medium">{t('total')}</span>
                <span className="font-medium">
                  {new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: order.currency,
                  }).format(order.totalAmount / 100)}
                </span>
              </div>
              <Link href={`/order/${order.id}`} passHref>
                <Button variant="outline" className="w-full">
                  {t('viewDetails')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
