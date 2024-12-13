'use client';

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderItemCard } from "./OrderItemCard";
import { CheckoutButton } from "@/components/CheckoutButton";
import Link from "next/link";

interface OrderSummaryProps {
  order: {
    id: string;
    totalAmount: number;
    currency: string;
    status: string;
    items: Array<{
      id: string | number;
      name: string;
      originalImageUrl: string;
      size: string;
      format: string;
      price: number;
      amount: number;
    }>;
  };
  onDeleteItem?: (itemId: string) => Promise<void>;
  showActions?: boolean;
}

export function OrderSummary({ order, onDeleteItem, showActions = true }: OrderSummaryProps) {
  const t = useTranslations("Order");

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: order.currency,
    }).format(amount / 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("summary.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {order.items.map((item) => (
            <OrderItemCard
              key={item.id}
              item={item}
              currency={order.currency}
              onDelete={onDeleteItem}
              showActions={showActions}
            />
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-6">
            <span className="font-medium">{t("summary.total")}</span>
            <span className="font-medium">
              {formatPrice(Number(order.totalAmount))}
            </span>
          </div>

          <div className="space-y-4">
            <CheckoutButton
              orderId={order.id}
              disabled={order.status !== "draft"}
            />
            <Link href="/upload" passHref>
              <Button variant="outline" className="w-full flex items-center justify-center">
                <Plus className="mr-2 h-4 w-4" />
                {t("summary.add_more")}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
