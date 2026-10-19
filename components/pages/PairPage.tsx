import type { Metadata } from "next";
import ClampTool from "@/components/ClampTool";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import PageBody from "@/components/PageBody";
import { PAIRS, type Pair } from "@/lib/clamp";
import { getDictionary, type Locale } from "@/lib/i18n";
import { pairContent } from "@/lib/pairContent";
import { localizedPath, pairPath } from "@/lib/routes";
import { breadcrumbLd, buildMetadata, faqPageLd, webApplicationLd } from "@/lib/seo";

export function isPair(value: string): value is Pair {
  return (PAIRS as readonly string[]).includes(value);
}

export function pairPageMetadata(locale: Locale, pair: Pair): Metadata {
  const c = pairContent(pair, locale);
  return buildMetadata({ locale, path: pairPath(pair), title: c.title, description: c.description });
}

export default function PairPage({ locale, pair }: { locale: Locale; pair: Pair }) {
  const d = getDictionary(locale);
  const c = pairContent(pair, locale);
  const path = pairPath(pair);
  const idx = PAIRS.indexOf(pair);
  const neighbours = PAIRS.filter((_, i) => i !== idx && Math.abs(i - idx) <= 3);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd
        data={[
          webApplicationLd(locale, path, c.h1, c.description),
          faqPageLd(locale, c.faq),
          breadcrumbLd([
            { name: d.nav.home, path: "/", locale },
            { name: c.h1, path, locale },
          ]),
        ]}
      />
      <Breadcrumbs label={d.nav.breadcrumb} items={[{ name: d.nav.home, href: localizedPath(locale, "/") }, { name: c.h1 }]} />
      <header className="mb-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.h1}</h1>
        <p className="mt-3 text-lg text-slate-700 dark:text-slate-300">{c.lead}</p>
      </header>
      <ClampTool locale={locale} t={d.tool} initial={{ min: String(c.min), max: String(c.max) }} />
      <PageBody
        locale={locale}
        sections={c.sections}
        faq={c.faq}
        related={["home", "fluidTypography", "typeScale", "fluidSpacing", "tailwind"]}
        relatedPairs={neighbours}
      />
    </div>
  );
}
