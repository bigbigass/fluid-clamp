import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import { PREFIXED_LOCALES, isLocale } from "@/lib/i18n/config";
import "../globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return PREFIXED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SiteShell locale={locale}>{children}</SiteShell>;
}
