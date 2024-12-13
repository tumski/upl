'use client';

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OrderError() {
  const t = useTranslations("order");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("no_order.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {t("no_order.description")}
        </p>
        <Link href="/upload" passHref>
          <Button variant="default">
            {t("no_order.start_new")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
