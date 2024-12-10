"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface OrderItem {
  id: number;
  name: string;
  originalImageUrl: string;
  size: string;
  format: string;
  price: number;
  amount: number;
}

interface Order {
  id: number;
  totalAmount: number;
  currency: string;
  status: string;
  items: OrderItem[];
}

export default function OrderPage() {
  const t = useTranslations("Order");
  const router = useRouter();
  const params = useParams<{ locale: string; orderId: string }>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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
    setIsDeleting(true);
    try {
      await deleteItemMutation.mutateAsync({ id: itemId });
      setItemToDelete(null);
      
      // If this was the last item, redirect to upload
      if (order?.items?.length === 1) {
        localStorage.removeItem("currentOrderId");
        router.push(`/${params.locale}/upload`);
        return;
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      // TODO: Show error toast
    } finally {
      setIsDeleting(false);
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
        <h1 className="text-2xl font-bold mb-4">{t("orderNotFound")}</h1>
        <Button onClick={() => router.push(`/${params.locale}/upload`)}>{t("startNewOrder")}</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("orderConfirmation")}</h1>
      
      <div className="space-y-6">
        {order.items?.map((item) => (
          <Card key={item.id} className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-square w-full max-w-[200px]">
                <Image
                  src={item.originalImageUrl}
                  alt={item.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="space-y-2">
                <p>{t("size")}: {item.size}</p>
                <p>{t("format")}: {item.format}</p>
                <p>{t("price")}: {(Number(item.price) / 100).toFixed(2)} {order.currency}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/${params.locale}/format/${item.id}`)}
              >
                {t("edit")}
              </Button>
              <AlertDialog open={itemToDelete === item.id} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setItemToDelete(item.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteItem.title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteItem.description")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("deleteItem.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteItem(item.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t("deleteItem.confirm")
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-col space-y-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/${params.locale}/upload`)}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("addMoreItems")}
        </Button>

        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <span className="font-semibold">{t("total")}</span>
          <span className="text-xl font-bold">
            {(Number(order.totalAmount) / 100).toFixed(2)} {order.currency}
          </span>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={() => router.push(`/${params.locale}/checkout`)}
        >
          {t("proceedToCheckout")}
        </Button>
      </div>
    </div>
  );
} 