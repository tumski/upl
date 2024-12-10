'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { useTranslations } from "next-intl";

interface CheckoutButtonProps {
  orderId: string;
  customerEmail?: string;
  disabled?: boolean;
}

export function CheckoutButton({ orderId, customerEmail, disabled }: CheckoutButtonProps) {
  const t = useTranslations("order");
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutSession = trpc.orders.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error) => {
      console.error("Checkout error:", error);
      router.push(`/${params.locale}/order/failed`);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleCheckout = async () => {
    setIsLoading(true);
    
    // Get the current origin for success/cancel URLs
    const origin = window.location.origin;
    
    createCheckoutSession.mutate({
      orderId,
      successUrl: `${origin}/${params.locale}/order/confirmed`,
      cancelUrl: `${origin}/${params.locale}/order/${orderId}`,
      customerEmail,
    });
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className="w-full"
    >
      {isLoading ? t("checkout.processing") : t("checkout.pay_now")}
    </Button>
  );
} 