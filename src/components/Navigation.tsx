'use client';

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useParams, useRouter } from "next/navigation";

export function Navigation() {
  const { data: session, isLoading } = trpc.auth.getSession.useQuery();
  const logout = trpc.auth.logout.useMutation();
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const t = useTranslations('Navigation');

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push(`/${params.locale}/login`);
  };

  if (isLoading) {
    return null;
  }

  return (
    <nav className="flex items-center gap-4 ml-auto">
      {session?.user ? (
        <>
          <Button variant="ghost" asChild>
            <Link href={`/orders`}>{t('orders')}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href={`/upload`}>{t('upload')}</Link>
          </Button>
          <Button variant="ghost" onClick={handleLogout}>
            {t('logout')}
          </Button>
        </>
      ) : (
        <Button variant="ghost" asChild>
          <Link href={`/login`}>{t('login')}</Link>
        </Button>
      )}
    </nav>
  );
}
