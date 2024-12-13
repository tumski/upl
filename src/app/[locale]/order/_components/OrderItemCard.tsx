'use client';

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
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
import { useState } from "react";

interface OrderItemProps {
  item: {
    id: string | number;
    name: string;
    originalImageUrl: string;
    size: string;
    format: string;
    price: number;
    amount: number;
  };
  currency: string;
  onDelete?: (itemId: string) => Promise<void>;
  showActions?: boolean;
}

export function OrderItemCard({ item, currency, onDelete, showActions = true }: OrderItemProps) {
  const t = useTranslations("Order");
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(amount / 100);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(item.id.toString());
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full">
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
          <p>{t("price")}: {formatPrice(Number(item.price))}</p>
          <p>{t("summary.quantity", { count: item.amount })}</p>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/format/${item.id}`)}
          >
            {t("edit")}
          </Button>
          {onDelete && (
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
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
                    onClick={handleDelete}
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
          )}
        </CardFooter>
      )}
    </Card>
  );
}
