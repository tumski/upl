"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function VerifyPageClient({
  token,
  locale,
}: {
  token: string;
  locale: string;
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { data: session } = trpc.auth.getSession.useQuery(undefined, {
    enabled: isSuccess,
    refetchInterval: 500, // Poll every 500ms until we get the session
  });

  const verifyMagicLinkMutation = trpc.auth.verifyMagicLink.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    if (token) {
      verifyMagicLinkMutation.mutate({ token });
    }
  }, [token]);

  // Redirect only after we confirm the session is set
  useEffect(() => {
    if (session?.user) {
      router.push(`/${locale}/orders`);
    }
  }, [session?.user, locale]);

  return (
    <div className="container mx-auto max-w-md px-4 py-8 text-center">
      <h1 className="mb-4 text-2xl font-bold">{t("verifyingLink")}</h1>
      {(verifyMagicLinkMutation.isLoading || isSuccess) && (
        <p className="text-gray-600">{t("pleaseWait")}</p>
      )}
      {isSuccess && (
        <p className="text-green-600 mb-4">{t("loginSuccessful")}</p>
      )}
      {error && (
        <div className="space-y-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => router.push(`/${locale}/login`)}>
            {t("backToLogin")}
          </Button>
        </div>
      )}
    </div>
  );
}
