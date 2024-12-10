'use client';

import { useRouter, useParams } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import FormatForm, { PrintSize, PaperType } from '../_components/FormatForm';

export default function FormatItemPage() {
  const router = useRouter();
  const params = useParams<{ locale: string; itemId: string }>();

  // Get item data
  const { data: item, isLoading } = trpc.orders.getItemById.useQuery(params.itemId);

  if (isLoading || !item) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <FormatForm
      imageUrl={item.originalImageUrl}
      initialValues={{
        size: item.size as PrintSize,
        paperType: item.format as PaperType,
        // frameColor will be added when we add it to the schema
      }}
      onBack={() => router.push(`/${params.locale}/order/${item.orderId}`)}
      mode="edit"
      itemId={params.itemId}
      orderId={item.orderId}
    />
  );
} 