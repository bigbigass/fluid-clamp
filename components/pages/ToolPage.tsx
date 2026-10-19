import type { Metadata } from "next";
import ClampTool, { type ToolState } from "@/components/ClampTool";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import PageBody from "@/components/PageBody";
import { getDictionary, type Locale } from "@/lib/i18n";
import { PAGE_PATHS, localizedPath, type PageKey, type ToolPageKey } from "@/lib/routes";
import { breadcrumbLd, buildMetadata, faqPageLd, webApplicationLd } from "@/lib/seo";

const TOOL_CONFIG: Record<ToolPageKey, { initial?: Partial<ToolState>; tailwindFirst?: boolean; related: PageKey[] }> = {
  home: { related: ["fluidTypography", "typeScale", "fluidSpacing", "tailwind"] },
  fluidTypography: { initial: { min: "18", max: "32" }, related: ["home", "typeScale", "tailwind"] },
  typeScale: { initial: { mode: "scale", min: "16", max: "20" }, related: ["home", "fluidTypography", "fluidSpacing"] },
  fluidSpacing: { initial: { mode: "spacing", min: "24", max: "64" }, related: ["home", "typeScale", "tailwind"] },
  tailwind: { initial: { min: "24", max: "48" }, tailwindFirst: true, related: ["home", "fluidSpacing", "typeScale"] },
};

export function toolPageMetadata(locale: Locale, page: ToolPageKey): Metadata {
  const p = getDictionary(locale).pages[page];
  return buildMetadata({ locale, path: PAGE_PATHS[page], title: p.title, description: p.description });
}

export default function ToolPage({ locale, page }: { locale: Locale; page: ToolPageKey }) {
  const d = getDictionary(locale);
  const p = d.pages[page];
  const config = TOOL_CONFIG[page];
  const path = PAGE_PATHS[page];
  const ld: Record<string, unknown>[] = [webApplicationLd(locale, path, p.h1, p.description), faqPageLd(locale, p.faq)];
  if (page !== "home") {
    ld.push(
      breadcrumbLd([
        { name: d.nav.home, path: "/", locale },
        { name: p.h1, path, locale },
      ]),
    );
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={ld} />
      {page !== "home" && (
        <Breadcrumbs
          label={d.nav.breadcrumb}
          items={[{ name: d.nav.home, href: localizedPath(locale, "/") }, { name: p.h1 }]}
        />
      )}
      <header className="mb-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{p.h1}</h1>
        <p className="mt-3 text-lg text-slate-700 dark:text-slate-300">{p.lead}</p>
      </header>
      <ClampTool locale={locale} t={d.tool} initial={config.initial} tailwindFirst={config.tailwindFirst} />
      <PageBody locale={locale} sections={p.sections} faq={p.faq} related={config.related} />
    </div>
  );
}
