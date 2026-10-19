import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import PageBody from "@/components/PageBody";
import { getDictionary, type Locale } from "@/lib/i18n";
import { PAGE_PATHS, localizedPath } from "@/lib/routes";
import { breadcrumbLd, buildMetadata, faqPageLd } from "@/lib/seo";

type InfoKey = "about" | "privacy";

export function infoPageMetadata(locale: Locale, page: InfoKey): Metadata {
  const p = getDictionary(locale).pages[page];
  return buildMetadata({ locale, path: PAGE_PATHS[page], title: p.title, description: p.description });
}

export default function InfoPage({ locale, page }: { locale: Locale; page: InfoKey }) {
  const d = getDictionary(locale);
  const p = d.pages[page];
  const path = PAGE_PATHS[page];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd
        data={[
          faqPageLd(locale, p.faq),
          breadcrumbLd([
            { name: d.nav.home, path: "/", locale },
            { name: p.h1, path, locale },
          ]),
        ]}
      />
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs label={d.nav.breadcrumb} items={[{ name: d.nav.home, href: localizedPath(locale, "/") }, { name: p.h1 }]} />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{p.h1}</h1>
        <p className="mt-3 text-lg text-slate-700 dark:text-slate-300">{p.lead}</p>
      </div>
      <PageBody
        locale={locale}
        sections={p.sections}
        faq={p.faq}
        related={["home", "fluidTypography", "typeScale", "fluidSpacing", "tailwind"]}
        relatedPairs={[]}
      />
    </div>
  );
}
