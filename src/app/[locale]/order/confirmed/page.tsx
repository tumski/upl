'use client';

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderConfirmedPage() {
  const t = useTranslations("order");
  const params = useParams<{ locale: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <CardTitle>{t("confirmed.title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            {t("confirmed.description")}
          </p>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("confirmed.next_steps")}
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>{t("confirmed.step_upscaling")}</li>
              <li>{t("confirmed.step_printing")}</li>
              <li>{t("confirmed.step_shipping")}</li>
            </ul>
          </div>
          <div className="pt-4">
            <Link href={`/${params.locale}`} passHref>
              <Button variant="default" className="w-full">
                {t("confirmed.back_home")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 