"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";
import { createMagicLinkSchema } from "@/utils/validation/magicLinks";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function LoginForm() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const createMagicLink = trpc.auth.createMagicLink.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const validatedInput = createMagicLinkSchema.parse({ email });
      createMagicLink.mutate(validatedInput);
    } catch (error) {
      setError(t("invalidEmail"));
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-xl font-semibold">{t("checkYourEmail")}</h2>
        <p className="text-gray-600">{t("magicLinkSentTo", { email })}</p>
        <Button
          variant="link"
          onClick={() => {
            setIsSubmitted(false);
            setEmail("");
          }}
        >
          {t("useAnotherEmail")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        <Input
          type="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          required
          disabled={createMagicLink.isLoading}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "email-error" : undefined}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={createMagicLink.isLoading}
      >
        {createMagicLink.isLoading ? t("sendingLink") : t("sendMagicLink")}
      </Button>
    </form>
  );
}
