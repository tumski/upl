'use client';

import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { OrderSummary, OrderError } from "../_components";

export default function OrderPage() {
  const router = useRouter();
  const params = useParams<{ locale: string; orderId: string }>();
  
  // Get order ID from URL or localStorage
  const orderId = params.orderId || (typeof window !== 'undefined' ? localStorage.getItem("currentOrderId") : null);
  
  // Get tRPC utils for cache invalidation
  const utils = trpc.useUtils();
  
  // Use tRPC query and mutations
  const { data: order, isLoading: isOrderLoading } = trpc.orders.getById.useQuery(
    orderId || '',
    {
      enabled: !!orderId,
    }
  );

  const deleteItemMutation = trpc.orders.deleteItem.useMutation({
    onSuccess: async () => {
      // Invalidate the order query to trigger a refetch
      await utils.orders.getById.invalidate(orderId || '');
    },
  });

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItemMutation.mutateAsync({ id: itemId });
      
      // If this was the last item, redirect to upload
      if (order?.items?.length === 1) {
        localStorage.removeItem("currentOrderId");
        router.push(`/${params.locale}/upload`);
        return;
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      // TODO: Show error toast
    }
  };

  // Redirect if no order ID
  if (!orderId) {
    router.push(`/${params.locale}/upload`);
    return null;
  }

  if (isOrderLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OrderError />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderSummary 
        order={order as any} 
        onDeleteItem={handleDeleteItem}
        showActions={true}
      />
    </div>
  );
}