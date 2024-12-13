'use client';

import { trpc } from "@/utils/trpc";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { OrderSummary, OrderError } from "./_components";

export default function OrderPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  const { data: order, isLoading } = trpc.orders.getById.useQuery(
    localStorage.getItem("currentOrderId") || "",
    {
      retry: false,
      onError: () => {
        router.push(`/${params.locale}`);
      },
    }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
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
      <OrderSummary order={order as any} showActions={false} />
    </div>
  );
}
