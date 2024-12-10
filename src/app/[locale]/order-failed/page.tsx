'use client';

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderFailedPage() {
  const t = useTranslations("order");
  const params = useParams<{ locale: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <CardTitle>{t("failed.title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            {t("failed.description")}
          </p>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("failed.help_text")}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Link href={`/${params.locale}/order`} passHref>
              <Button variant="default" className="w-full">
                {t("failed.try_again")}
              </Button>
            </Link>
            <Link href={`/${params.locale}`} passHref>
              <Button variant="outline" className="w-full">
                {t("failed.back_home")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 