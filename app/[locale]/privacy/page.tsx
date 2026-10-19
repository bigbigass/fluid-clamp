import InfoPage, { infoPageMetadata } from "@/components/pages/InfoPage";
import { toLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return infoPageMetadata(toLocale((await params).locale), "privacy");
}

export default async function Page({ params }: Props) {
  return <InfoPage locale={toLocale((await params).locale)} page="privacy" />;
}
