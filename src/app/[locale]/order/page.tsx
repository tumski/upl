'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function OrderIndexPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  useEffect(() => {
    // Get order ID from localStorage
    const orderId = typeof window !== 'undefined' ? localStorage.getItem("currentOrderId") : null;
    
    if (!orderId) {
      // If no order ID is found, redirect to upload
      router.push(`/${params.locale}/upload`);
      return;
    }

    // If we have an order ID, redirect to the order page
    router.push(`/${params.locale}/order/${orderId}`);
  }, [router, params.locale]);

  return (
    <div className="container py-8 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
