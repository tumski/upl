'use client';

import { useTranslations } from "next-intl";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/CheckoutButton";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OrderPage() {
  const t = useTranslations("order");
  const router = useRouter();
  const params = useParams<{ locale: string }>();

  const { data: order, isLoading } = trpc.orders.getById.useQuery(
    // Get order ID from localStorage
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
        <Card>
          <CardHeader>
            <CardTitle>{t("no_order.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t("no_order.description")}
            </p>
            <Link href={`/${params.locale}/upload`} passHref>
              <Button variant="default">
                {t("no_order.start_new")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: order.currency,
    }).format(amount / 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("summary.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Items */}
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.originalImageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.size} - {item.format}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatPrice(Number(item.price))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("summary.quantity", { count: item.amount })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium">{t("summary.total")}</span>
              <span className="font-medium">
                {formatPrice(Number(order.totalAmount))}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <CheckoutButton
                orderId={order.id}
                disabled={order.status !== "draft"}
              />
              <Link href={`/${params.locale}/upload`} passHref>
                <Button variant="outline" className="w-full">
                  {t("summary.add_more")}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
