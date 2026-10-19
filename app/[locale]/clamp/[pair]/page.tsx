import { notFound } from "next/navigation";
import PairPage, { isPair, pairPageMetadata } from "@/components/pages/PairPage";
import { PAIRS } from "@/lib/clamp";
import { toLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; pair: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PAIRS.map((pair) => ({ pair }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, pair } = await params;
  return isPair(pair) ? pairPageMetadata(toLocale(locale), pair) : {};
}

export default async function Page({ params }: Props) {
  const { locale, pair } = await params;
  if (!isPair(pair)) notFound();
  return <PairPage locale={toLocale(locale)} pair={pair} />;
}
