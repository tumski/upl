import { VerifyPageClient } from "./verify-page";

export default async function VerifyPage({
  params,
}: {
  params: { token: string; locale: string };
}) {
  return <VerifyPageClient token={params.token} locale={params.locale} />
}
