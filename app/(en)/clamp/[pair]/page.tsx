import { notFound } from "next/navigation";
import PairPage, { isPair, pairPageMetadata } from "@/components/pages/PairPage";
import { PAIRS } from "@/lib/clamp";

type Props = { params: Promise<{ pair: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PAIRS.map((pair) => ({ pair }));
}

export async function generateMetadata({ params }: Props) {
  const { pair } = await params;
  return isPair(pair) ? pairPageMetadata("en", pair) : {};
}

export default async function Page({ params }: Props) {
  const { pair } = await params;
  if (!isPair(pair)) notFound();
  return <PairPage locale="en" pair={pair} />;
}
