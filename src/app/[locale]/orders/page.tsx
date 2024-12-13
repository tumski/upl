'use client';

import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { trpc } from '@/utils/trpc';

export default function OrdersPage() {
  const { data: session, isLoading, error } = trpc.auth.getSession.useQuery();
  const t = useTranslations('orders');

  console.log('Orders page - session:', session, 'isLoading:', isLoading, 'error:', error);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!session?.user) {
    console.log('Orders page - redirecting to login, no session user');
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-700">
          {t('loggedInAs')}: {session.user.email}
        </p>
        <pre className="mt-4 p-2 bg-gray-100 rounded">
          Debug info:
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
